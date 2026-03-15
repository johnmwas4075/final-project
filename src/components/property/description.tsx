"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DescriptionProps {
  description: string
  maxLength?: number
}

export function Description({ description, maxLength = 300 }: DescriptionProps) {
  const [showFull, setShowFull] = useState(false)
  const shouldTruncate = description.length > maxLength

  const displayText = showFull || !shouldTruncate
    ? description
    : description.slice(0, maxLength) + "..."

  return (
    <div className="py-6 border-b border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">About this place</h2>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      {shouldTruncate && (
        <Button
          variant="link"
          className="mt-2 p-0 h-auto font-semibold"
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  )
}
