"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Wifi,
  Car,
  Tv,
  Wind,
  Waves,
  UtensilsCrossed,
  WashingMachine,
  Plug,
  Bug,
  ShieldAlert,
  Siren,
  Flame,
} from "lucide-react"

const allAmenities = [
  { key: "pool", icon: Waves, label: "Pool", available: true },
  { key: "wifi", icon: Wifi, label: "WiFi", available: true },
  { key: "parking", icon: Car, label: "Free parking", available: true },
  { key: "climate", icon: Wind, label: "Air conditioning or heating", available: true },
  { key: "kitchen", icon: UtensilsCrossed, label: "Kitchen", available: true },
  { key: "hot-tub", icon: Flame, label: "Hot tub", available: true },
  { key: "washer-dryer", icon: WashingMachine, label: "Washer or dryer", available: true },
  { key: "tv", icon: Tv, label: "TV or cable", available: true },
  { key: "generator", icon: Plug, label: "Backup generator", available: true },
  { key: "nets", icon: Bug, label: "Mosquito nets", available: true },
  { key: "smoke", icon: ShieldAlert, label: "Smoke detector", available: true },
  { key: "fire", icon: Siren, label: "Fire alarm", available: true },
]

interface AmenitiesProps {
  amenities?: typeof allAmenities
}

export function Amenities({ amenities = allAmenities }: AmenitiesProps) {
  const iconMap = allAmenities.reduce<Record<string, (typeof allAmenities)[number]["icon"]>>(
    (acc, item) => {
      acc[item.key] = item.icon
      return acc
    },
    {}
  )

  const normalizedAmenities = amenities.map((amenity) => ({
    ...amenity,
    icon: amenity.icon ?? iconMap[amenity.key],
  }))

  const [showAll, setShowAll] = useState(false)
  const displayedAmenities = showAll ? normalizedAmenities : normalizedAmenities.slice(0, 6)

  return (
    <div className="py-6 border-b border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">What this place offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedAmenities.map((amenity, index) => (
          <div key={index} className="flex items-center gap-3">
            {amenity.icon ? (
              <amenity.icon
                className={`h-5 w-5 ${amenity.available ? "text-muted-foreground" : "text-muted-foreground/50"}`}
              />
            ) : null}
            <span
              className={
                amenity.available
                  ? "text-foreground"
                  : "text-muted-foreground line-through"
              }
            >
              {amenity.label}
            </span>
          </div>
        ))}
      </div>
      {amenities.length > 6 && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `Show all ${amenities.length} amenities`}
        </Button>
      )}
    </div>
  )
}

