import { Star } from "lucide-react"

interface RatingCategory {
  label: string
  score: number
}

interface RatingsProps {
  overallRating: number
  reviewCount: number
  categories: RatingCategory[]
}

export function Ratings({ overallRating, reviewCount, categories }: RatingsProps) {
  return (
    <div className="py-6 border-b border-border">
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-6 w-6 fill-foreground text-foreground" />
        <span className="text-2xl font-semibold">{overallRating.toFixed(2)}</span>
        <span className="text-muted-foreground">({reviewCount} reviews)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category.label} className="flex items-center justify-between gap-4">
            <span className="text-sm text-foreground">{category.label}</span>
            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full"
                  style={{ width: `${(category.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8">{category.score.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

