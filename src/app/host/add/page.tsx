"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const AUTH_KEY = "authUserId"

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

export default function AddPropertyPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [minNights, setMinNights] = useState("1")
  const [rooms, setRooms] = useState("1")
  const [bathrooms, setBathrooms] = useState("1")
  const [guests, setGuests] = useState("1")
  const [county, setCounty] = useState("")
  const [constituency, setConstituency] = useState("")
  const [ward, setWard] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [amenities, setAmenities] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedUserId = window.localStorage.getItem(AUTH_KEY)
    if (!storedUserId) {
      router.replace("/login")
      return
    }
    setUserId(storedUserId)
  }, [router])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return
    const selected = Array.from(files)
    const readers = selected.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.readAsDataURL(file)
        })
    )
    const dataUrls = await Promise.all(readers)
    setImages((prev) => [...prev, ...dataUrls])
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId || isSubmitting) return
    setIsSubmitting(true)
    setError("")

    if (images.length < 5 || images.length > 10) {
      setError("Please add between 5 and 10 images.")
      setIsSubmitting(false)
      return
    }

    const payload = {
      userId,
      propertyName: name,
      description,
      price: Number(price),
      minNights: Number(minNights),
      rooms: Number(rooms),
      bathrooms: Number(bathrooms),
      guests: Number(guests),
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

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || "Unable to create property.")
        setIsSubmitting(false)
        return
      }

      router.push("/host")
    } catch (err) {
      setError("Unable to create property.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
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
            <label className="text-sm font-medium text-foreground">Upload Images (5–10)</label>
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
    </main>
  )
}
