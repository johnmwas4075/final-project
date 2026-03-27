import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import {
  createMpesaReference,
  encodePassword,
  formatTimestamp,
  getMpesaConfig,
  getMpesaEndpoints,
  randomRef,
} from "@/lib/mpesa"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : ""
  const phone = typeof body.phone === "string" ? body.phone.trim() : ""
  const amount = Number(body.amount)
  const username = typeof body.username === "string" ? body.username.trim() : ""

  if (!userId || !phone || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
  }

  const mpesaConfig = getMpesaConfig()
  if (!mpesaConfig) {
    return NextResponse.json({ error: "Mpesa is not configured" }, { status: 500 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, phoneNumber: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const normalizedPhone = phone.replace(/^\+/, "").replace(/\s+/g, "")
  const reference = createMpesaReference(username || user.username || user.phoneNumber)

  const timestamp = formatTimestamp()
  const password = encodePassword(mpesaConfig.shortCode, mpesaConfig.passkey, timestamp)
  const endpoints = getMpesaEndpoints(mpesaConfig.env)

  const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString("base64")
  const tokenResponse = await fetch(endpoints.oauth, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
    cache: "no-store",
  })

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text()
    return NextResponse.json({ error: "Unable to obtain Mpesa token", details: text }, { status: 502 })
  }

  const tokenData = (await tokenResponse.json().catch(() => ({}))) as { access_token?: string }
  const accessToken = tokenData.access_token
  if (!accessToken) {
    return NextResponse.json({ error: "Mpesa token missing" }, { status: 502 })
  }

  const transactionRef = randomRef()
  const transaction = await prisma.transaction.create({
    data: {
      transactionRef,
      paymentType: "DEPOSIT",
      paymentMethod: "MPESA",
      status: "PROCESSING",
      amount,
      fee: 0,
      netAmount: amount,
      currency: "KES",
      senderType: "USER",
      senderId: userId,
      receiverType: "APP",
      receiverId: null,
      paymentDetails: {
        phone: normalizedPhone,
        reference,
      },
    },
  })

  const stkResponse = await fetch(endpoints.stkPush, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: mpesaConfig.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: normalizedPhone,
      PartyB: mpesaConfig.shortCode,
      PhoneNumber: normalizedPhone,
      CallBackURL: mpesaConfig.callbackUrl,
      AccountReference: reference,
      TransactionDesc: "Dwellify wallet top up",
    }),
  })

  const stkData = await stkResponse.json().catch(() => ({}))
  if (!stkResponse.ok || stkData?.ResponseCode !== "0") {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
        paymentDetails: {
          ...((transaction.paymentDetails as Record<string, unknown>) || {}),
          error: stkData,
        },
      },
    })
    return NextResponse.json({ error: "Mpesa STK push failed", details: stkData }, { status: 502 })
  }

  const checkoutRequestId = String(stkData.CheckoutRequestID || "")
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      transactionRef: checkoutRequestId || transaction.transactionRef,
      paymentDetails: {
        ...((transaction.paymentDetails as Record<string, unknown>) || {}),
        checkoutRequestId,
        merchantRequestId: stkData.MerchantRequestID || null,
      },
    },
  })

  return NextResponse.json({
    ok: true,
    checkoutRequestId,
    message: stkData.CustomerMessage || "STK push sent.",
  })
}

