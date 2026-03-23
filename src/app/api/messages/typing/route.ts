import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const typingClient = (prisma as any).messageTyping
  if (!typingClient) {
    return NextResponse.json({ typing: [], warning: "MessageTyping model not available. Run prisma generate and migrate/db push." })
  }


  const { searchParams } = new URL(request.url)
  const threadId = searchParams.get("threadId")
  const userId = searchParams.get("userId")
  if (!threadId || !userId) {
    return NextResponse.json({ error: "threadId and userId are required" }, { status: 400 })
  }

  const typing = await typingClient.findMany({
    where: {
      threadId,
      userId: { not: userId },
      isTyping: true,
    },
    select: { userId: true, updatedAt: true },
  })

  return NextResponse.json({ typing })
}

export async function POST(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const typingClient = (prisma as any).messageTyping
  if (!typingClient) {
    return NextResponse.json({ ok: false, warning: "MessageTyping model not available. Run prisma generate and migrate/db push." })
  }


  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const threadId = typeof body.threadId === "string" ? body.threadId : ""
  const userId = typeof body.userId === "string" ? body.userId : ""
  const isTyping = Boolean(body.isTyping)

  if (!threadId || !userId) {
    return NextResponse.json({ error: "threadId and userId are required" }, { status: 400 })
  }

  const typing = await typingClient.upsert({
    where: { threadId_userId: { threadId, userId } },
    create: { threadId, userId, isTyping },
    update: { isTyping },
  })

  return NextResponse.json({ typing })
}
