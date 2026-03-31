"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const AUTH_KEY = "authUserId"
const SKIP_KEY = "skipRecOnce"
const PREV_KEY = "routePrev"

interface RecommendationItem {
  id: string
  name: string
  description: string
  image: string
  rating: number
}

export function RecommendationPopup() {
  const router = useRouter()
  const [items, setItems] = useState<RecommendationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    if (hasShown) return
    if (typeof window !== "undefined") {
      const skipOnce = window.sessionStorage.getItem(SKIP_KEY)
      if (skipOnce === "1") {
        window.sessionStorage.removeItem(SKIP_KEY)
        setHasShown(true)
        return
      }
      const prevPath = window.sessionStorage.getItem(PREV_KEY) || ""
      const cameFromHostOrUser = prevPath.startsWith("/host") || prevPath.startsWith("/userpage")
      const isFreshVisit = prevPath === "" || prevPath === "/"
      if (!cameFromHostOrUser && !isFreshVisit) {
        setHasShown(true)
        return
      }
    }
    const userId = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_KEY) : null
    const url = userId ? `/api/recommendations?userId=${encodeURIComponent(userId)}` : "/api/recommendations"
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setItems(data.recommendations)
          setIsOpen(true)
          setHasShown(true)
        }
      })
      .catch(() => null)
  }, [hasShown])

  const pick = useMemo(() => {
    if (items.length === 0) return null
    return items[Math.floor(Math.random() * items.length)]
  }, [items])

  if (!isOpen || !pick) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl">
        <div className="relative cursor-pointer" role="button" onClick={() => router.push(`/property/${pick.id}`)}>
          <img src={pick.image} alt={pick.name} className="h-48 w-full object-cover" />
          <button
            onClick={(event) => { event.stopPropagation(); setIsOpen(false) }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recommended for you</h3>
            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600">
              {pick.rating.toFixed(1)} ?
            </span>
          </div>
          <p className="text-base font-semibold text-foreground">{pick.name}</p>
          <p className="line-clamp-3 text-sm text-muted-foreground">{pick.description}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={(event) => { event.stopPropagation(); setIsOpen(false) }}>
              Not now
            </Button>
            <Button
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={() => router.push(`/property/${pick.id}`)}
            >
              View property
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
