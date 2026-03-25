"use client"

import Link from "next/link"
import { Menu, Search } from "lucide-react"
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
  const isMain = pathname === "/"

  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [bedrooms, setBedrooms] = useState<string>("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [focusTarget, setFocusTarget] = useState<"location" | "bedrooms" | "minPrice" | "maxPrice" | null>(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const [firstName, setFirstName] = useState<string>("")
  const filtersRef = useRef<HTMLDivElement | null>(null)
  const locationInputRef = useRef<HTMLInputElement | null>(null)
  const bedroomsInputRef = useRef<HTMLInputElement | null>(null)
  const minPriceInputRef = useRef<HTMLInputElement | null>(null)
  const maxPriceInputRef = useRef<HTMLInputElement | null>(null)

  const performSearch = () => {
    const params = new URLSearchParams()
    if (selectedLocation.trim()) params.set("location", selectedLocation.trim())
    if (bedrooms.trim()) params.set("bedrooms", bedrooms.trim())
    if (minPrice.trim()) params.set("minPrice", minPrice.trim())
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim())
    const next = params.toString()
    router.push(next ? `${pathname}?${next}` : pathname)
    setIsFiltersOpen(false)
  }

  const openFiltersAndFocus = (target: "location" | "bedrooms" | "price") => {
    setIsFiltersOpen(true)
    setFocusTarget(target === "price" ? "minPrice" : target)
  }

  const clearFilters = () => {
    setSelectedLocation("")
    setBedrooms("")
    setMinPrice("")
    setMaxPrice("")
    router.push(pathname)
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
    const authed = checkAuth()
    setIsAuthed(authed)
    if (authed && typeof window !== "undefined") {
      const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
      if (storedName) setFirstName(storedName)
    }
  }, [])

  useEffect(() => {
    if (!isMain) return
    const locationParam = searchParams.get("location") || ""
    const bedroomsParam = searchParams.get("bedrooms") || ""
    const minPriceParam = searchParams.get("minPrice") || ""
    const maxPriceParam = searchParams.get("maxPrice") || ""
    setSelectedLocation(locationParam)
    setBedrooms(bedroomsParam)
    setMinPrice(minPriceParam)
    setMaxPrice(maxPriceParam)
  }, [isMain, searchParams])

  useEffect(() => {
    if (!isFiltersOpen) return
    const focusMap = {
      location: locationInputRef,
      bedrooms: bedroomsInputRef,
      minPrice: minPriceInputRef,
      maxPrice: maxPriceInputRef,
    }
    if (focusTarget) {
      const ref = focusMap[focusTarget]
      setTimeout(() => ref.current?.focus(), 0)
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (filtersRef.current && !filtersRef.current.contains(target)) {
        setIsFiltersOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isFiltersOpen, focusTarget])

  useEffect(() => {
    const authed = checkAuth()
    setIsAuthed(authed)
    if (authed && typeof window !== "undefined") {
      const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
      if (storedName) setFirstName(storedName)
    }
  }, [pathname])

  const filtersForm = (
    <form
      onSubmit={handleSearch}
      className="mt-2 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm"
    >
      <div className="flex min-w-[180px] flex-[0.7] flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
          Location
        </label>
        <input
          type="text"
          ref={locationInputRef}
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          placeholder="County, constituency, or ward"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-rose-500/70"
        />
      </div>

      <div className="flex w-28 flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
          Bedrooms
        </label>
        <input
          type="number"
          min={0}
          ref={bedroomsInputRef}
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          placeholder="Any"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-rose-500/70"
        />
      </div>

      <div className="flex items-end gap-3">
        <div className="flex w-36 flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            Min price
          </label>
          <input
            type="number"
            min={0}
            ref={minPriceInputRef}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-rose-500/70"
          />
        </div>
        <div className="flex w-36 flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            Max price
          </label>
          <input
            type="number"
            min={0}
            ref={maxPriceInputRef}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-rose-500/70"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 rounded-full px-4"
          onClick={clearFilters}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-10 shrink-0 rounded-full bg-rose-500 px-6 hover:bg-rose-600"
        >
          Search
        </Button>
      </div>
    </form>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-rose-500">airbnb</span>
        </Link>

        {isMain && (
          <div className="hidden md:flex flex-col items-center" ref={filtersRef}>
            <div className="my-1 flex w-full max-w-[1200px] items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-left shadow-sm transition-colors hover:border-rose-500/60">
              <div className="grid flex-1 grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => openFiltersAndFocus("location")}
                  className="rounded-full px-2 py-1 text-left transition-colors hover:bg-muted"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-foreground/80">
                    Location
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {selectedLocation || "Location"}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => openFiltersAndFocus("bedrooms")}
                  className="rounded-full px-2 py-1 text-left transition-colors hover:bg-muted"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-foreground/80">
                    Bedrooms
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {bedrooms || "Any"}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => openFiltersAndFocus("price")}
                  className="rounded-full px-2 py-1 text-left transition-colors hover:bg-muted"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-foreground/80 whitespace-nowrap">
                    Price range
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {minPrice || maxPrice ? `${minPrice || "0"} - ${maxPrice || "Any"}` : "Any"}
                  </div>
                </button>
              </div>
              {isFiltersOpen && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm text-muted-foreground shadow-sm hover:text-foreground"
                  aria-label="Clear filters"
                >
                  ×
                </button>
              )}
            </div>
            {isFiltersOpen && (
              <div className="w-full">
                <div className="mx-auto w-full max-w-[1200px] px-4 pb-3 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setIsFiltersOpen(false)}
                      aria-label="Close filters"
                    >
                      ×
                    </Button>
                  </div>
                  {filtersForm}
                </div>
              </div>
            )}
          </div>
        )}

        {isMain && (
          <Button
            variant="outline"
            size="sm"
            className="md:hidden rounded-full gap-2"
            onClick={() => openFiltersAndFocus("location")}
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        )}

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
              <Button variant="outline" className="rounded-full gap-2 px-3">
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
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
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

      {isMain && isFiltersOpen && (
        <div className="md:hidden">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsFiltersOpen(false)}
                aria-label="Close filters"
              >
                ×
              </Button>
            </div>
            {filtersForm}
          </div>
        </div>
      )}
    </header>
  )
}
