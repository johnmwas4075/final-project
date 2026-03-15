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
  Dumbbell,
  Flame,
  ShieldCheck,
  Coffee,
  Bath,
} from "lucide-react"

const allAmenities = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Car, label: "Free Parking" },
  { icon: Tv, label: "Smart TV" },
  { icon: Wind, label: "Air Conditioning" },
  { icon: Waves, label: "Swimming Pool" },
  { icon: UtensilsCrossed, label: "Fully Equipped Kitchen" },
  { icon: WashingMachine, label: "Washing Machine" },
  { icon: Dumbbell, label: "Gym Access" },
  { icon: Flame, label: "BBQ Grill" },
  { icon: ShieldCheck, label: "24/7 Security" },
  { icon: Coffee, label: "Coffee Maker" },
  { icon: Bath, label: "Bathtub" },
]

interface AmenitiesProps {
  amenities?: typeof allAmenities
}

export function Amenities({ amenities = allAmenities }: AmenitiesProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedAmenities = showAll ? amenities : amenities.slice(0, 6)

  return (
    <div className="py-6 border-b border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">What this place offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedAmenities.map((amenity, index) => (
          <div key={index} className="flex items-center gap-3">
            <amenity.icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{amenity.label}</span>
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
