import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { releaseBookingPayouts } from "@/lib/booking-payout"

const toNumber = (value: unknown) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : NaN
}

const isBetweenOneAndFive = (value: number) => value >= 1 && value <= 5

export async function GET(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  await releaseBookingPayouts(prisma)

  const [writtenReviews, pendingBookings] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      orderBy: { reviewDate: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
          },
        },
        property: {
          select: {
            id: true,
            propertyName: true,
            userId: true,
          },
        },
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        userId,
        status: "COMPLETED",
        reviews: { none: { userId } },
      },
      orderBy: { checkIn: "desc" },
      include: {
        property: {
          select: {
            id: true,
            propertyName: true,
            userId: true,
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    written: writtenReviews,
    pending: pendingBookings,
  })
}

export async function POST(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const {
    userId,
    bookingId,
    stars,
    rating,
    comment,
    cleanliness,
    accuracy,
    communication,
    location,
    checkin,
    value,
    hostRating,
  } = body as Record<string, unknown>

  if (!userId || !bookingId || !comment || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const parsedStars = toNumber(stars)
  const parsedCleanliness = toNumber(cleanliness)
  const parsedAccuracy = toNumber(accuracy)
  const parsedCommunication = toNumber(communication)
  const parsedLocation = toNumber(location)
  const parsedCheckin = toNumber(checkin)
  const parsedValue = toNumber(value)
  const parsedHostRating = toNumber(hostRating)

  const scores = [
    parsedStars,
    parsedCleanliness,
    parsedAccuracy,
    parsedCommunication,
    parsedLocation,
    parsedCheckin,
    parsedValue,
    parsedHostRating,
  ]

  if (scores.some((score) => !isBetweenOneAndFive(score))) {
    return NextResponse.json({ error: "Ratings must be between 1 and 5" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: String(bookingId) },
    include: { reviews: true },
  })

  if (!booking || booking.userId !== userId) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.status !== "COMPLETED") {
    return NextResponse.json({ error: "Booking is not completed" }, { status: 400 })
  }

  if (booking.reviews.some((review) => review.userId === userId)) {
    return NextResponse.json({ error: "Review already exists for this booking" }, { status: 409 })
  }

  const created = await prisma.review.create({
    data: {
      stars: parsedStars,
      rating: String(rating),
      comment: String(comment),
      cleanliness: parsedCleanliness,
      accuracy: parsedAccuracy,
      communication: parsedCommunication,
      location: parsedLocation,
      checkin: parsedCheckin,
      value: parsedValue,
      hostRating: parsedHostRating,
      userId: String(userId),
      bookingId: String(bookingId),
      propertyId: booking.propertyId,
    },
    include: {
      property: {
        select: {
          id: true,
          propertyName: true,
          userId: true,
        },
      },
      booking: {
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
        },
      },
    },
  })


  await prisma.notification.create({
    data: {
      userId: created.property.userId,
      role: "host",
      category: "review",
      title: "New review received",
      message: `A guest reviewed ${created.property.propertyName}.`,
      bookingId: created.booking?.id ?? null,
      propertyId: created.property.id,
    },
  })

  return NextResponse.json({ review: created })
}
