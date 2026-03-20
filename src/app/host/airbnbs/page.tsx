"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HostNavbar } from "@/components/host-navbar"

const AUTH_KEY = "authUserId"

type BookingItem = {
  id: string
  guestId: string
  propertyId: string
  property: string
  status: "booked" | "reserved" | "cancelled"
  checkIn: string
  checkOut: string
}

type PropertyItem = {
  id: string
  name: string
  image: string
  county: string
  constituency: string
  ward: string
}

const parseDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

const isBetweenInclusive = (date: Date, start: Date, end: Date) => {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return day >= s && day <= e
}

const toDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const getMonthGrid = (anchor: Date) => {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = Array.from({ length: startDay }, () => null)
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  return [...leading, ...days]
}

export default function HostAirbnbsCalendarPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [properties, setProperties] = useState<PropertyItem[]>([])
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [cancellations, setCancellations] = useState<
    {
      id: string
      bookingId: string
      status: string
      reason: string
      suggestionPropertyId?: string
      createdAt: string
    }[]
  >([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "booked" | "cancelled" | "reserved" | "occupied" | "past">("all")
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelBooking, setCancelBooking] = useState<BookingItem | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelSuggestion, setCancelSuggestion] = useState<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedUserId = window.localStorage.getItem(AUTH_KEY)
    if (!storedUserId) {
      router.replace("/login")
      return
    }
    setUserId(storedUserId)
  }, [router])

  useEffect(() => {
    if (!userId) return
    const loadProperties = async () => {
      try {
        const response = await fetch(`/api/host/properties?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) return
        const data = await response.json()
        const mapped = (data.properties ?? []).map((property: any) => ({
          id: property.id,
          name: property.propertyName,
          image: property.photos?.[0] || "/images/property.jpg",
          county: property.countyName ?? "",
          constituency: property.constituencyName ?? "",
          ward: property.wardName ?? "",
        }))
        setProperties(mapped)
      } catch {
        setProperties([])
      }
    }

    const loadBookings = async () => {
      try {
        const response = await fetch(`/api/host/bookings?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) return
        const data = await response.json()
        const mapped = (data.bookings ?? []).map((booking: any) => {
          const rawStatus = String(booking.status || "").toUpperCase()
          const status =
            rawStatus === "CANCELLED"
              ? "cancelled"
              : rawStatus === "PENDING"
                ? "reserved"
                : "booked"
          return {
            id: booking.id,
            guestId: booking.user?.id ?? "",
            propertyId: booking.property?.id ?? "",
            property: booking.property?.propertyName ?? "Unknown property",
            status,
            checkIn: String(booking.checkIn || "").slice(0, 10),
            checkOut: String(booking.checkOut || "").slice(0, 10),
          }
        })
        setBookings(mapped)
      } catch {
        setBookings([])
      }
    }

    const loadCancellations = async () => {
      try {
        const response = await fetch(`/api/host/cancellations?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) return
        const data = await response.json()
        const mapped = (data.cancellations ?? []).map((item: any) => ({
          id: item.id,
          bookingId: item.bookingId,
          status: item.status,
          reason: item.reason,
          suggestionPropertyId: item.suggestionPropertyId ?? undefined,
          createdAt: String(item.createdAt || "").slice(0, 10),
        }))
        setCancellations(mapped)
      } catch {
        setCancellations([])
      }
    }

    loadProperties()
    loadBookings()
    loadCancellations()
  }, [userId])

  const filteredProperties = properties.filter((property) => {
    const query = search.toLowerCase()
    const matchesSearch =
      property.name.toLowerCase().includes(query) ||
      property.county.toLowerCase().includes(query) ||
      property.constituency.toLowerCase().includes(query) ||
      property.ward.toLowerCase().includes(query)
    if (!matchesSearch) return false

    if (filter === "all") return true
    const propertyBookings = bookings.filter((booking) => booking.propertyId === property.id)
    if (propertyBookings.length === 0) return false

    const today = new Date()
    if (filter === "booked") return propertyBookings.some((booking) => booking.status === "booked")
    if (filter === "reserved") return propertyBookings.some((booking) => booking.status === "reserved")
    if (filter === "cancelled") return propertyBookings.some((booking) => booking.status === "cancelled")
    if (filter === "occupied") {
      return propertyBookings.some((booking) => {
        if (booking.status !== "booked") return false
        const checkIn = parseDate(booking.checkIn)
        const checkOut = parseDate(booking.checkOut)
        return today >= checkIn && today <= checkOut
      })
    }
    if (filter === "past") {
      return propertyBookings.some((booking) => {
        if (booking.status !== "booked") return false
        const checkOut = parseDate(booking.checkOut)
        return checkOut < today
      })
    }
    return true
  })

  const cancellationForBooking = (bookingId: string) =>
    cancellations.find((item) => item.bookingId === bookingId && item.status === "PENDING")

  const submitCancellation = async () => {
    if (!userId || !cancelBooking || !cancelReason.trim()) return
    const response = await fetch("/api/host/cancellations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostId: userId,
        bookingId: cancelBooking.id,
        reason: cancelReason.trim(),
        suggestionPropertyId: cancelSuggestion || null,
      }),
    })
    if (!response.ok) return
    const data = await response.json()
    if (data.cancellation) {
      setCancellations((prev) => [
        {
          id: data.cancellation.id,
          bookingId: data.cancellation.bookingId,
          status: data.cancellation.status,
          reason: data.cancellation.reason,
          suggestionPropertyId: data.cancellation.suggestionPropertyId ?? undefined,
          createdAt: String(data.cancellation.createdAt || "").slice(0, 10),
        },
        ...prev,
      ])
    }
    setIsCancelModalOpen(false)
    setCancelBooking(null)
    setCancelReason("")
    setCancelSuggestion("")
  }

  const bookingStatusForDate = (propertyId: string, date: Date) => {
    const match = bookings.find((booking) => {
      if (booking.propertyId !== propertyId) return false
      const checkIn = parseDate(booking.checkIn)
      const checkOut = parseDate(booking.checkOut)
      return isBetweenInclusive(date, checkIn, checkOut)
    })
    return match ? match.status : null
  }

  return (
    <main className="min-h-screen bg-background">
      <HostNavbar />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Airbnb Calendars</h1>
            <p className="mt-2 text-sm text-muted-foreground">Check booking status for each listing.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/host")}>
            Back to Host
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full md:max-w-sm"
          />
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as "all" | "booked" | "cancelled" | "reserved" | "occupied" | "past")
            }
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground sm:w-auto"
          >
            <option value="all">All</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
            <option value="reserved">Reserved</option>
            <option value="occupied">Currently occupied</option>
            <option value="past">Past occupancy</option>
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredProperties.map((property) => {
            const monthDays = getMonthGrid(calendarDate)
            const monthLabel = calendarDate.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })

            return (
              <div key={property.id} className="rounded-lg border border-border bg-card p-4">
                <button
                  type="button"
                  className="flex w-full items-start gap-4 text-left"
                  onClick={() =>
                    setExpandedPropertyId((prev) => (prev === property.id ? null : property.id))
                  }
                >
                  <div className="h-16 w-20 overflow-hidden rounded-md border border-border bg-muted/30">
                    <img src={property.image} alt={property.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-foreground">{property.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {property.county}, {property.constituency}, {property.ward}
                    </p>
                  </div>
                </button>

                {expandedPropertyId === property.id && (
                  <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-semibold text-foreground">Booking Calendar</h5>
                        <p className="text-xs text-muted-foreground">
                          Booked, reserved, cancelled, and available days.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                          }
                        >
                          Prev
                        </Button>
                        <span className="text-sm font-medium text-foreground">{monthLabel}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-7 gap-2 text-xs">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                        <div key={`${property.id}-label-${label}`} className="text-center text-muted-foreground">
                          {label}
                        </div>
                      ))}
                      {monthDays.map((date, index) => {
                        if (!date) {
                          return <div key={`${property.id}-empty-${index}`} />
                        }
                        const status = bookingStatusForDate(property.id, date)
                        return (
                          <div
                            key={`${property.id}-${toDateKey(date)}`}
                            className={`flex h-9 w-full items-center justify-center rounded-md border text-xs font-medium ${
                              status === "booked"
                                ? "border-rose-500 bg-rose-500/10 text-rose-600"
                                : status === "reserved"
                                  ? "border-amber-500 bg-amber-500/10 text-amber-700"
                                  : status === "cancelled"
                                    ? "border-slate-400 bg-slate-100 text-slate-500 line-through"
                                    : "border-border bg-background text-foreground"
                            }`}
                          >
                            {date.getDate()}
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 rounded-lg border border-border bg-background p-3">
                      <h6 className="text-sm font-semibold text-foreground">Bookings</h6>
                      <div className="mt-2 space-y-2">
                        {bookings
                          .filter((booking) => booking.propertyId === property.id)
                          .map((booking) => {
                            const pendingCancel = cancellationForBooking(booking.id)
                            return (
                              <div
                                key={booking.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground"
                              >
                                <div>
                                  <span className="font-medium text-foreground">{booking.property}</span>
                                  <span className="ml-2 capitalize">{booking.status}</span>
                                  <span className="ml-2">
                                    {booking.checkIn} → {booking.checkOut}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {pendingCancel ? (
                                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] text-amber-700">
                                      Cancellation pending
                                    </span>
                                  ) : booking.status === "cancelled" ? (
                                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] text-slate-600">
                                      Cancelled
                                    </span>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setCancelBooking(booking)
                                        setCancelSuggestion("")
                                        setCancelReason("")
                                        setIsCancelModalOpen(true)
                                      }}
                                    >
                                      Request Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        {bookings.filter((booking) => booking.propertyId === property.id).length === 0 && (
                          <p className="text-xs text-muted-foreground">No bookings for this property yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                        <span>Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                        <span>Reserved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                        <span>Cancelled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full border border-border bg-background" />
                        <span>Available</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isCancelModalOpen && cancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Request Cancellation</h3>
                <p className="text-sm text-muted-foreground">
                  Provide a reason and optionally suggest another Airbnb.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Suggest another Airbnb (optional)</label>
                <select
                  value={cancelSuggestion}
                  onChange={(event) => setCancelSuggestion(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="">No suggestion</option>
                  {properties.map((property) => (
                    <option key={`suggest-${property.id}`} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="w-full bg-rose-500 text-white hover:bg-rose-600"
                onClick={submitCancellation}
                disabled={!cancelReason.trim()}
              >
                Send Cancellation Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
