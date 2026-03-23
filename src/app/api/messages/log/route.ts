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
  const userId = searchParams.get("userId")
  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 })
  }

  const messages = await prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, senderId: true, receiverId: true, createdAt: true },
  })

  if (userId) {
    await prisma.message.updateMany({
      where: { threadId, receiverId: userId, readAt: null },
      data: { readAt: new Date() },
    })
  }

  return NextResponse.json({ messages })
}
