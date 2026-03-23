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

  const notifications = await prisma.notification.findMany({
    where: { userId, role },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ notifications })
}

export async function PATCH(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id : ""
  const userId = typeof body.userId === "string" ? body.userId : ""
  if (!id || !userId) {
    return NextResponse.json({ error: "id and userId are required" }, { status: 400 })
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ notification: updated })
}
