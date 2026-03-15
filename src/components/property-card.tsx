import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

interface PropertyCardProps {
  id?: string
  image: string
  name: string
  pricePerNight: number
  rating: number
}

export function PropertyCard({ id, image, name, pricePerNight, rating }: PropertyCardProps) {
  const content = (
    <>
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Mobile rating badge - top right */}
        <div className="sm:hidden absolute top-1 right-1 flex items-center gap-0.5 bg-background/90 backdrop-blur-sm rounded-md px-1 py-0.5">
          <Star className="h-2.5 w-2.5 fill-foreground text-foreground" />
          <span className="text-[9px] font-medium text-foreground">{rating.toFixed(2)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-1.5 sm:mt-2">
        <h3 className="text-[10px] sm:text-xs font-medium text-foreground leading-tight line-clamp-2">{name}</h3>
        <div className="mt-0.5 flex items-center justify-between">
          <p className="text-[10px] sm:text-xs text-foreground">
            <span className="font-semibold">Ksh {pricePerNight}</span>
            <span className="text-muted-foreground">/night</span>
          </p>
          {/* Desktop rating - inline */}
          <div className="hidden sm:flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-foreground text-foreground" />
            <span className="text-xs font-medium text-foreground">{rating.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </>
  )

  if (id) {
    return (
      <Link href={`/property/${id}`} className="group block w-full">
        {content}
      </Link>
    )
  }

  return <div className="group w-full cursor-pointer">{content}</div>
}
