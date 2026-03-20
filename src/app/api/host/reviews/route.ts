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

  const properties = await prisma.property.findMany({
    where: { userId },
    select: {
      id: true,
      propertyName: true,
      photos: true,
      countyName: true,
      constituencyName: true,
      wardName: true,
      reviews: {
        select: {
          id: true,
          stars: true,
          comment: true,
          accuracy: true,
          cleanliness: true,
          communication: true,
          checkin: true,
          location: true,
          value: true,
          hostRating: true,
          reviewDate: true,
          user: { select: { id: true, username: true, firstName: true, lastName: true } },
        },
        orderBy: { reviewDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ properties })
}
