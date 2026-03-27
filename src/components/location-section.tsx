"use client"

import { useRef } from "react"
import Link from "next/link"
import { PropertyCard } from "./property-card"
import { ChevronRight } from "lucide-react"

interface Property {
  id: string
  image: string
  name: string
  pricePerNight: number
  rating: number
}

interface LocationSectionProps {
  location: string
  properties: Property[]
}

export function LocationSection({ location, properties }: LocationSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const locationSlug = location.toLowerCase().replace(/\s+/g, "-")

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-4 sm:py-6">
      {/* Header with clickable location name and arrow */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <Link
          href={`/location/${locationSlug}`}
          className="group flex items-center gap-2 transition-colors hover:text-primary"
        >
          <h2 className="text-base sm:text-xl font-semibold text-foreground group-hover:text-primary">
            Dwellify stays in {location}
          </h2>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>

        {/* Desktop scroll buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label="Scroll left"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable cards container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide scroll-smooth"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {/* Mobile: show 3 cards, Desktop: show cards with min-w-[200px] */}
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="w-[calc(33.333%-6px)] min-w-[90px] sm:min-w-[200px] sm:w-[200px] shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <PropertyCard
                id={property.id}
                image={property.image}
                name={property.name}
                pricePerNight={property.pricePerNight}
                rating={property.rating}
              />
            </div>
          ))}

          {/* Last card - Arrow leading to location page */}
          <Link
            href={`/location/${locationSlug}`}
            className="w-[calc(33.333%-6px)] min-w-[90px] sm:min-w-[200px] sm:w-[200px] shrink-0 flex flex-col items-center justify-center rounded-lg sm:rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted hover:border-foreground/30"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-background border border-border">
              <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
            </div>
            <span className="mt-2 text-[10px] sm:text-sm font-medium text-muted-foreground">See all</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

