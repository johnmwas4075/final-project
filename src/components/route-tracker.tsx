"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const PREV_KEY = "routePrev"
const CURRENT_KEY = "routeCurrent"

export function RouteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return
    const current = window.sessionStorage.getItem(CURRENT_KEY)
    if (current) {
      window.sessionStorage.setItem(PREV_KEY, current)
    }
    window.sessionStorage.setItem(CURRENT_KEY, pathname)
  }, [pathname])

  return null
}
