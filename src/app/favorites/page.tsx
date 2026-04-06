"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageBell } from "@/components/message-bell"
import { NotificationBell } from "@/components/notification-bell"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FavoriteButton } from "@/components/favorite-button"

const AUTH_KEY = "authUserId"
const AUTH_NAME_KEY = "authUserFirstName"

const clientSidebarNav = [
  { label: "Dashboard", section: "dashboard" },
  { label: "My bookings", section: "bookings" },
  { label: "Reviews", section: "reviews" },
  { label: "Payments and invoices", section: "payments" },
  { label: "Favourites", section: "favorites" },
  { label: "Help and support", section: "support" },
]

const CLIENT_SECTION_KEY = "userActiveSection"

type FavoriteProperty = {
  id: string
  name: string
  price: string
  location: string
  image: string
}

type FavoriteDestination = {
  id: string
  name: string
  location: string
  image: string
}

export default function FavoritesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string>("there")
  const [properties, setProperties] = useState<FavoriteProperty[]>([])
  const [destinations, setDestinations] = useState<FavoriteDestination[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "airbnbs" | "destinations">("all")

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedUserId = window.localStorage.getItem(AUTH_KEY)
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
    if (storedName) setFirstName(storedName)
    setUserId(storedUserId)
  }, [])

  useEffect(() => {
    if (!userId) return
    const params = new URLSearchParams({ userId })
    fetch(`/api/favorites?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const favs = data?.favorites
        setProperties(Array.isArray(favs?.properties) ? favs.properties : [])
        setDestinations(Array.isArray(favs?.destinations) ? favs.destinations : [])
      })
      .catch(() => {
        setProperties([])
        setDestinations([])
      })
  }, [userId])

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return properties
    return properties.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      )
    })
  }, [properties, searchQuery])

  const filteredDestinations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return destinations
    return destinations.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      )
    })
  }, [destinations, searchQuery])

  const showProperties = filterType === "all" || filterType === "airbnbs"
  const showDestinations = filterType === "all" || filterType === "destinations"

  const handleNavigate = (section: string) => {
    if (typeof window === "undefined") return
    if (section === "favorites") {
      router.push("/favorites")
      return
    }
    window.localStorage.setItem(CLIENT_SECTION_KEY, section)
    router.push("/userpage")
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY)
      window.localStorage.removeItem(AUTH_NAME_KEY)
    }
    router.push("/")
  }

  return (
    <main className="h-screen bg-background overflow-hidden">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-rose-500 font-brand">Dwellify</span>
          </div>

          <div className="flex items-center gap-3">
            <MessageBell role="client" className="rounded-full" href="/messages" />
            <NotificationBell role="client" className="rounded-full" href="/notifications" />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <div className="border-b border-border mt-2 mx-4" />
                <nav className="space-y-1 p-4">
                  {clientSidebarNav.map((item) => (
                    <SheetClose asChild key={item.section}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-md px-3 py-2 text-sm"
                        onClick={() => handleNavigate(item.section)}
                      >
                        {item.label}
                      </Button>
                    </SheetClose>
                  ))}
                  <div className="my-2 border-t border-border" />
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/")}
                    >
                      Main page
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/profile")}
                    >
                      Profile settings
                    </Button>
                  </SheetClose>
                  <div className="my-2 border-t border-border" />
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      Log out
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              className="hidden rounded-full text-sm font-medium md:inline-flex"
              onClick={() => router.push("/host/verify")}
            >
              Become a Host
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden rounded-full gap-2 px-3 md:inline-flex">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Hi, {firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/")}>Main page</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

<div className="mx-auto w-full px-4 py-6 sm:px-6 lg:pl-0">
        <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden lg:flex-row">
        
          <aside className="hidden h-full w-full flex-shrink-0 border-b border-rose-400/60 bg-rose-500 p-4 text-white lg:block lg:w-[240px] lg:border-b-0 lg:border-r lg:sticky lg:top-16 lg:h-[calc(100vh-64px)]">
            <nav className="space-y-0 text-sm">
              {clientSidebarNav.map((item, index) => (
                <div key={item.section}>
                  <button
                    onClick={() => handleNavigate(item.section)}
                    className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                      item.section === "favorites"
                        ? "bg-white text-rose-600"
                        : "text-white/90 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                  {index < clientSidebarNav.length - 1 && (
                    <div className="my-2 border-b border-white/30" />
                  )}
                </div>
              ))}
            </nav>
          </aside>

          <section className="flex w-full min-w-0 flex-1 flex-col gap-6 bg-background p-4 sm:p-6 overflow-y-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Favourites</h2>
                <p className="mt-2 text-sm text-muted-foreground">All the stays and destinations you have saved.</p>
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search favourites"
                  className="w-full md:w-[260px]"
                />
                <Select value={filterType} onValueChange={(value) => setFilterType(value as "all" | "airbnbs" | "destinations")}>
                  <SelectTrigger className="w-full md:w-[190px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="airbnbs">Airbnbs</SelectItem>
                    <SelectItem value="destinations">Destinations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showProperties && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Saved stays</h3>
                {filteredProperties.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">No saved stays yet.</p>
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-start">
                    {filteredProperties.map((property) => (
                      <div key={property.id} className="w-full max-w-[280px] rounded-xl border border-border bg-card p-4">
                        <Link href={`/property/${property.id}`} className="block">
                          <div className="relative h-40 w-full overflow-hidden rounded-lg">
                            <img src={property.image} alt={property.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-foreground">{property.name}</p>
                            <p className="text-xs text-muted-foreground">{property.location}</p>
                            <p className="mt-1 text-sm font-medium text-foreground">{property.price}</p>
                          </div>
                        </Link>
                        <div className="mt-3">
                          <FavoriteButton itemId={property.id} itemType="property" size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showProperties && showDestinations && (
              <div className="border-t border-border pt-4" />
            )}

            {showDestinations && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Saved destinations</h3>
                {filteredDestinations.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">No saved destinations yet.</p>
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-start">
                    {filteredDestinations.map((destination) => (
                      <div key={destination.id} className="w-full max-w-[280px] rounded-xl border border-border bg-card p-4">
                        <Link href={`/tourist/${destination.id}`} className="block">
                          <div className="relative h-40 w-full overflow-hidden rounded-lg">
                            <img src={destination.image} alt={destination.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-foreground">{destination.name}</p>
                            <p className="text-xs text-muted-foreground">{destination.location}</p>
                          </div>
                        </Link>
                        <div className="mt-3">
                          <FavoriteButton itemId={destination.id} itemType="tourist" size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
