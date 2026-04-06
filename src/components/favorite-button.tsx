"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

const AUTH_KEY = "authUserId"

type FavoriteButtonProps = {
  itemId: string
  itemType: "property" | "tourist"
  className?: string
  size?: "sm" | "default"
  iconOnly?: boolean
}

export function FavoriteButton({ itemId, itemType, className, size = "sm", iconOnly }: FavoriteButtonProps) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedUserId = window.localStorage.getItem(AUTH_KEY)
    setUserId(storedUserId)
  }, [])

  useEffect(() => {
    if (!userId || !itemId) return
    const params = new URLSearchParams({ userId, itemType, itemId })
    fetch(`/api/favorites?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setIsFavorite(Boolean(data?.isFavorite)))
      .catch(() => setIsFavorite(false))
  }, [userId, itemId, itemType])

  const toggleFavorite = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    if (!userId) {
      router.push("/login")
      return
    }
    if (isLoading) return
    setIsLoading(true)

    try {
      if (isFavorite) {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, itemType, itemId }),
        })
        setIsFavorite(false)
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, itemType, itemId }),
        })
        setIsFavorite(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={iconOnly ? "ghost" : isFavorite ? "default" : "outline"}
      size={size}
      className={className}
      onClick={toggleFavorite}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
      {!iconOnly && <span className="ml-2">{isFavorite ? "Saved" : "Save"}</span>}
    </Button>
  )
}
