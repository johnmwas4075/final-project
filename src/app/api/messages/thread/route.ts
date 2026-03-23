import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const threadId = searchParams.get("threadId")
  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 })
  }

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      host: { select: { id: true, username: true, firstName: true, lastName: true } },
      guest: { select: { id: true, username: true, firstName: true, lastName: true } },
    },
  })

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  }

  return NextResponse.json({ thread })
}

export async function POST(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const hostId = typeof body.hostId === "string" ? body.hostId : ""
  const guestId = typeof body.guestId === "string" ? body.guestId : ""

  if (!hostId || !guestId) {
    return NextResponse.json({ error: "hostId and guestId are required" }, { status: 400 })
  }

  const thread = await prisma.messageThread.upsert({
    where: { hostId_guestId: { hostId, guestId } },
    create: { hostId, guestId },
    update: {},
  })

  return NextResponse.json({ thread })
}
