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

  const transactions = await prisma.hostWalletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      amount: true,
      note: true,
      createdAt: true,
      actorUserId: true,
      sourceType: true,
      sourceUserId: true,
      destinationType: true,
      destinationUserId: true,
    },
  })

  return NextResponse.json({ transactions })
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

  const userId = typeof body.userId === "string" ? body.userId : ""
  const actorUserId = typeof body.actorUserId === "string" ? body.actorUserId : userId
  const type = typeof body.type === "string" ? body.type : ""
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount)
  const note = typeof body.note === "string" ? body.note : undefined
  const sourceType = typeof body.sourceType === "string" ? body.sourceType : ""
  const sourceUserId = typeof body.sourceUserId === "string" ? body.sourceUserId : undefined
  const destinationType = typeof body.destinationType === "string" ? body.destinationType : ""
  const destinationUserId = typeof body.destinationUserId === "string" ? body.destinationUserId : undefined

  if (!userId || !type || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid transaction data" }, { status: 400 })
  }

  if (!["PAYMENT", "WITHDRAWAL", "TRANSFER"].includes(type)) {
    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
  }

  const created = await prisma.$transaction(async (tx) => {
    const defaultsByType = () => {
      if (type === "TRANSFER") {
        return {
          sourceType: "HOST",
          sourceUserId: userId,
          destinationType: "CLIENT",
          destinationUserId: userId,
        }
      }
      if (type === "WITHDRAWAL") {
        return {
          sourceType: "HOST",
          sourceUserId: userId,
          destinationType: "SYSTEM",
          destinationUserId: undefined,
        }
      }
      return {
        sourceType: "USER",
        sourceUserId: undefined,
        destinationType: "HOST",
        destinationUserId: userId,
      }
    }
    const defaults = defaultsByType()
    const transaction = await tx.hostWalletTransaction.create({
      data: {
        userId,
        actorUserId: actorUserId || userId,
        type: type as "PAYMENT" | "WITHDRAWAL" | "TRANSFER",
        amount,
        note,
        sourceType: (sourceType || defaults.sourceType) as
          | "USER"
          | "APP"
          | "HOST"
          | "CLIENT"
          | "SYSTEM",
        sourceUserId: sourceUserId ?? defaults.sourceUserId,
        destinationType: (destinationType || defaults.destinationType) as
          | "USER"
          | "APP"
          | "HOST"
          | "CLIENT"
          | "SYSTEM",
        destinationUserId: destinationUserId ?? defaults.destinationUserId,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        note: true,
        createdAt: true,
        actorUserId: true,
        sourceType: true,
        sourceUserId: true,
        destinationType: true,
        destinationUserId: true,
      },
    })

    if (type === "TRANSFER") {
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { increment: amount },
        },
      })
    }

    return transaction
  })

  return NextResponse.json({ transaction: created })
}
