import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { releaseBookingPayouts } from "@/lib/booking-payout"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const secret = String(process.env.CRON_SECRET || "").trim()
  if (secret) {
    const auth = request.headers.get("authorization") || ""
    const url = new URL(request.url)
    const querySecret = url.searchParams.get("secret") || ""
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : ""
    if (token !== secret && querySecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const released = await releaseBookingPayouts(prisma)
  return NextResponse.json({ ok: true, released })
}
