import Image from "next/image"
import Link from "next/link"
import fs from "node:fs"
import path from "node:path"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { ChevronLeft, MapPin, TrendingUp, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/favorite-button"

type BudgetTier = {
  label: string
  range: string
  details: string
}

type SeasonBadge = {
  label: string
  tone: "green" | "red"
  detail: string
}

type Destination = {
  id: string
  name: string
  location: string
  county: string
  description: string
  images: string[]
  experiences: string[]
  bestSeason: SeasonBadge[]
  crowdLevel: string
  crowdDetail: string
  weatherByMonth: Record<string, { high: number; low: number }>
  budget: BudgetTier[]
}

type NearbyStay = {
  id: string
  name: string
  price: string
  location: string
  image: string
}

const DEFAULT_WEATHER = {
  jan: { high: 26, low: 14 },
  feb: { high: 27, low: 15 },
  mar: { high: 26, low: 15 },
  apr: { high: 25, low: 15 },
  may: { high: 24, low: 14 },
  jun: { high: 23, low: 13 },
  jul: { high: 23, low: 12 },
  aug: { high: 24, low: 12 },
  sep: { high: 25, low: 13 },
  oct: { high: 26, low: 14 },
  nov: { high: 25, low: 14 },
  dec: { high: 26, low: 14 },
}

const DEFAULT_BUDGET: BudgetTier[] = [
  { label: "Backpacker", range: "$60 - $120", details: "Shared stays, local meals, public transport." },
  { label: "Mid-range", range: "$140 - $240", details: "Comfort stays, guided activities." },
  { label: "Luxury", range: "$350+", details: "Premium stays, private experiences." },
]

const DESTINATIONS: Destination[] = [
  {
    id: "maasai-mara",
    name: "Maasai Mara National Reserve",
    location: "Narok County",
    county: "Narok",
    description:
      "Iconic savannah landscapes, the Great Migration, and some of Africa's best game viewing. Expect breathtaking sunsets, open plains, and a front-row seat to wildlife.",
    images: ["/images/tourist-1.jpg", "/images/tourist-2.jpg", "/images/tourist-3.jpg"],
    experiences: ["Wildlife viewing", "Sunrise game drives", "Hot-air balloon safari", "Cultural village visits"],
    bestSeason: [
      { label: "Dry season: Jul-Oct", tone: "green", detail: "Best wildlife visibility" },
      { label: "Short rains: Nov", tone: "red", detail: "Expect muddy tracks" },
    ],
    crowdLevel: "Peak season (Jul-Sep)",
    crowdDetail: "Book early for camps and flights. Shoulder season (Apr-May) is calmer.",
    weatherByMonth: {
      jan: { high: 27, low: 13 },
      feb: { high: 28, low: 14 },
      mar: { high: 27, low: 14 },
      apr: { high: 26, low: 15 },
      may: { high: 25, low: 14 },
      jun: { high: 24, low: 12 },
      jul: { high: 24, low: 11 },
      aug: { high: 25, low: 11 },
      sep: { high: 26, low: 12 },
      oct: { high: 27, low: 13 },
      nov: { high: 26, low: 13 },
      dec: { high: 27, low: 13 },
    },
    budget: [
      { label: "Backpacker", range: "$70 - $120", details: "Shared camps, local meals, group safaris." },
      { label: "Mid-range", range: "$180 - $320", details: "Comfort lodges, 2 game drives/day." },
      { label: "Luxury", range: "$450+", details: "Tented suites, private guide, premium dining." },
    ],
  },
  {
    id: "diani-beach",
    name: "Diani Beach",
    location: "Kwale County",
    county: "Kwale",
    description:
      "Powder-white sands and turquoise waters on Kenya's south coast. Ideal for beach lovers, divers, and anyone looking for calm ocean sunsets.",
    images: ["/images/tourist-2.jpg", "/images/tourist-3.jpg", "/images/tourist-1.jpg"],
    experiences: ["Beach lounging", "Snorkeling", "Dhow cruises", "Kite surfing"],
    bestSeason: [
      { label: "Dry season: Dec-Mar", tone: "green", detail: "Clear skies, calm seas" },
      { label: "Monsoon: May-Jun", tone: "red", detail: "High humidity, rough waters" },
    ],
    crowdLevel: "Peak season (Dec-Jan)",
    crowdDetail: "Shoulder season (Apr-May) offers better prices with warm weather.",
    weatherByMonth: {
      jan: { high: 31, low: 24 },
      feb: { high: 31, low: 24 },
      mar: { high: 31, low: 24 },
      apr: { high: 30, low: 24 },
      may: { high: 29, low: 23 },
      jun: { high: 28, low: 22 },
      jul: { high: 27, low: 21 },
      aug: { high: 27, low: 21 },
      sep: { high: 28, low: 22 },
      oct: { high: 29, low: 23 },
      nov: { high: 30, low: 24 },
      dec: { high: 31, low: 24 },
    },
    budget: [
      { label: "Backpacker", range: "$50 - $90", details: "Hostels, tuk-tuks, beach eats." },
      { label: "Mid-range", range: "$120 - $220", details: "Boutique stays, excursions." },
      { label: "Luxury", range: "$350+", details: "Beachfront villas, private chef." },
    ],
  },
  {
    id: "amboseli",
    name: "Amboseli National Park",
    location: "Kajiado County",
    county: "Kajiado",
    description:
      "Famous for elephant herds and stunning Kilimanjaro backdrops. A photogenic savannah with wide horizons and big wildlife moments.",
    images: ["/images/tourist-3.jpg", "/images/tourist-1.jpg", "/images/tourist-2.jpg"],
    experiences: ["Elephant viewing", "Photography spots", "Nature walks", "Sundowner drives"],
    bestSeason: [
      { label: "Dry season: Jun-Oct", tone: "green", detail: "Best visibility and wildlife" },
      { label: "Long rains: Apr-May", tone: "red", detail: "High grass, harder spotting" },
    ],
    crowdLevel: "Shoulder season (Apr-May)",
    crowdDetail: "Peak (Jul-Aug) is busier but delivers classic views.",
    weatherByMonth: {
      jan: { high: 28, low: 14 },
      feb: { high: 29, low: 15 },
      mar: { high: 28, low: 16 },
      apr: { high: 26, low: 16 },
      may: { high: 25, low: 15 },
      jun: { high: 24, low: 13 },
      jul: { high: 24, low: 12 },
      aug: { high: 25, low: 12 },
      sep: { high: 26, low: 13 },
      oct: { high: 27, low: 14 },
      nov: { high: 27, low: 15 },
      dec: { high: 28, low: 15 },
    },
    budget: [
      { label: "Backpacker", range: "$60 - $110", details: "Community camps, shared tours." },
      { label: "Mid-range", range: "$150 - $260", details: "Safari lodges, guided drives." },
      { label: "Luxury", range: "$400+", details: "Private lodges, sundowner setups." },
    ],
  },
  {
    id: "nairobi-national-park",
    name: "Nairobi National Park",
    location: "Nairobi County",
    county: "Nairobi",
    description: "The only national park in the world within a capital city. Home to lions, giraffes, rhinos, and over 400 bird species.",
    images: ["/images/tourist-1.jpg", "/images/tourist-2.jpg", "/images/tourist-3.jpg"],
    experiences: ["Wildlife viewing", "Picnic sites", "Photography", "Guided drives"],
    bestSeason: [
      { label: "Dry season: Jun-Oct", tone: "green", detail: "Clear wildlife viewing" },
      { label: "Long rains: Apr-May", tone: "red", detail: "Wet tracks" },
    ],
    crowdLevel: "Peak season (Jul-Aug)",
    crowdDetail: "Shoulder season (Nov) is quieter with good sightings.",
    weatherByMonth: DEFAULT_WEATHER,
    budget: DEFAULT_BUDGET,
  },
  {
    id: "giraffe-centre",
    name: "Giraffe Centre",
    location: "Nairobi County",
    county: "Nairobi",
    description: "Get up close with Rothschild giraffes and learn about conservation at this iconic center.",
    images: ["/images/tourist-2.jpg", "/images/tourist-3.jpg", "/images/tourist-1.jpg"],
    experiences: ["Giraffe feeding", "Conservation talks", "Nature trails", "Photography"],
    bestSeason: [
      { label: "Dry season: Jan-Mar", tone: "green", detail: "Clear skies, easy access" },
      { label: "Long rains: Apr-May", tone: "red", detail: "Expect wet paths" },
    ],
    crowdLevel: "Peak season (Dec-Jan)",
    crowdDetail: "Arrive early for fewer crowds.",
    weatherByMonth: DEFAULT_WEATHER,
    budget: DEFAULT_BUDGET,
  },
  {
    id: "karura-forest",
    name: "Karura Forest",
    location: "Nairobi County",
    county: "Nairobi",
    description: "Urban forest with trails, waterfalls, and picnic spots. Great for walking, biking, and nature breaks.",
    images: ["/images/tourist-3.jpg", "/images/tourist-1.jpg", "/images/tourist-2.jpg"],
    experiences: ["Hiking trails", "Bike riding", "Picnics", "Waterfall walks"],
    bestSeason: [
      { label: "Dry season: Jun-Oct", tone: "green", detail: "Best for outdoor trails" },
      { label: "Long rains: Apr-May", tone: "red", detail: "Muddy paths" },
    ],
    crowdLevel: "Shoulder season (Apr-May)",
    crowdDetail: "Weekdays are quieter than weekends.",
    weatherByMonth: DEFAULT_WEATHER,
    budget: DEFAULT_BUDGET,
  },
  {
    id: "david-sheldrick-wildlife-trust",
    name: "David Sheldrick Wildlife Trust",
    location: "Nairobi County",
    county: "Nairobi",
    description: "Visit orphaned elephants and learn about their rescue and rehabilitation.",
    images: ["/images/tourist-1.jpg", "/images/tourist-2.jpg", "/images/tourist-3.jpg"],
    experiences: ["Elephant viewing", "Keeper talks", "Photography", "Conservation education"],
    bestSeason: [
      { label: "Dry season: Jun-Sep", tone: "green", detail: "Comfortable viewing" },
      { label: "Short rains: Nov", tone: "red", detail: "Light showers" },
    ],
    crowdLevel: "Peak season (Jul-Aug)",
    crowdDetail: "Book early for caretaker talks.",
    weatherByMonth: DEFAULT_WEATHER,
    budget: DEFAULT_BUDGET,
  },
  {
    id: "nairobi-national-museum",
    name: "Nairobi National Museum",
    location: "Nairobi County",
    county: "Nairobi",
    description: "Explore Kenya's heritage through exhibits on art, history, and paleontology.",
    images: ["/images/tourist-2.jpg", "/images/tourist-3.jpg", "/images/tourist-1.jpg"],
    experiences: ["Museum tours", "Art exhibits", "Cultural history", "Family friendly visits"],
    bestSeason: [
      { label: "Year-round", tone: "green", detail: "Great indoor attraction" },
      { label: "Holiday rush", tone: "red", detail: "Expect queues" },
    ],
    crowdLevel: "Peak season (Dec-Jan)",
    crowdDetail: "Visit early morning for a quieter experience.",
    weatherByMonth: DEFAULT_WEATHER,
    budget: DEFAULT_BUDGET,
  },
  {
    id: "bomas-of-kenya",
    name: "Bomas of Kenya",
    location: "Nairobi County",
    county: "Nairobi",
    description: "Cultural village with traditional homesteads and live dance performances.",
    images: ["/images/tourist-3.jpg", "/images/tourist-1.jpg", "/images/tourist-2.jpg"],
    experiences: ["Cultural shows", "Traditional homesteads", "Craft markets", "Storytelling"],
    bestSeason: [
      { label: "Dry season: Jun-Sep", tone: "green", detail: "Comfortable for outdoor shows" },
      { label: "Long rains: Apr-May", tone: "red", detail: "Rainy afternoons" },
    ],
    crowdLevel: "Shoulder season (Apr-May)",
    crowdDetail: "Weekday shows are less crowded.",
    weatherByMonth: DEFAULT_WEATHER,
    budget: DEFAULT_BUDGET,
  },
  {
    id: "karen-blixen-museum",
    name: "Karen Blixen Museum",
    location: "Nairobi County",
    county: "Nairobi",
    description: "Historic home and museum of the author of 'Out of Africa'.",
    images: ["/images/tourist-1.jpg", "/images/tourist-2.jpg", "/images/tourist-3.jpg"],
    experiences: ["Historic tours", "Garden walks", "Photography", "Guided storytelling"],
    bestSeason: [
      { label: "Dry season: Jan-Mar", tone: "green", detail: "Best for garden walks" },
      { label: "Long rains: Apr-May", tone: "red", detail: "Wet lawns" },
    ],
    crowdLevel: "Peak season (Dec-Jan)",
    crowdDetail: "Tour groups midday; mornings are calmer.",
    weatherByMonth: DEFAULT_WEATHER,
    budget: DEFAULT_BUDGET,
  },
  {
    id: "uhuru-gardens",
    name: "Uhuru Gardens",
    location: "Nairobi County",
    county: "Nairobi",
    description: "Kenya's largest memorial park, featuring gardens, monuments, and open lawns.",
    images: ["/images/tourist-2.jpg", "/images/tourist-3.jpg", "/images/tourist-1.jpg"],
    experiences: ["Picnic lawns", "Monument visits", "Walking paths", "Family outings"],
    bestSeason: [
      { label: "Dry season: Jun-Oct", tone: "green", detail: "Great for picnics" },
      { label: "Long rains: Apr-May", tone: "red", detail: "Wet grounds" },
    ],
    crowdLevel: "Shoulder season (Apr-May)",
    crowdDetail: "Weekends are busiest.",
    weatherByMonth: DEFAULT_WEATHER,
    budget: DEFAULT_BUDGET,
  },
]

const monthKey = (date: Date) =>
  date
    .toLocaleString("en-US", { month: "short" })
    .toLowerCase()
    .slice(0, 3)

const getDatabaseUrl = () => {
  const envLocal = path.resolve(process.cwd(), ".env.local")
  const envDefault = path.resolve(process.cwd(), ".env")
  const read = (filePath: string) => {
    if (!fs.existsSync(filePath)) return ""
    const content = fs.readFileSync(filePath, "utf8")
    const match = content.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m)
    return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : ""
  }
  return read(envLocal) || read(envDefault) || String(process.env.DATABASE_URL || "").trim()
}

const formatLocation = (county?: string | null, constituency?: string | null, ward?: string | null) =>
  [county, constituency, ward].filter(Boolean).join(", ")

async function getNearbyStays(county: string): Promise<NearbyStay[]> {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) return []

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    const result = await pool.query(
      'select id, "propertyName", "price", "photos", "countyName", "constituencyName", "wardName" from "Property" where lower("countyName") = lower($1) order by "createdAt" desc limit 3',
      [county]
    )

    let rows = result.rows
    if (rows.length === 0) {
      const fallback = await pool.query(
        'select id, "propertyName", "price", "photos", "countyName", "constituencyName", "wardName" from "Property" order by "createdAt" desc limit 3'
      )
      rows = fallback.rows
    }

    return rows.map((row: any) => ({
      id: row.id,
      name: row.propertyName ?? "Nearby stay",
      price: row.price ? `$${row.price}/night` : "Price varies",
      location: formatLocation(row.countyName, row.constituencyName, row.wardName) || county,
      image: Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : "/images/property.jpg",
    }))
  } catch (error) {
    console.error("Tourist stays error:", error)
    return []
  } finally {
    await pool.end()
  }
}

async function getDestinationFromDb(slug: string): Promise<Destination | null> {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) return null

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    const result = await pool.query(
      'select id, slug, name, description, "countyName", location, "bestSeason", "crowdLevel", "crowdDetail", "weatherByMonth", budget, experiences from tourist_destinations where slug = $1 limit 1',
      [slug]
    )

    if (!result.rowCount) return null
    const row = result.rows[0]

    const imagesRes = await pool.query(
      'select url from tourist_images where "destinationId" = $1 order by "createdAt" asc',
      [row.id]
    )

    const images = imagesRes.rows.map((img: any) => img.url)

    return {
      id: row.slug,
      name: row.name,
      location: row.location || row.countyName || "Kenya",
      county: row.countyName || "Kenya",
      description: row.description || "",
      images: images.length > 0 ? images : ["/images/tourist-1.jpg", "/images/tourist-2.jpg"],
      experiences: Array.isArray(row.experiences) ? row.experiences : [],
      bestSeason: Array.isArray(row.bestSeason) ? row.bestSeason : [],
      crowdLevel: row.crowdLevel || "",
      crowdDetail: row.crowdDetail || "",
      weatherByMonth: row.weatherByMonth || DEFAULT_WEATHER,
      budget: Array.isArray(row.budget) ? row.budget : DEFAULT_BUDGET,
    }
  } catch (error) {
    console.error("Tourist destination error:", error)
    return null
  } finally {
    await pool.end()
  }
}

export default async function TouristDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const destination = (await getDestinationFromDb(id)) || DESTINATIONS.find((item) => item.id === id)
  const month = monthKey(new Date())

  if (!destination) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Destination not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't find that tourist destination. Try another link.
          </p>
          <Link href="/" className="mt-6 inline-flex">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const weather = destination.weatherByMonth[month] || destination.weatherByMonth.jan
  const nearbyStays = await getNearbyStays(destination.county)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{destination.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {destination.location}
            </p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              {destination.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {destination.images.map((image, index) => (
            <div
              key={`${destination.id}-image-${index}`}
              className="relative h-64 w-full overflow-hidden rounded-2xl"
            >
              <Image src={image} alt={destination.name} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Experiences</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {destination.experiences.length === 0 && (
                    <span className="text-sm text-muted-foreground">No experiences listed yet.</span>
                  )}
                  {destination.experiences.map((item) => (
                    <span key={item} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">Best Season to Visit</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {destination.bestSeason.length === 0 && (
                    <span className="text-sm text-muted-foreground">No season data yet.</span>
                  )}
                  {destination.bestSeason.map((season) => (
                    <div key={season.label} className="flex items-center gap-3 rounded-full bg-muted px-4 py-2">
                      <Badge
                        className={
                          season.tone === "green"
                            ? "bg-emerald-500 text-white hover:bg-emerald-500"
                            : "bg-rose-500 text-white hover:bg-rose-500"
                        }
                      >
                        {season.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{season.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Weather averages for {month.toUpperCase()}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">High</p>
                      <p className="text-2xl font-semibold text-foreground">{weather.high}°C</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Low</p>
                      <p className="text-2xl font-semibold text-foreground">{weather.low}°C</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Users className="h-4 w-4" />
                    Crowd Level
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {destination.crowdLevel || "Not set"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{destination.crowdDetail || ""}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Estimated Budget / Day</h2>
            <div className="mt-4 space-y-4">
              {destination.budget.map((tier) => (
                <div key={tier.label} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">{tier.label}</p>
                  <p className="text-lg font-semibold text-foreground">{tier.range}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{tier.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Stay Nearby</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recommended Airbnb-style stays close to {destination.name}.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {nearbyStays.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center md:col-span-3">
                <p className="text-sm text-muted-foreground">No nearby stays found yet.</p>
              </div>
            )}
            {nearbyStays.map((stay) => (
              <Link
                key={stay.id}
                href={`/property/${stay.id}`}
                className="group rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-md"
              >
                <div className="relative h-36 w-full overflow-hidden rounded-xl">
                  <Image src={stay.image} alt={stay.name} fill className="object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-foreground">{stay.name}</p>
                  <p className="text-xs text-muted-foreground">{stay.location}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{stay.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

