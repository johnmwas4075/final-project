import { Star } from "lucide-react"

interface PropertyDetailsProps {
  name: string
  hostUsername?: string
  guests: number
  bedrooms: number
  bathrooms: number
  rating: number
  reviewCount: number
}

export function PropertyDetails({
  name,
  hostUsername,
  guests,
  bedrooms,
  bathrooms,
  rating,
  reviewCount,
}: PropertyDetailsProps) {
  return (
    <div className="py-6 border-b border-border">
      <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">{name}</h1>
      {hostUsername ? (
        <p className="mt-2 text-sm text-muted-foreground">Hosted by @{hostUsername}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
        <span>{guests} guests</span>
        <span className="text-border">|</span>
        <span>{bedrooms} bedrooms</span>
        <span className="text-border">|</span>
        <span>{bathrooms} bathrooms</span>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Star className="h-4 w-4 fill-foreground text-foreground" />
        <span className="font-medium">{rating.toFixed(2)}</span>
        <span className="text-muted-foreground">({reviewCount} reviews)</span>
      </div>
    </div>
  )
}

