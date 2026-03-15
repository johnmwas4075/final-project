"use client"

import Link from "next/link"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const AUTH_KEY = "authUserId"
const AUTH_NAME_KEY = "authUserFirstName"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [bedrooms, setBedrooms] = useState<string>("")
  const [month, setMonth] = useState<string>("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [firstName, setFirstName] = useState<string>("")
  const filtersRef = useRef<HTMLDivElement | null>(null)

  const performSearch = () => {
    const params = new URLSearchParams()
    if (selectedLocation.trim()) params.set("location", selectedLocation.trim())
    if (bedrooms.trim()) params.set("bedrooms", bedrooms.trim())
    if (month.trim()) params.set("month", month.trim())
    const next = params.toString()
    router.push(next ? `${pathname}?${next}` : pathname)
    setIsFiltersOpen(false)
  }
  const handleSearch = (event?: React.FormEvent) => {
    if (event) event.preventDefault()
    performSearch()
  }

  const checkAuth = () => {
    if (typeof window === "undefined") return false
    return Boolean(window.localStorage.getItem(AUTH_KEY))
  }

  const handleBecomeHost = () => {
    const authed = checkAuth()
    router.push(authed ? "/userpage" : "/login")
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY)
      window.localStorage.removeItem(AUTH_NAME_KEY)
    }
    setIsAuthed(false)
    setFirstName("")
    router.push("/login")
  }

  useEffect(() => {
    const locationParam = searchParams.get("location") || ""
    const bedroomsParam = searchParams.get("bedrooms") || ""
    const monthParam = searchParams.get("month") || ""
    setSelectedLocation(locationParam)
    setBedrooms(bedroomsParam)
    setMonth(monthParam)
    
    // Check authentication on mount
    const authed = checkAuth()
    setIsAuthed(authed)
    if (authed && typeof window !== "undefined") {
      const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
      if (storedName) setFirstName(storedName)
    }
  }, [searchParams])

  useEffect(() => {
    if (!isFiltersOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (filtersRef.current && !filtersRef.current.contains(target)) {
        setIsFiltersOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isFiltersOpen])

  useEffect(() => {
    // Check authentication whenever the route changes
    const authed = checkAuth()
    setIsAuthed(authed)
    if (authed && typeof window !== "undefined") {
      const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
      if (storedName) setFirstName(storedName)
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-rose-500">airbnb</span>
        </Link>

        <div className="hidden md:flex flex-col items-center" ref={filtersRef}>
          <div className="my-1 flex w-full max-w-[980px] items-center rounded-full border border-border bg-background p-1 shadow-sm transition-colors hover:border-rose-500/60">
            <button
              type="button"
              onClick={() => setIsFiltersOpen((open) => !open)}
              className="flex-1 rounded-full px-4 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-foreground/80">
                Location
              </span>
              <span className="block text-sm font-medium text-muted-foreground">
                {selectedLocation || "Location"}
              </span>
            </button>

            <div className="h-7 w-px bg-border" />

            <button
              type="button"
              onClick={() => setIsFiltersOpen((open) => !open)}
              className="flex-1 rounded-full px-4 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-foreground/80">
                Bedrooms
              </span>
              <span className="block text-sm font-medium text-muted-foreground">
                {bedrooms || "Any"}
              </span>
            </button>

            <div className="h-7 w-px bg-border" />

            <button
              type="button"
              onClick={() => setIsFiltersOpen((open) => !open)}
              className="flex-1 rounded-full px-4 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-foreground/80">
                Month
              </span>
              <span className="block text-sm font-medium text-muted-foreground">
                {month || "Month"}
              </span>
            </button>

            <Button
              size="icon"
              className="ml-1 h-10 w-10 rounded-full bg-rose-500 hover:bg-rose-600"
              onClick={performSearch}
            >
              <Search className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        <Button variant="outline" size="sm" className="md:hidden rounded-full gap-2">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden sm:inline-flex rounded-full text-sm font-medium"
            onClick={handleBecomeHost}
          >
            Become a Host
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full gap-2 px-3"
              >
                <Menu className="h-4 w-4" />
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium">{isAuthed ? firstName.charAt(0).toUpperCase() : "G"}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthed ? (
                <>
                  <DropdownMenuItem disabled className="text-sm font-medium">
                    Hi, {firstName}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link href="/login" className="w-full">Log in</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/signup" className="w-full">Sign up</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleBecomeHost}>
                    <span className="w-full">Become a Host</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="hidden md:block">
          <div className="mx-auto w-full max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
            <form
              onSubmit={handleSearch}
              className="mt-2 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm sm:grid-cols-4 sm:items-end"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  Location
                </label>
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="Where are you going?"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-rose-500/70"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min={0}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="Any"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-rose-500/70"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  Month
                </label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="Month"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-rose-500/70"
                />
              </div>

              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  className="h-10 w-full rounded-full bg-rose-500 px-6 hover:bg-rose-600 sm:w-auto"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
