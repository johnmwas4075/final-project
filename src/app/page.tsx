import { LocationsList } from "@/components/locations-list"
import { getPrisma } from "@/lib/prisma"

interface PropertyCardData {
  id: string
  image: string
  name: string
  pricePerNight: number
  rating: number
}

interface LocationSectionData {
  location: string
  properties: PropertyCardData[]
}

async function getLocationData(): Promise<LocationSectionData[]> {
  const prisma = getPrisma()
  if (!prisma) return []
  try {
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        propertyName: true,
        price: true,
        photos: true,
        countyName: true,
        reviews: { select: { stars: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const grouped = new Map<string, PropertyCardData[]>()
    for (const property of properties) {
      const location = (property.countyName ?? "").trim()
      if (!location) continue

      const reviewCount = property.reviews.length
      const rating =
        reviewCount > 0
          ? Number(
              (
                property.reviews.reduce((sum, review) => sum + review.stars, 0) /
                reviewCount
              ).toFixed(2)
            )
          : 0

      const card: PropertyCardData = {
        id: property.id,
        name: property.propertyName,
        image: property.photos?.[0] || "/images/property.jpg",
        pricePerNight: Number(property.price) || 0,
        rating,
      }

      if (!grouped.has(location)) {
        grouped.set(location, [])
      }
      grouped.get(location)?.push(card)
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([location, props]) => ({ location, properties: props }))
  } catch (error) {
    return []
  }
}

export default async function Home() {
  const allLocations = await getLocationData()

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:max-w-[95vw] lg:px-4">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-foreground">Discover Airbnbs in Kenya</h1>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground">
          Explore unique stays across {allLocations.length} locations
        </p>

        {/* Lazy-loaded sections container */}
        <LocationsList
          locations={allLocations}
          initialCount={6}
          loadMoreCount={4}
        />
      </div>
    </main>
  )
}
