"use client"

import { useEffect } from "react"

const SKIP_KEY = "skipRecOnce"

export function RecommendationSkipMarker() {
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SKIP_KEY, "1")
      }
    }
  }, [])

  return null
}
