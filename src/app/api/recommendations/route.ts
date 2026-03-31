import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

const computeRating = (reviews: { stars: number }[]) => {
  if (!reviews || reviews.length === 0) return 0
  const total = reviews.reduce((sum, review) => sum + (review.stars || 0), 0)
  return Number((total / reviews.length).toFixed(2))
}

export async function GET(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")?.trim()
  const limitParam = Number(searchParams.get("limit") ?? "5")
  const take = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 12) : 5

  let recommendations: Array<{ id: string; name: string; description: string; image: string; rating: number }> = []

  if (userId) {
    const recs = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { score: "desc" },
      take,
      include: {
        property: {
          select: {
            id: true,
            propertyName: true,
            description: true,
            photos: true,
            reviews: { select: { stars: true } },
          },
        },
      },
    })

    recommendations = recs.map((rec) => ({
      id: rec.property.id,
      name: rec.property.propertyName,
      description: rec.property.description ?? "",
      image: rec.property.photos?.[0] || "/images/property.jpg",
      rating: computeRating(rec.property.reviews),
    }))
  }

  if (recommendations.length === 0) {
    const fallback = await prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        propertyName: true,
        description: true,
        photos: true,
        reviews: { select: { stars: true } },
      },
    })

    recommendations = fallback
      .map((property) => ({
        id: property.id,
        name: property.propertyName,
        description: property.description ?? "",
        image: property.photos?.[0] || "/images/property.jpg",
        rating: computeRating(property.reviews),
      }))
      .sort((a, b) => b.rating - a.rating)
  }

  return NextResponse.json({ recommendations })
}
