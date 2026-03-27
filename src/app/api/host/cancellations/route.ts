import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

const parseBody = async (request: Request) => {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return null
  return body as Record<string, unknown>
}

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

  const cancellations = await prisma.cancellationRequest.findMany({
    where: { hostId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      bookingId: true,
      status: true,
      reason: true,
      suggestionPropertyId: true,
      createdAt: true,
      respondedAt: true,
    },
  })

  return NextResponse.json({ cancellations })
}

export async function POST(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = await parseBody(request)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const hostId = typeof body.hostId === "string" ? body.hostId : ""
  const bookingId = typeof body.bookingId === "string" ? body.bookingId : ""
  const reason = typeof body.reason === "string" ? body.reason : ""
  const suggestionPropertyId =
    typeof body.suggestionPropertyId === "string" && body.suggestionPropertyId.trim()
      ? body.suggestionPropertyId
      : null

  if (!hostId || !bookingId || !reason) {
    return NextResponse.json({ error: "Invalid cancellation request" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { userId: true, property: { select: { userId: true } } },
  })

  if (!booking || booking.property?.userId !== hostId) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const existing = await prisma.cancellationRequest.findFirst({
    where: { bookingId, status: "PENDING" },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ error: "A pending cancellation already exists" }, { status: 400 })
  }

  const created = await prisma.cancellationRequest.create({
    data: {
      bookingId,
      hostId,
      guestId: booking.userId,
      reason,
      suggestionPropertyId,
    },
    select: {
      id: true,
      bookingId: true,
      status: true,
      reason: true,
      suggestionPropertyId: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ cancellation: created })
}

export async function PATCH(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = await parseBody(request)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const cancellationId = typeof body.cancellationId === "string" ? body.cancellationId : ""
  const guestId = typeof body.guestId === "string" ? body.guestId : ""
  const action = typeof body.action === "string" ? body.action.toUpperCase() : ""

  if (!cancellationId || !guestId || !["ACCEPT", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Invalid response" }, { status: 400 })
  }

  const cancellation = await prisma.cancellationRequest.findUnique({
    where: { id: cancellationId },
    select: { id: true, status: true, bookingId: true, guestId: true },
  })

  if (!cancellation || cancellation.guestId !== guestId) {
    return NextResponse.json({ error: "Cancellation not found" }, { status: 404 })
  }

  if (cancellation.status !== "PENDING") {
    return NextResponse.json({ error: "Cancellation already resolved" }, { status: 400 })
  }

  const nextStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED"

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCancellation = await tx.cancellationRequest.update({
      where: { id: cancellationId },
      data: { status: nextStatus as "ACCEPTED" | "REJECTED", respondedAt: new Date() },
      select: { id: true, status: true, bookingId: true, respondedAt: true },
    })

    if (nextStatus === "ACCEPTED") {
      await tx.booking.update({
        where: { id: cancellation.bookingId },
        data: { status: "CANCELLED", paymentStatus: "REFUNDED" },
      })
    }

    return updatedCancellation
  })

  return NextResponse.json({ cancellation: updated })
}

