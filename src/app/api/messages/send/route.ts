import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

const parseBody = async (request: Request) => {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return null
  return body as Record<string, unknown>
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

  const threadId = typeof body.threadId === "string" ? body.threadId : ""
  const hostId = typeof body.hostId === "string" ? body.hostId : ""
  const guestId = typeof body.guestId === "string" ? body.guestId : ""
  const senderId = typeof body.senderId === "string" ? body.senderId : ""
  const receiverId = typeof body.receiverId === "string" ? body.receiverId : ""
  const bodyText = typeof body.body === "string" ? body.body.trim() : ""

  if (!senderId || !receiverId || !bodyText) {
    return NextResponse.json({ error: "senderId, receiverId, and body are required" }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    let thread = null
    if (threadId) {
      thread = await tx.messageThread.findUnique({ where: { id: threadId } })
    }
    if (!thread) {
      if (!hostId || !guestId) {
        return null
      }
      thread = await tx.messageThread.upsert({
        where: { hostId_guestId: { hostId, guestId } },
        create: { hostId, guestId },
        update: {},
      })
    }

    const message = await tx.message.create({
      data: {
        threadId: thread.id,
        senderId,
        receiverId,
        body: bodyText,
      },
      select: { id: true, body: true, senderId: true, receiverId: true, createdAt: true },
    })

    await tx.messageThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: message.createdAt },
    })

    return { thread, message }
  })

  if (!result) {
    return NextResponse.json({ error: "Missing thread details" }, { status: 400 })
  }

  return NextResponse.json({ thread: result.thread, message: result.message })
}

