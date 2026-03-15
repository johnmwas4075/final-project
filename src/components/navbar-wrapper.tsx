"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function NavbarWrapper() {
  const pathname = usePathname()
  if (pathname.startsWith("/userpage") || pathname.startsWith("/host")) return null
  return <Navbar />
}
