import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

const DAY_MS = 24 * 60 * 60 * 1000
const RESERVATION_DAYS = 3

type BookingAction = "reserve" | "book"

const toDateOnly = (value: Date) =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))

const computeNights = (checkIn: Date, checkOut: Date) => {
  const inDate = toDateOnly(checkIn)
  const outDate = toDateOnly(checkOut)
  const diff = outDate.getTime() - inDate.getTime()
  if (Number.isNaN(diff) || diff <= 0) return 0
  return Math.ceil(diff / DAY_MS)
}

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS)

export async function POST(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 })
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const userId = String(body.userId || "").trim()
    const propertyId = String(body.propertyId || "").trim()
    const action = String(body.action || "").trim().toLowerCase() as BookingAction
    const checkInRaw = String(body.checkIn || "").trim()
    const checkOutRaw = String(body.checkOut || "").trim()
    const guests = Number(body.guests || 1)

    if (!userId || !propertyId || !checkInRaw || !checkOutRaw) {
      return NextResponse.json(
        { error: "userId, propertyId, checkIn, and checkOut are required." },
        { status: 400 }
      )
    }

    if (action !== "reserve" && action !== "book") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 })
    }

    const checkIn = new Date(checkInRaw)
    const checkOut = new Date(checkOutRaw)
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: "Invalid dates supplied." }, { status: 400 })
    }

    const nights = computeNights(checkIn, checkOut)
    if (!nights) {
      return NextResponse.json({ error: "Checkout must be after check-in." }, { status: 400 })
    }

    const [property, user] = await Promise.all([
      prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          propertyName: true,
          price: true,
          minNights: true,
          userId: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, walletBalance: true },
      }),
    ])

    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    if (nights < (property.minNights ?? 1)) {
      return NextResponse.json(
        { error: `Minimum stay is ${property.minNights} nights.` },
        { status: 400 }
      )
    }

    const subtotal = Number(property.price || 0) * nights
    const platformFee = Math.round(subtotal * 0.12)
    const totalAmount = subtotal + platformFee

    if (user.walletBalance < totalAmount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance for this reservation." },
        { status: 400 }
      )
    }

    const now = new Date()
    const reservationCutoff = new Date(now.getTime() - RESERVATION_DAYS * DAY_MS)

    const expiredReservations = await prisma.booking.findMany({
      where: {
        propertyId,
        status: "PENDING",
        createdAt: { lt: reservationCutoff },
      },
      select: { id: true },
    })

    if (expiredReservations.length > 0) {
      await prisma.booking.updateMany({
        where: { id: { in: expiredReservations.map((item) => item.id) } },
        data: { status: "CANCELLED", paymentStatus: "CANCELLED" },
      })
    }

    const overlapping = await prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
        checkIn: true,
        checkOut: true,
      },
    })

    const activeReservation = overlapping.find((booking) => {
      if (booking.status !== "PENDING") return false
      return booking.createdAt >= reservationCutoff
    })

    if (activeReservation && activeReservation.userId !== userId) {
      return NextResponse.json(
        { error: "This property is currently reserved for those dates." },
        { status: 409 }
      )
    }

    const confirmedConflict = overlapping.some((booking) => booking.status === "CONFIRMED")
    if (confirmedConflict) {
      return NextResponse.json(
        { error: "This property is already booked for those dates." },
        { status: 409 }
      )
    }

    const reservationExpiry = addDays(now, RESERVATION_DAYS)

    const result = await prisma.$transaction(async (tx) => {
      if (action === "reserve") {
        const existingReservation =
          activeReservation &&
          activeReservation.userId === userId &&
          activeReservation.checkIn.getTime() === checkIn.getTime() &&
          activeReservation.checkOut.getTime() === checkOut.getTime()
            ? activeReservation
            : null

        const booking = existingReservation
          ? await tx.booking.findUnique({ where: { id: existingReservation.id } })
          : await tx.booking.create({
              data: {
                userId,
                propertyId,
                checkIn,
                checkOut,
                guests: Number.isFinite(guests) && guests > 0 ? guests : 1,
                status: "PENDING",
                paymentStatus: "PENDING",
                totalAmount,
                platformFee,
                hostPayout: subtotal,
              },
            })

        await tx.notification.create({
          data: {
            userId,
            role: "client",
            category: "reservation",
            title: "Reservation placed",
            message: `Your reservation for ${property.propertyName} expires on ${reservationExpiry.toDateString()}.`,
            bookingId: booking?.id ?? null,
            propertyId,
          },
        })

        return { booking, walletBalance: user.walletBalance }
      }

      let booking = null as null | { id: string }
      if (activeReservation && activeReservation.userId === userId) {
        booking = await tx.booking.update({
          where: { id: activeReservation.id },
          data: {
            status: "CONFIRMED",
            paymentStatus: "COMPLETED",
            totalAmount,
            platformFee,
            hostPayout: subtotal,
          },
        })
      } else {
        booking = await tx.booking.create({
          data: {
            userId,
            propertyId,
            checkIn,
            checkOut,
            guests: Number.isFinite(guests) && guests > 0 ? guests : 1,
            status: "CONFIRMED",
            paymentStatus: "COMPLETED",
            totalAmount,
            platformFee,
            hostPayout: subtotal,
          },
        })
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: totalAmount } },
        select: { walletBalance: true },
      })

      await tx.notification.create({
        data: {
          userId,
          role: "client",
          category: "booking",
          title: "Booking confirmed",
          message: `Your booking for ${property.propertyName} is confirmed.`,
          bookingId: booking.id,
          propertyId,
        },
      })

      await tx.notification.create({
        data: {
          userId: property.userId,
          role: "host",
          category: "booking",
          title: "New booking",
          message: `A guest booked ${property.propertyName}.`,
          bookingId: booking.id,
          propertyId,
        },
      })

      return { booking, walletBalance: updatedUser.walletBalance }
    })

    return NextResponse.json({
      booking: result.booking,
      walletBalance: result.walletBalance,
      expiresAt: action === "reserve" ? reservationExpiry.toISOString() : null,
    })
  } catch (error) {
    console.error("Booking POST error:", error)
    return NextResponse.json({ error: "Unable to process booking." }, { status: 500 })
  }
}
