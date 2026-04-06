import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

function formatLocation(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function slugifyAttraction(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function getAttractions(location: string) {
  return [
    {
      name: "Nairobi National Park",
      image: "/images/tourist-1.jpg",
      description: "The only national park in the world within a capital city. Home to lions, giraffes, rhinos, and over 400 bird species. A must-visit for wildlife enthusiasts looking to experience safari without leaving the city.",
    },
    {
      name: "Giraffe Centre",
      image: "/images/tourist-2.jpg",
      description: "Get up close and personal with endangered Rothschild giraffes at this conservation center. Feed them from an elevated platform and learn about conservation efforts.",
    },
    {
      name: "Karura Forest",
      image: "/images/tourist-3.jpg",
      description: "An urban forest with walking trails, waterfalls, and caves. Perfect for nature lovers seeking a peaceful escape from the city bustle.",
    },
    {
      name: "David Sheldrick Wildlife Trust",
      image: "/images/tourist-1.jpg",
      description: "Visit orphaned elephants and rhinos at this renowned wildlife sanctuary. Learn about their rescue and rehabilitation programs.",
    },
    {
      name: "Nairobi National Museum",
      image: "/images/tourist-2.jpg",
      description: "Explore Kenya's rich cultural and natural heritage through fascinating exhibits on art, history, and paleontology.",
    },
    {
      name: "Bomas of Kenya",
      image: "/images/tourist-3.jpg",
      description: "Experience traditional Kenyan culture through music, dance performances, and replicas of homesteads from different ethnic communities.",
    },
    {
      name: "Karen Blixen Museum",
      image: "/images/tourist-1.jpg",
      description: "Visit the former home of the famous Danish author of 'Out of Africa'. The museum preserves her original furnishings and artifacts.",
    },
    {
      name: "Uhuru Gardens",
      image: "/images/tourist-2.jpg",
      description: "Kenya's largest memorial park, commemorating the country's independence. Features beautiful gardens and historical monuments.",
    },
  ].map((item) => ({ ...item, id: slugifyAttraction(item.name) }))
}

export default async function AttractionsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const location = formatLocation(slug)
  const attractions = getAttractions(location)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Tourist Attractions in {location}
        </h1>
        <p className="mb-8 text-muted-foreground">
          Discover {attractions.length} amazing places to visit near your stay
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {attractions.map((attraction) => (
            <Link
              key={attraction.id}
              href={`/tourist/${attraction.id}`}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                  src={attraction.image}
                  alt={attraction.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{attraction.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                {attraction.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
