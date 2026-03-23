import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const role = searchParams.get("role")
  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 })
  }

  const where = role === "host" ? { hostId: userId } : { guestId: userId }

  const threads = await prisma.messageThread.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    include: {
      host: { select: { id: true, username: true, firstName: true, lastName: true } },
      guest: { select: { id: true, username: true, firstName: true, lastName: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderId: true },
      },
    },
  })

  const data = await Promise.all(threads.map(async (thread) => {
    const other = role === "host" ? thread.guest : thread.host
    const last = thread.messages[0]
    const unreadCount = await prisma.message.count({ where: { threadId: thread.id, receiverId: userId, readAt: null } })

    return {
      id: thread.id,
      name: [other.firstName, other.lastName].filter(Boolean).join(" ") || other.username || "Guest",
      username: other.username || "guest",
      avatar: "/images/avatars/default.png",
      lastMessage: last?.body || "",
      timestamp: last?.createdAt?.toISOString() || thread.createdAt.toISOString(),
      unreadCount,
    }
  })

  return NextResponse.json({ threads: data })
}
