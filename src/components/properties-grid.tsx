"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { PropertyCard } from "@/components/property-card"
import { Spinner } from "@/components/ui/spinner"

interface Property {
  id: string
  image: string
  name: string
  pricePerNight: number
  rating: number
}

interface PropertiesGridProps {
  properties: Property[]
  initialCount?: number
  loadMoreCount?: number
}

export function PropertiesGrid({
  properties,
  initialCount = 10,
  loadMoreCount = 10,
}: PropertiesGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const hasMore = visibleCount < properties.length

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    // Simulate a small loading delay for better UX
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + loadMoreCount, properties.length))
      setIsLoading(false)
    }, 500)
  }, [isLoading, hasMore, loadMoreCount, properties.length])

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

  const visibleProperties = properties.slice(0, visibleCount)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visibleProperties.map((property) => (
          <PropertyCard
            key={property.id}
            id={property.id}
            image={property.image}
            name={property.name}
            pricePerNight={property.pricePerNight}
            rating={property.rating}
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
              <span className="text-sm">Loading more properties...</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Showing {visibleCount} of {properties.length} properties
            </p>
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            Showing all {properties.length} properties
          </p>
        </div>
      )}
    </>
  )
}
