import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface TouristLocation {
  id: string
  name: string
  image: string
  description: string
}

interface TouristLocationsProps {
  locations: TouristLocation[]
  countySlug: string
  countyName: string
}

export function TouristLocations({ locations, countySlug, countyName }: TouristLocationsProps) {
  const displayedLocations = locations.slice(0, 5)

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Tourist Destinations Near {countyName}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {displayedLocations.map((location) => (
          <Link
            key={location.id}
            href={`/tourist/${location.id}`}
            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src={location.image}
                alt={location.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="mt-2 font-medium text-foreground">{location.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
          </Link>
        ))}
      </div>

      <Link href={`/attractions/${countySlug}`}>
        <Button variant="outline" className="mt-6 gap-2">
          See all attractions in {countyName}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
