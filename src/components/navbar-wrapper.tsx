"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"

export function NavbarWrapper() {
  const pathname = usePathname()
  if (
    pathname.startsWith("/userpage") ||
    pathname.startsWith("/host") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/profile")
  ) {
    return null
  }
  return <Suspense fallback={<div>Loading...</div>}><Navbar /></Suspense>
}

