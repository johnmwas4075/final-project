import { PropertiesGrid } from "@/components/properties-grid"
import { getPrisma } from "@/lib/prisma"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// Generate mock properties for a location
function generateProperties(location: string, count: number = 30) {
  const propertyTypes = [
    "Cozy Studio",
    "Luxury Apartment",
    "Modern Villa",
    "Penthouse Suite",
    "Garden Cottage",
    "Executive Suite",
    "Beach House",
    "Mountain Retreat",
    "City Loft",
    "Farmhouse",
    "Bungalow",
    "Townhouse",
  ]

  return Array.from({ length: count }, (_, index) => ({
    id: `${location.toLowerCase().replace(/\s/g, "-")}-${index}`,
    image: "/images/property.jpg",
    name: `${propertyTypes[index % propertyTypes.length]} in ${location}`,
    pricePerNight: Math.floor(Math.random() * 300) + 50,
    rating: Number((Math.random() * 0.5 + 4.5).toFixed(2)),
    bedrooms: (index % 5) + 1,
    availableMonth: monthNames[index % monthNames.length],
  }))
}

function formatLocation(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

async function getDisplayLocationName(location: string): Promise<string> {
  const prisma = getPrisma()
  if (!prisma) return location
  try {
    const row = await prisma.location.findFirst({
      where: {
        county_name: {
          equals: location,
          mode: "insensitive",
        },
      },
      select: { county_name: true },
    })
    return row?.county_name || location
  } catch (error) {
    return location
  }
}

export default async function LocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { slug } = await params
  const location = formatLocation(slug)
  const displayLocation = await getDisplayLocationName(location)
  const bedroomsQueryRaw = typeof searchParams?.bedrooms === "string"
    ? searchParams.bedrooms.trim()
    : ""
  const bedroomsQuery = bedroomsQueryRaw ? Number.parseInt(bedroomsQueryRaw, 10) : NaN
  const monthQuery = typeof searchParams?.month === "string"
    ? searchParams.month.trim().toLowerCase()
    : ""

  const properties = generateProperties(displayLocation, 30).filter((property) => {
    const matchesBedrooms = Number.isNaN(bedroomsQuery)
      ? true
      : property.bedrooms === bedroomsQuery
    const matchesMonth = monthQuery
      ? property.availableMonth.toLowerCase().includes(monthQuery)
      : true
    return matchesBedrooms && matchesMonth
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all locations
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-foreground">Dwellify stays in {displayLocation}</h1>
        <p className="mb-8 text-muted-foreground">
          Discover {properties.length} unique stays in {displayLocation}
        </p>

        <PropertiesGrid
          properties={properties}
          initialCount={10}
          loadMoreCount={10}
        />
      </div>
    </main>
  )
}
