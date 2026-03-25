"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { LocationSection } from "@/components/location-section"
import { PropertiesGrid } from "@/components/properties-grid"
import { Spinner } from "@/components/ui/spinner"
import { useSearchParams } from "next/navigation"

interface Property {
  id: string
  image: string
  name: string
  pricePerNight: number
  rating: number
  bedrooms: number
  countyName: string
  constituencyName: string
  wardName: string
}

interface LocationData {
  location: string
  properties: Property[]
}

interface LocationsListProps {
  locations: LocationData[]
  initialCount?: number
  loadMoreCount?: number
}

export function LocationsList({
  locations,
  initialCount = 6,
  loadMoreCount = 4,
}: LocationsListProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  const filters = useMemo(() => {
    const location = (searchParams.get("location") || "").trim().toLowerCase()
    const bedroomsRaw = (searchParams.get("bedrooms") || "").trim()
    const minPriceRaw = (searchParams.get("minPrice") || "").trim()
    const maxPriceRaw = (searchParams.get("maxPrice") || "").trim()
    const bedrooms = bedroomsRaw ? Number(bedroomsRaw) : null
    const minPrice = minPriceRaw ? Number(minPriceRaw) : null
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null
    return { location, bedrooms, minPrice, maxPrice }
  }, [searchParams])

  const filtersActive = Boolean(
    filters.location ||
      (Number.isFinite(filters.bedrooms as number) && (filters.bedrooms as number) > 0) ||
      Number.isFinite(filters.minPrice as number) ||
      Number.isFinite(filters.maxPrice as number)
  )

  const filteredLocations = useMemo(() => {
    return locations
      .map((locationData) => {
        const filtered = locationData.properties.filter((property) => {
          if (!filtersActive) return true

          let matches = false

          if (filters.location) {
            const haystack = [
              property.countyName,
              property.constituencyName,
              property.wardName,
              locationData.location,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
            if (haystack.includes(filters.location)) matches = true
          }

          if (Number.isFinite(filters.bedrooms as number) && (filters.bedrooms as number) > 0) {
            if (property.bedrooms >= (filters.bedrooms as number)) matches = true
          }

          if (Number.isFinite(filters.minPrice as number)) {
            if (property.pricePerNight >= (filters.minPrice as number)) matches = true
          }

          if (Number.isFinite(filters.maxPrice as number)) {
            if (property.pricePerNight <= (filters.maxPrice as number)) matches = true
          }

          return matches
        })

        return { ...locationData, properties: filtered }
      })
      .filter((locationData) => locationData.properties.length > 0)
  }, [locations, filters, filtersActive])

  useEffect(() => {
    setVisibleCount(initialCount)
  }, [filters, initialCount])

  const hasMore = visibleCount < filteredLocations.length

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simulate a small loading delay for better UX
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + loadMoreCount, filteredLocations.length))
      setIsLoading(false)
    }, 500)
  }, [isLoading, hasMore, loadMoreCount, filteredLocations.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasMore, isLoading, loadMore])

  const visibleLocations = filteredLocations.slice(0, visibleCount)

  const flatProperties = useMemo(() => {
    return filteredLocations.flatMap((locationData) => locationData.properties)
  }, [filteredLocations])

  return (
    <>
      {!filtersActive && (
        <div className="space-y-2 sm:space-y-0 sm:divide-y sm:divide-border">
          {visibleLocations.map((locationData) => (
            <LocationSection
              key={locationData.location}
              location={locationData.location}
              properties={locationData.properties}
            />
          ))}
        </div>
      )}

      {filtersActive && (
        <PropertiesGrid properties={flatProperties} initialCount={20} loadMoreCount={20} />
      )}

      {/* Load more trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex flex-col items-center justify-center py-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner className="h-5 w-5" />
              <span className="text-sm">Loading more locations...</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Showing {visibleCount} of {filteredLocations.length} locations
            </p>
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            You've reached the end - {filteredLocations.length} locations
          </p>
        </div>
      )}
    </>
  )
}
