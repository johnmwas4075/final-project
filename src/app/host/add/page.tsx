"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageBell } from "@/components/message-bell"
import { NotificationBell } from "@/components/notification-bell"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const AUTH_KEY = "authUserId"
const AUTH_NAME_KEY = "authUserFirstName"
const HOST_SECTION_KEY = "hostActiveSection"

const hostSidebarNav = [
  { label: "Dashboard", section: "dashboard" },
  { label: "My Airbnbs", section: "airbnbs" },
  { label: "Availability Dates", section: "availability" },
  { label: "Earnings and Finances", section: "earnings" },
  { label: "Bookings and Management", section: "bookings" },
  { label: "Reviews and Ratings", section: "reviews" },
  { label: "Host Settings", section: "settings" },
]

const amenityOptions = [
  { key: "pool", label: "Pool" },
  { key: "wifi", label: "WiFi" },
  { key: "parking", label: "Free parking" },
  { key: "climate", label: "Air conditioning or heating" },
  { key: "kitchen", label: "Kitchen" },
  { key: "hot-tub", label: "Hot tub" },
  { key: "washer-dryer", label: "Washer or dryer" },
  { key: "tv", label: "TV or cable" },
  { key: "generator", label: "Backup generator" },
  { key: "nets", label: "Mosquito nets" },
  { key: "smoke", label: "Smoke detector" },
  { key: "fire", label: "Fire alarm" },
]

export default function HostAddPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [firstName, setFirstName] = useState("there")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [minNights, setMinNights] = useState("1")
  const [guests, setGuests] = useState("1")
  const [rooms, setRooms] = useState("1")
  const [bathrooms, setBathrooms] = useState("1")
  const [county, setCounty] = useState("")
  const [constituency, setConstituency] = useState("")
  const [ward, setWard] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [amenities, setAmenities] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window === "undefined") return
    const authed = Boolean(window.localStorage.getItem(AUTH_KEY))
    if (!authed) {
      router.replace("/login")
      return
    }
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
    if (storedName) setFirstName(storedName)
    setIsReady(true)
  }, [router])

  const handleNavigate = (section: string) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(HOST_SECTION_KEY, section)
    router.push("/host")
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files).map((file) => URL.createObjectURL(file))
    const total = next.length
    if (total < 5 || total > 10) {
      setError("Please upload between 5 and 10 images.")
      setImages([])
      return
    }
    setError("")
    setImages(next)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError("")

    if (!name || !description || !price || !county || !constituency || !ward) {
      setError("Please fill out all required fields.")
      setIsSubmitting(false)
      return
    }
    if (images.length < 5 || images.length > 10) {
      setError("Please upload between 5 and 10 images.")
      setIsSubmitting(false)
      return
    }

    const userId = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_KEY) : null
    if (!userId) {
      router.push("/login")
      return
    }

    const payload = {
      userId,
      propertyName: name,
      description,
      price: Number(price),
      rooms: Number(rooms),
      bathrooms: Number(bathrooms),
      guests: Number(guests),
      minNights: Number(minNights),
      photos: images,
      amenities: amenityOptions.map((amenity) => ({
        ...amenity,
        available: Boolean(amenities[amenity.key]),
      })),
      countyName: county,
      constituencyName: constituency,
      wardName: ward,
    }

    try {
      const response = await fetch("/api/host/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        router.push("/host")
        return
      }
      const data = await response.json().catch(() => ({}))
      setError(data?.error || "Unable to create listing.")
    } catch {
      setError("Unable to create listing.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isReady) return null

  return (
    <main className="h-screen bg-background overflow-hidden">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-rose-500">airbnb</span>
          </div>

          <div className="flex items-center gap-3">
            <MessageBell role="host" className="rounded-full" href="/messages" />
            <NotificationBell role="host" className="rounded-full" href="/notifications" />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <div className="border-b border-border mt-2 mx-4" />
                <nav className="space-y-1 p-4">
                  {hostSidebarNav.map((item) => (
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
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/host/airbnbs")}
                    >
                      Check Airbnbs
                    </Button>
                  </SheetClose>
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
                      onClick={() => router.push("/userpage")}
                    >
                      Client page
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] w-full px-4 py-6 sm:px-6 overflow-hidden">
        <div className="flex h-full w-full flex-col lg:flex-row overflow-hidden">
          <aside className="hidden h-full w-full flex-shrink-0 border-b border-border bg-background p-4 lg:block lg:w-[240px] lg:border-b-0 lg:border-r">
            <nav className="space-y-0 text-sm">
              {hostSidebarNav.map((item, index) => (
                <div key={item.section}>
                  <button
                    onClick={() => handleNavigate(item.section)}
                    className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                      index === 0
                        ? "bg-rose-500/10 text-rose-600"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                  {index < hostSidebarNav.length - 1 && <div className="my-2 border-b border-border" />}
                </div>
              ))}
            </nav>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col gap-6 bg-background p-6 overflow-y-auto">
            <div className="w-full max-w-3xl">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground">Add a new Airbnb</h1>
                <p className="text-sm text-muted-foreground">Fill out the details to create a new listing.</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-xl border border-border bg-background p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Property Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Price (KSh)</label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Min Nights</label>
                    <Input type="number" min={1} value={minNights} onChange={(e) => setMinNights(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Guests</label>
                    <Input type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">Bedrooms</label>
                    <Input type="number" min={1} value={rooms} onChange={(e) => setRooms(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Bathrooms</label>
                    <Input type="number" min={1} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">County</label>
                    <Input value={county} onChange={(e) => setCounty(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Constituency</label>
                    <Input value={constituency} onChange={(e) => setConstituency(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Ward</label>
                    <Input value={ward} onChange={(e) => setWard(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Upload Images (5-10)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={(event) => handleFileUpload(event.target.files)}
                    className="w-full text-sm text-muted-foreground"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((src, index) => (
                      <div key={`${src}-${index}`} className="h-24 overflow-hidden rounded-md border border-border bg-muted/20">
                        <img src={src} alt={`Property ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">First image will be used as the cover image.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amenities</label>
                  <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(amenities[amenity.key])}
                          onChange={(event) =>
                            setAmenities((prev) => ({
                              ...prev,
                              [amenity.key]: event.target.checked,
                            }))
                          }
                        />
                        {amenity.label}
                      </label>
                    ))}
                  </div>
                </div>

                {error ? <p className="text-sm text-red-500">{error}</p> : null}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => router.push("/host")}>
                    Cancel
                  </Button>
                  <Button className="bg-rose-500 text-white hover:bg-rose-600" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Airbnb"}
                  </Button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
