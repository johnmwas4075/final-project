import { LocationsList } from "@/components/locations-list"
import { getPrisma } from "@/lib/prisma"

// Generate mock properties for each location
function generateProperties(location: string) {
  const propertyNames = [
    `Cozy Studio in ${location}`,
    `Luxury Apartment in ${location}`,
    `Modern Villa in ${location}`,
    `Penthouse Suite in ${location}`,
    `Garden Cottage in ${location}`,
    `Executive Suite in ${location}`,
    `Family Home in ${location}`,
    `City Loft in ${location}`,
  ]

  return propertyNames.map((name, index) => ({
    id: `${location.toLowerCase().replace(/\s/g, "-")}-${index}`,
    image: "/images/property.jpg",
    name,
    pricePerNight: Math.floor(Math.random() * 300) + 50,
    rating: Number((Math.random() * 0.5 + 4.5).toFixed(2)),
  }))
}

async function getLocationNames(): Promise<string[]> {
  const prisma = getPrisma()
  if (!prisma) return []
  try {
    const rows = await prisma.location.findMany({
      select: { county_name: true },
      distinct: ["county_name"],
      orderBy: { county_name: "asc" },
    })
    return rows
      .map((row) => row.county_name.trim())
      .filter(Boolean)
  } catch (error) {
    return []
  }
}

export default async function Home() {
  const locationNames = await getLocationNames()

  // Pre-generate all location data
  const allLocations = locationNames.map((location) => ({
    location,
    properties: generateProperties(location),
  }))

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:max-w-[95vw] lg:px-4">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-foreground">Discover Airbnbs in Kenya</h1>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground">
          Explore unique stays across {locationNames.length} locations
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
