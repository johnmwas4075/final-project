"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { LocationSection } from "@/components/location-section"
import { Spinner } from "@/components/ui/spinner"

interface Property {
  id: string
  image: string
  name: string
  pricePerNight: number
  rating: number
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

  const hasMore = visibleCount < locations.length

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simulate a small loading delay for better UX
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + loadMoreCount, locations.length))
      setIsLoading(false)
    }, 500)
  }, [isLoading, hasMore, loadMoreCount, locations.length])

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

  const visibleLocations = locations.slice(0, visibleCount)

  return (
    <>
      <div className="space-y-2 sm:space-y-0 sm:divide-y sm:divide-border">
        {visibleLocations.map((locationData) => (
          <LocationSection
            key={locationData.location}
            location={locationData.location}
            properties={locationData.properties}
          />
        ))}
      </div>

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
              Showing {visibleCount} of {locations.length} locations
            </p>
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            You've reached the end - {locations.length} locations
          </p>
        </div>
      )}
    </>
  )
}
