import { PrismaClient } from "@prisma/client"

export const releaseBookingPayouts = async (prisma: PrismaClient, hostId?: string) => {
  const now = new Date()
  const where = {
    status: "CONFIRMED" as const,
    paymentStatus: "PROCESSING" as const,
    checkOut: { lte: now },
    ...(hostId ? { property: { userId: hostId } } : {}),
  }

  const eligible = await prisma.booking.findMany({
    where,
    select: {
      id: true,
      userId: true,
      propertyId: true,
      hostPayout: true,
      checkOut: true,
      property: {
        select: {
          userId: true,
          propertyName: true,
        },
      },
    },
  })

  if (eligible.length === 0) return 0

  await prisma.$transaction(async (tx) => {
    for (const booking of eligible) {
      const payout = Number(booking.hostPayout || 0)
      if (!Number.isFinite(payout) || payout <= 0) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED", paymentStatus: "COMPLETED" },
        })
        continue
      }

      await tx.hostWalletTransaction.create({
        data: {
          userId: booking.property.userId,
          actorUserId: null,
          type: "PAYMENT",
          amount: payout,
          note: `Payout for booking ${booking.id}`,
          sourceType: "SYSTEM",
          sourceUserId: undefined,
          destinationType: "HOST",
          destinationUserId: booking.property.userId,
        },
      })

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED", paymentStatus: "COMPLETED" },
      })

      await tx.notification.create({
        data: {
          userId: booking.property.userId,
          role: "host",
          category: "payment",
          title: "Payout released",
          message: `Your payout for ${booking.property.propertyName} is now available.`,
          bookingId: booking.id,
          propertyId: booking.propertyId,
        },
      })

      await tx.notification.create({
        data: {
          userId: booking.userId,
          role: "client",
          category: "payment",
          title: "Payment released",
          message: `Your booking payment for ${booking.property.propertyName} was released to the host after checkout.`,
          bookingId: booking.id,
          propertyId: booking.propertyId,
        },
      })
    }
  })

  return eligible.length
}

