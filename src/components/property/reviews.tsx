"use client"

import { useState } from "react"
import Image from "next/image"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Review {
  id: string
  reviewerName: string
  reviewerImage: string
  rating: number
  date: string
  comment: string
}

interface ReviewsProps {
  reviews: Review[]
  totalReviews: number
}

export function Reviews({ reviews, totalReviews }: ReviewsProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div className="py-6 border-b border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">Reviews</h2>

      <div className="grid grid-cols-1 gap-6">
        {displayedReviews.map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image
                  src={review.reviewerImage}
                  alt={review.reviewerName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-foreground">{review.reviewerName}</p>
                <p className="text-sm text-muted-foreground">{review.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < review.rating
                      ? "fill-foreground text-foreground"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-4">{review.comment}</p>
          </div>
        ))}
      </div>

      {totalReviews > 3 && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `Show all ${totalReviews} reviews`}
        </Button>
      )}
    </div>
  )
}
