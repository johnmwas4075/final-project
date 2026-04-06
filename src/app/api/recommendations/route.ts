import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

const computeRating = (reviews: { stars: number }[]) => {
  if (!reviews || reviews.length === 0) return 0
  const total = reviews.reduce((sum, review) => sum + (review.stars || 0), 0)
  return Number((total / reviews.length).toFixed(2))
}

const monthKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

const toStringArray = (value: unknown) => {
  if (!value) return []
  if (Array.isArray(value)) return value.map((item) => String(item))
  if (typeof value === "string") return [value]
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map((item) => String(item))
  return [String(value)]
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

  type RecItem = {
    id: string
    name: string
    description: string
    image: string
    rating?: number
    type: "property" | "tourist"
    score: number
  }

  let propertyItems: RecItem[] = []
  let touristItems: RecItem[] = []

  if (userId) {
    const recs = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { score: "desc" },
      take: Math.ceil(take / 2),
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

    propertyItems = recs.map((rec) => ({
      id: rec.property.id,
      name: rec.property.propertyName,
      description: rec.property.description ?? "",
      image: rec.property.photos?.[0] || "/images/property.jpg",
      rating: computeRating(rec.property.reviews),
      type: "property" as const,
      score: computeRating(rec.property.reviews),
    }))
  }

  if (propertyItems.length === 0) {
    const fallback = await prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.ceil(take / 2),
      select: {
        id: true,
        propertyName: true,
        description: true,
        photos: true,
        reviews: { select: { stars: true } },
      },
    })

    propertyItems = fallback
      .map((property) => ({
        id: property.id,
        name: property.propertyName,
        description: property.description ?? "",
        image: property.photos?.[0] || "/images/property.jpg",
        rating: computeRating(property.reviews),
        type: "property" as const,
        score: computeRating(property.reviews),
      }))
      .sort((a, b) => b.rating - a.rating)
  }

  const touristTake = Math.max(1, take - Math.ceil(take / 2))
  const currentMonthKey = monthKeys[new Date().getMonth()]
  let favoriteCounties = new Set<string>()

  if (userId) {
    const favs = await prisma.favorite.findMany({
      where: { userId, itemType: "tourist" },
      select: { itemId: true },
    })
    const favSlugs = favs.map((fav) => fav.itemId)
    if (favSlugs.length > 0) {
      const favDestinations = await prisma.touristDestination.findMany({
        where: { slug: { in: favSlugs } },
        select: { countyName: true },
      })
      favoriteCounties = new Set(favDestinations.map((item) => item.countyName || "").filter(Boolean))
    }
  }

  const destinations = await prisma.touristDestination.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.max(touristTake * 3, 6),
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      countyName: true,
      location: true,
      bestSeason: true,
      weatherByMonth: true,
      createdAt: true,
      images: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { url: true },
      },
    },
  })

  touristItems = destinations
    .map((destination) => {
      const seasonTokens = toStringArray(destination.bestSeason).map((token) => token.toLowerCase())
      const seasonMatch = seasonTokens.some((token) => token.includes(currentMonthKey))
      const weatherData = destination.weatherByMonth as Record<string, unknown> | null
      const hasWeather = Boolean(weatherData && weatherData[currentMonthKey])
      const countyMatch = destination.countyName && favoriteCounties.has(destination.countyName)
      const score = (countyMatch ? 2 : 0) + (seasonMatch ? 2 : 0) + (hasWeather ? 1 : 0)

      return {
        id: destination.slug,
        name: destination.name,
        description: destination.description ?? destination.location ?? destination.countyName ?? "",
        image: destination.images?.[0]?.url || "/images/tourist-1.jpg",
        type: "tourist" as const,
        score,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, touristTake)

  const recommendations = [...propertyItems, ...touristItems]
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .map(({ score, ...rest }) => rest)

  return NextResponse.json({ recommendations })
}
