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
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  if (!("message" in prisma)) {
    return NextResponse.json({ unreadThreads: 0, warning: "Message model not available. Run prisma generate." })
  }

  const threads = await prisma.message.findMany({
    where: { receiverId: userId, readAt: null },
    distinct: ["threadId"],
    select: { threadId: true },
  })

  return NextResponse.json({ unreadThreads: threads.length })
}
