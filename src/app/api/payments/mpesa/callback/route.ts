import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

type CallbackBody = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string
      CheckoutRequestID?: string
      ResultCode?: number
      ResultDesc?: string
      CallbackMetadata?: {
        Item?: Array<{ Name?: string; Value?: unknown }>
      }
    }
  }
}

const getMetadataValue = (items: Array<{ Name?: string; Value?: unknown }>, key: string) => {
  const found = items.find((item) => item.Name === key)
  return found?.Value
}

export async function POST(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as CallbackBody | null
  if (!body?.Body?.stkCallback) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const callback = body.Body.stkCallback
  const checkoutRequestId = String(callback.CheckoutRequestID || "")
  const resultCode = Number(callback.ResultCode ?? 1)
  const resultDesc = String(callback.ResultDesc || "")
  const items = callback.CallbackMetadata?.Item ?? []

  if (!checkoutRequestId) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const transaction = await prisma.transaction.findFirst({
    where: { transactionRef: checkoutRequestId },
  })

  if (!transaction) {
    return NextResponse.json({ ok: true })
  }

  if (resultCode !== 0) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
        paymentDetails: {
          ...(transaction.paymentDetails as Record<string, unknown>),
          resultCode,
          resultDesc,
        },
      },
    })
    return NextResponse.json({ ok: true })
  }

  const amount = Number(getMetadataValue(items, "Amount") ?? transaction.amount)
  const mpesaReceipt = String(getMetadataValue(items, "MpesaReceiptNumber") || "")
  const paidAt = getMetadataValue(items, "TransactionDate")

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        paymentDetails: {
          ...(transaction.paymentDetails as Record<string, unknown>),
          resultCode,
          resultDesc,
          mpesaReceipt,
          paidAt,
        },
      },
    })

    if (transaction.senderId) {
      await tx.user.update({
        where: { id: transaction.senderId },
        data: { walletBalance: { increment: amount } },
      })

      await tx.notification.create({
        data: {
          userId: transaction.senderId,
          role: "client",
          category: "payment",
          title: "Deposit confirmed",
          message: `Your deposit of KES ${amount.toLocaleString()} was received.`,
        },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
