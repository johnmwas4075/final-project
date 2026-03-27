"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageBell } from "@/components/message-bell"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"

const AUTH_KEY = "authUserId"
const AUTH_NAME_KEY = "authUserFirstName"
const HOST_SECTION_KEY = "hostActiveSection"

export default function HostPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [firstName, setFirstName] = useState<string>("there")
  const [activeSection, setActiveSection] = useState<string>("dashboard")
  const [bookingTab, setBookingTab] = useState<"checking-in" | "occupied" | "checking-out">("checking-in")
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [bookingSearch, setBookingSearch] = useState("")
  const [bookingFilter, setBookingFilter] = useState<"all" | "booked-today" | "cancelled-today" | "reserved">("all")
  const [expandedBookingPropertyId, setExpandedBookingPropertyId] = useState<string | null>(null)
  const [bookingCalendarDate, setBookingCalendarDate] = useState<Date>(new Date())
  const [availabilitySearch, setAvailabilitySearch] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "custom" | "default">("all")
  type EarningsType = "payment" | "withdrawal" | "transfer"
  type EarningsTx = {
    id: string
    type: EarningsType
    amount: number
    date: string
    note: string
    actorUserId: string
    sourceType: string
    sourceUserId?: string
    destinationType: string
    destinationUserId?: string
  }
  const [earningsTransactions, setEarningsTransactions] = useState<EarningsTx[]>([])
  const [earningsSearch, setEarningsSearch] = useState("")
  const [earningsFilter, setEarningsFilter] = useState<"all" | "payments" | "transfers" | "withdrawals">("all")
  const [earningsPage, setEarningsPage] = useState(1)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferNote, setTransferNote] = useState("")
  const [reviewsSearch, setReviewsSearch] = useState("")
  const [reviewProperties, setReviewProperties] = useState<
    {
      id: string
      name: string
      image: string
      county: string
      constituency: string
      ward: string
      reviews: {
        id: string
        stars: number
        comment: string
        accuracy: number
        cleanliness: number
        communication: number
        checkin: number
        location: number
        value: number
        hostRating: number
        reviewDate: string
        reviewer: string
      }[]
    }[]
  >([])
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
  const [properties, setProperties] = useState<any[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [editProperty, setEditProperty] = useState({
    id: "",
    name: "",
    price: "",
    nights: "",
    rooms: "",
    bathrooms: "",
    guests: "",
    county: "",
    constituency: "",
    ward: "",
    image: "",
    description: "",
  })
  const [editAmenities, setEditAmenities] = useState<Record<string, boolean>>({})
  const [editImages, setEditImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [imageError, setImageError] = useState<string>("")
  const weekDays = [
    { key: "mon", label: "Mon" },
    { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" },
    { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" },
    { key: "sat", label: "Sat" },
    { key: "sun", label: "Sun" },
  ] as const
  type WeekDayKey = (typeof weekDays)[number]["key"]
  type DateOverride = "available" | "unavailable"
  type PropertyAvailability = {
    useCustom: boolean
    weekly: Record<WeekDayKey, boolean>
    dateOverrides: Record<string, DateOverride>
  }
  const [mainWeeklyAvailability, setMainWeeklyAvailability] = useState<Record<WeekDayKey, boolean>>({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: true,
  })
  const [propertyAvailability, setPropertyAvailability] = useState<Record<string, PropertyAvailability>>({})
  const [expandedAvailabilityId, setExpandedAvailabilityId] = useState<string | null>(null)
  const [calendarAnchorDate, setCalendarAnchorDate] = useState<Date>(new Date())
  const [bookings, setBookings] = useState<
    {
      id: string
      username: string
      property: string
      propertyId: string
      checkIn: string
      checkOut: string
      status: "booked" | "reserved" | "cancelled"
      createdAt: string
      cancelledAt: string | null
      payment: string
    }[]
  >([])

  useEffect(() => {
    if (typeof window === "undefined") return
    const isAuthed = Boolean(window.localStorage.getItem(AUTH_KEY))
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
    const storedUserId = window.localStorage.getItem(AUTH_KEY)
    if (!isAuthed) {
      router.replace("/login")
      return
    }
    if (storedName) setFirstName(storedName)
    if (storedUserId) setUserId(storedUserId)
    const savedSection = window.localStorage.getItem(HOST_SECTION_KEY)
    if (savedSection) {
      setActiveSection(savedSection)
      window.localStorage.removeItem(HOST_SECTION_KEY)
    }
    setIsReady(true)
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
          images: property.photos ?? [],
          price: property.price ?? 0,
          nights: property.minNights ?? 1,
          rooms: property.rooms ?? 1,
          bathrooms: property.bathrooms ?? 1,
          guests: property.guests ?? 1,
          county: property.countyName ?? "",
          constituency: property.constituencyName ?? "",
          ward: property.wardName ?? "",
          active: true,
          amenities: Array.isArray(property.amenities) ? property.amenities : amenityOptions,
          ratings: {
            cleanliness: 0,
            accuracy: 0,
            communication: 0,
            location: 0,
            checkin: 0,
            value: 0,
          },
          description: property.description ?? "",
        }))
        setProperties(mapped)
      } catch (error) {
        setProperties([])
      }
    }
    loadProperties()
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const loadEarnings = async () => {
      try {
        const response = await fetch(`/api/host/earnings?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) return
        const data = await response.json()
        const mapped = (data.transactions ?? []).map((tx: any) => ({
          id: tx.id,
          type: (tx.type || "").toLowerCase(),
          amount: Number(tx.amount) || 0,
          note: tx.note || "",
          date: String(tx.createdAt || "").slice(0, 10),
          actorUserId: tx.actorUserId || "",
          sourceType: (tx.sourceType || "").toLowerCase(),
          sourceUserId: tx.sourceUserId || undefined,
          destinationType: (tx.destinationType || "").toLowerCase(),
          destinationUserId: tx.destinationUserId || undefined,
        }))
        setEarningsTransactions(mapped)
      } catch (error) {
        setEarningsTransactions([])
      }
    }
    loadEarnings()
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const loadReviews = async () => {
      try {
        const response = await fetch(`/api/host/reviews?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) return
        const data = await response.json()
        const mapped = (data.properties ?? []).map((property: any) => ({
          id: property.id,
          name: property.propertyName,
          image: property.photos?.[0] || "/images/property.jpg",
          county: property.countyName ?? "",
          constituency: property.constituencyName ?? "",
          ward: property.wardName ?? "",
          reviews: (property.reviews ?? []).map((review: any) => ({
            id: review.id,
            stars: review.stars ?? 0,
            comment: review.comment ?? "",
            accuracy: review.accuracy ?? 0,
            cleanliness: review.cleanliness ?? 0,
            communication: review.communication ?? 0,
            checkin: review.checkin ?? 0,
            location: review.location ?? 0,
            value: review.value ?? 0,
            hostRating: review.hostRating ?? 0,
            reviewDate: String(review.reviewDate || "").slice(0, 10),
            reviewer:
              review.user?.username ||
              [review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") ||
              "Guest",
          })),
        }))
        setReviewProperties(mapped)
      } catch {
        setReviewProperties([])
      }
    }
    loadReviews()
  }, [userId])

  useEffect(() => {
    if (!userId) return
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
          const paymentStatus = String(booking.paymentStatus || "").toLowerCase() || "pending"
          const username =
            booking.user?.username ||
            [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(" ") ||
            "Guest"
          return {
            id: booking.id,
            username: username.startsWith("@") ? username : `@${username}`,
            property: booking.property?.propertyName ?? "Unknown property",
            propertyId: booking.property?.id ?? "",
            checkIn: String(booking.checkIn || "").slice(0, 10),
            checkOut: String(booking.checkOut || "").slice(0, 10),
            status,
            createdAt: String(booking.createdAt || "").slice(0, 10),
            cancelledAt: rawStatus === "CANCELLED" ? String(booking.updatedAt || "").slice(0, 10) : null,
            payment: paymentStatus,
          }
        })
        setBookings(mapped)
      } catch (error) {
        setBookings([])
      }
    }
    loadBookings()
  }, [userId])

  useEffect(() => {
    if (properties.length === 0) return
    setPropertyAvailability((prev) => {
      const next = { ...prev }
      for (const property of properties) {
        if (!next[property.id]) {
          next[property.id] = {
            useCustom: false,
            weekly: { ...mainWeeklyAvailability },
            dateOverrides: {},
          }
        }
      }
      return next
    })
  }, [properties, mainWeeklyAvailability])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY)
      window.localStorage.removeItem(AUTH_NAME_KEY)
    }
    router.push("/login")
  }

  if (!isReady) return null

  const parseDate = (value: string) => {
    const [y, m, d] = value.split("-").map(Number)
    return new Date(y, m - 1, d)
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const addDays = (date: Date, days: number) => {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next
  }

  const toDateKey = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const isBetweenInclusive = (date: Date, start: Date, end: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
    return day >= s && day <= e
  }

  const bookingForDate = (propertyId: string, date: Date) => {
    return bookings.find((booking) => {
      if (booking.propertyId !== propertyId) return false
      const checkIn = parseDate(booking.checkIn)
      const checkOut = parseDate(booking.checkOut)
      return isBetweenInclusive(date, checkIn, checkOut)
    })
  }

  const getWeekdayKey = (date: Date): WeekDayKey => {
    const jsDay = date.getDay()
    const map: WeekDayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    return map[jsDay]
  }

  const isDateAvailable = (propertyId: string, date: Date) => {
    const override = propertyAvailability[propertyId]
    const weeklySource = override?.useCustom ? override.weekly : mainWeeklyAvailability
    const weekdayKey = getWeekdayKey(date)
    let available = weeklySource[weekdayKey]
    const key = toDateKey(date)
    const dateOverride = override?.dateOverrides?.[key]
    if (dateOverride === "unavailable") available = false
    if (dateOverride === "available") available = true
    return available
  }

  const toggleDateOverride = (propertyId: string, date: Date) => {
    const key = toDateKey(date)
    setPropertyAvailability((prev) => {
      const current = prev[propertyId]
      if (!current) return prev
      const existing = current.dateOverrides[key]
      const nextOverride: DateOverride | undefined =
        existing === "unavailable" ? "available" : existing === "available" ? undefined : "unavailable"
      const nextOverrides = { ...current.dateOverrides }
      if (nextOverride) {
        nextOverrides[key] = nextOverride
      } else {
        delete nextOverrides[key]
      }
      return {
        ...prev,
        [propertyId]: {
          ...current,
          dateOverrides: nextOverrides,
        },
      }
    })
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

  const today = new Date()

  const visibleBookings = bookings.filter((booking) => {
    const checkIn = parseDate(booking.checkIn)
    const checkOut = parseDate(booking.checkOut)

    if (bookingTab === "checking-in") {
      return isSameDay(today, checkIn)
    }

    if (bookingTab === "occupied") {
      return today > checkIn && today < checkOut
    }

    const showUntil = addDays(checkOut, 1)
    return isSameDay(today, checkOut) || isSameDay(today, showUntil)
  })

  const bookingsByProperty = (propertyId: string) =>
    bookings.filter((booking) => booking.propertyId === propertyId)

  const bookingMatchesDate = (booking: any, date: Date) => {
    const checkIn = parseDate(booking.checkIn)
    const checkOut = parseDate(booking.checkOut)
    return isBetweenInclusive(date, checkIn, checkOut)
  }

  const bookingStatusForDate = (propertyId: string, date: Date) => {
    const match = bookingsByProperty(propertyId).find((booking) => bookingMatchesDate(booking, date))
    return match ? match.status : null
  }

  const totalBookings = bookings.length
  const totalOccupied = bookings.filter((booking) => {
    if (booking.status !== "booked") return false
    const checkIn = parseDate(booking.checkIn)
    const checkOut = parseDate(booking.checkOut)
    return today >= checkIn && today <= checkOut
  }).length
  const totalReserved = bookings.filter((booking) => booking.status === "reserved").length
  const totalCancelled = bookings.filter((booking) => booking.status === "cancelled").length

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.property.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.username.toLowerCase().includes(bookingSearch.toLowerCase())
    if (bookingFilter === "booked-today") {
      return matchesSearch && booking.status === "booked" && isSameDay(today, parseDate(booking.createdAt))
    }
    if (bookingFilter === "cancelled-today") {
      return (
        matchesSearch &&
        booking.status === "cancelled" &&
        booking.cancelledAt &&
        isSameDay(today, parseDate(booking.cancelledAt))
      )
    }
    if (bookingFilter === "reserved") {
      return matchesSearch && booking.status === "reserved"
    }
    return matchesSearch
  })

  const paymentColor =
    bookingTab === "checking-in"
      ? "text-red-500"
      : bookingTab === "occupied"
        ? "text-yellow-500"
        : "text-green-500"

  const filteredProperties = properties.filter((property) => {
    const matchesQuery =
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.constituency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.ward.toLowerCase().includes(searchQuery.toLowerCase())

    if (statusFilter === "active") return property.active && matchesQuery
    if (statusFilter === "inactive") return !property.active && matchesQuery
    return matchesQuery
  })

  const filteredAvailabilityProperties = properties.filter((property) => {
    const matchesQuery =
      property.name.toLowerCase().includes(availabilitySearch.toLowerCase()) ||
      property.county.toLowerCase().includes(availabilitySearch.toLowerCase()) ||
      property.constituency.toLowerCase().includes(availabilitySearch.toLowerCase()) ||
      property.ward.toLowerCase().includes(availabilitySearch.toLowerCase())

    const availability = propertyAvailability[property.id]
    const useCustom = availability?.useCustom ?? false

    if (availabilityFilter === "custom") return useCustom && matchesQuery
    if (availabilityFilter === "default") return !useCustom && matchesQuery
    return matchesQuery
  })

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value)

  const paymentsTotal = earningsTransactions
    .filter((tx) => tx.type === "payment")
    .reduce((sum, tx) => sum + tx.amount, 0)
  const systemFee = Number((paymentsTotal * 0.05).toFixed(2))
  const revenueTotal = paymentsTotal - systemFee
  const withdrawalsTotal = earningsTransactions
    .filter((tx) => tx.type === "withdrawal")
    .reduce((sum, tx) => sum + tx.amount, 0)
  const transfersTotal = earningsTransactions
    .filter((tx) => tx.type === "transfer")
    .reduce((sum, tx) => sum + tx.amount, 0)
  const availableBalance = Math.max(revenueTotal - withdrawalsTotal - transfersTotal, 0)

  const filteredEarnings = earningsTransactions.filter((tx) => {
    const matchesSearch =
      tx.note.toLowerCase().includes(earningsSearch.toLowerCase()) ||
      tx.date.includes(earningsSearch) ||
      tx.type.includes(earningsSearch.toLowerCase())
    if (earningsFilter === "payments") return tx.type === "payment" && matchesSearch
    if (earningsFilter === "transfers") return tx.type === "transfer" && matchesSearch
    if (earningsFilter === "withdrawals") return tx.type === "withdrawal" && matchesSearch
    return matchesSearch
  })

  const earningsPageSize = 20
  const totalPages = Math.max(1, Math.ceil(filteredEarnings.length / earningsPageSize))
  const currentPage = Math.min(earningsPage, totalPages)
  const startIndex = (currentPage - 1) * earningsPageSize
  const pagedEarnings = filteredEarnings.slice(startIndex, startIndex + earningsPageSize)

  const allReviews = reviewProperties.flatMap((property) => property.reviews)
  const totalReviews = allReviews.length
  const totalComments = allReviews.filter((review) => review.comment && review.comment.trim().length > 0).length
  const sumStars = allReviews.reduce((sum, review) => sum + review.stars, 0)
  const sumAccuracy = allReviews.reduce((sum, review) => sum + review.accuracy, 0)
  const sumCheckin = allReviews.reduce((sum, review) => sum + review.checkin, 0)
  const sumCleanliness = allReviews.reduce((sum, review) => sum + review.cleanliness, 0)
  const sumCommunication = allReviews.reduce((sum, review) => sum + review.communication, 0)
  const sumHostRating = allReviews.reduce((sum, review) => sum + review.hostRating, 0)
  const avg = (sum: number) => (totalReviews > 0 ? (sum / totalReviews).toFixed(2) : "0.00")
  const filteredReviewProperties = reviewProperties.filter((property) => {
    const query = reviewsSearch.toLowerCase()
    return (
      property.name.toLowerCase().includes(query) ||
      property.county.toLowerCase().includes(query) ||
      property.constituency.toLowerCase().includes(query) ||
      property.ward.toLowerCase().includes(query)
    )
  })

  const openPropertyModal = (propertyId: string) => {
    const property = properties.find((item) => item.id === propertyId)
    if (!property) return
    setSelectedPropertyId(propertyId)
    setEditProperty({
      id: property.id,
      name: property.name,
      price: String(property.price),
      nights: String(property.nights),
      rooms: String(property.rooms ?? 1),
      bathrooms: String(property.bathrooms ?? 1),
      guests: String(property.guests ?? 1),
      county: property.county,
      constituency: property.constituency,
      ward: property.ward,
      image: property.image,
      description: property.description,
    })
    setEditImages(property.images ?? [property.image])
    setNewImages([])
    setImageError("")
    setEditAmenities(
      property.amenities.reduce<Record<string, boolean>>((acc, amenity) => {
        acc[amenity.key] = amenity.available
        return acc
      }, {})
    )
    setIsPropertyModalOpen(true)
  }

  const savePropertyChanges = async () => {
    if (editImages.length < 5 || editImages.length > 10) {
      setImageError("Please keep between 5 and 10 images.")
      return
    }
    if (!userId) return

    const payload = {
      userId,
      propertyId: editProperty.id,
      propertyName: editProperty.name,
      description: editProperty.description,
      price: Number(editProperty.price),
      rooms: Number(editProperty.rooms),
      bathrooms: Number(editProperty.bathrooms),
      guests: Number(editProperty.guests),
      minNights: Number(editProperty.nights),
      photos: editImages,
      amenities: amenityOptions.map((amenity) => ({
        ...amenity,
        available: Boolean(editAmenities[amenity.key]),
      })),
      countyName: editProperty.county,
      constituencyName: editProperty.constituency,
      wardName: editProperty.ward,
    }

    try {
      const response = await fetch("/api/host/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const data = await response.json()
        const updated = data.property
        setProperties((prev) =>
          prev.map((property) =>
            property.id === editProperty.id
              ? {
                  ...property,
                  name: updated.propertyName,
                  price: updated.price,
                  nights: updated.minNights,
                  rooms: updated.rooms,
                  bathrooms: updated.bathrooms,
                  guests: updated.guests,
                  county: updated.countyName ?? "",
                  constituency: updated.constituencyName ?? "",
                  ward: updated.wardName ?? "",
                  image: updated.photos?.[0] || property.image,
                  images: updated.photos ?? property.images,
                  description: updated.description ?? property.description,
                  amenities: updated.amenities ?? property.amenities,
                }
              : property
          )
        )
      }
    } catch (error) {
      // ignore for now
    }
    setProperties((prev) =>
      prev.map((property) =>
        property.id === editProperty.id
          ? {
              ...property,
              name: editProperty.name,
              price: Number(editProperty.price),
              nights: Number(editProperty.nights),
              rooms: Number(editProperty.rooms),
              bathrooms: Number(editProperty.bathrooms),
              guests: Number(editProperty.guests),
              county: editProperty.county,
              constituency: editProperty.constituency,
              ward: editProperty.ward,
              image: editImages[0] || editProperty.image,
              images: editImages,
              description: editProperty.description,
              amenities: amenityOptions.map((amenity) => ({
                ...amenity,
                available: Boolean(editAmenities[amenity.key]),
              })),
            }
          : property
      )
    )
    setIsPropertyModalOpen(false)
  }

  const addEarningsTx = async (type: EarningsType, amount: number, note: string) => {
    if (!userId) return
    const response = await fetch("/api/host/earnings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        actorUserId: userId,
        type: type.toUpperCase(),
        amount,
        note,
      }),
    })
    if (!response.ok) return
    const data = await response.json()
    const tx = data.transaction
    if (!tx) return
    setEarningsTransactions((prev) => [
      {
        id: tx.id,
        type: (tx.type || "").toLowerCase(),
        amount: Number(tx.amount) || 0,
        note: tx.note || "",
        date: String(tx.createdAt || "").slice(0, 10),
        actorUserId: tx.actorUserId || "",
        sourceType: (tx.sourceType || "").toLowerCase(),
        sourceUserId: tx.sourceUserId || undefined,
        destinationType: (tx.destinationType || "").toLowerCase(),
        destinationUserId: tx.destinationUserId || undefined,
      },
      ...prev,
    ])
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-rose-500 font-brand">Dwellify</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Message and Notification icons - visible on all screen sizes */}

            <MessageBell role="host" className="rounded-full" href="/messages" />

            <NotificationBell role="host" className="rounded-full" href="/notifications" />

            {/* Mobile/Desktop hamburger menu button */}
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
                  {/* Host navigation items */}
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium"
                      onClick={() => setActiveSection("dashboard")}
                    >
                      Dashboard
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("airbnbs")}
                    >
                      My Dwellify listings
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("availability")}
                    >
                      Availability Dates
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("earnings")}
                    >
                      Earnings and Finances
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("bookings")}
                    >
                      Bookings and Management
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("reviews")}
                    >
                      Reviews and Ratings
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("settings")}
                    >
                      Host Settings
                    </Button>
                  </SheetClose>

                  {/* Separator */}
                  <div className="my-2 border-t border-border" />

                  {/* Profile links */}
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/")}
                    >
                      Main page
                    </Button>
                  </SheetClose>

                  {/* Logout separator */}
                  <div className="my-2 border-t border-border" />

                  {/* Logout */}
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

            {/* Desktop menu items */}
            <Button
              variant="ghost"
              className="hidden rounded-full text-sm font-medium md:inline-flex"
              onClick={() => router.push("/userpage")}
            >
              Client page
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full px-4 py-6 sm:px-6">
        <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden lg:flex-row">
          <aside className="hidden h-full w-full flex-shrink-0 border-b border-border bg-background p-4 lg:block lg:w-[240px] lg:border-b-0 lg:border-r">
            <nav className="space-y-0 text-sm">
              <button 
                onClick={() => setActiveSection("dashboard")}
                className={`w-full rounded-md px-3 py-2 text-left font-medium transition-colors ${
                  activeSection === "dashboard" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Dashboard
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("airbnbs")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "airbnbs" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                My Dwellify listings
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("availability")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "availability" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Availability Dates
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("earnings")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "earnings" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Earnings and Finances
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("bookings")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "bookings" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Bookings and Management
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("reviews")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "reviews" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Reviews and Ratings
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("settings")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "settings" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Host Settings
              </button>
            </nav>
          </aside>

          <section className="min-w-0 flex-1 overflow-y-auto bg-background p-6">
            {activeSection === "dashboard" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
                <p className="mt-4 text-muted-foreground">Welcome to your host dashboard, {firstName}!</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Check-in Today</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">0</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Check-out Today</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">0</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Active Listings</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">0</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <Button
                    variant={bookingTab === "checking-in" ? "default" : "outline"}
                    className={bookingTab === "checking-in" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                    onClick={() => setBookingTab("checking-in")}
                  >
                    Checking In
                  </Button>
                  <Button
                    variant={bookingTab === "occupied" ? "default" : "outline"}
                    className={bookingTab === "occupied" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                    onClick={() => setBookingTab("occupied")}
                  >
                    Occupied
                  </Button>
                  <Button
                    variant={bookingTab === "checking-out" ? "default" : "outline"}
                    className={bookingTab === "checking-out" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                    onClick={() => setBookingTab("checking-out")}
                  >
                    Checking Out
                  </Button>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Username</th>
                          <th className="px-4 py-3 font-medium">Property</th>
                          <th className="px-4 py-3 font-medium">Check-in</th>
                          <th className="px-4 py-3 font-medium">Check-out</th>
                          <th className="px-4 py-3 font-medium">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleBookings.map((booking, index) => (
                          <tr key={`${booking.username}-${index}`} className="border-b border-border">
                            <td className="px-4 py-3 text-muted-foreground">{booking.username}</td>
                            <td className="px-4 py-3 text-muted-foreground">{booking.property}</td>
                            <td className="px-4 py-3 text-muted-foreground">{booking.checkIn}</td>
                            <td className="px-4 py-3 text-muted-foreground">{booking.checkOut}</td>
                            <td className={`px-4 py-3 font-medium ${paymentColor}`}>{booking.payment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "airbnbs" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">My Dwellify listings</h2>
                <p className="mt-4 text-muted-foreground">Manage your current listings.</p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-foreground">Current Listings</h3>
                  <Button
                    className="bg-rose-500 text-white hover:bg-rose-600"
                    onClick={() => router.push("/host/add")}
                  >
                    Add listing
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Input
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:max-w-sm"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="rounded-lg border border-border bg-card p-4">
                      <button
                        className="w-full text-left"
                        onClick={() => openPropertyModal(property.id)}
                      >
                        <div className="h-40 w-full overflow-hidden rounded-md border border-border bg-muted/30">
                          <img
                            src={property.image}
                            alt={property.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-4 space-y-1">
                          <h4 className="text-lg font-semibold text-foreground">{property.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {property.county}, {property.constituency}, {property.ward}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            KSh {property.price} � {property.nights} nights
                          </p>
                        </div>
                      </button>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {property.active ? "Active" : "Inactive"}
                        </span>
                        <Switch
                          checked={property.active}
                          onCheckedChange={(checked) =>
                            setProperties((prev) =>
                              prev.map((item) =>
                                item.id === property.id ? { ...item, active: checked } : item
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "availability" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Availability Dates</h2>
                <p className="mt-4 text-muted-foreground">Set default availability and override per listing.</p>

                <div className="sticky top-16 z-30 -mx-4 mt-6 border-y border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      placeholder="Search listings..."
                      value={availabilitySearch}
                      onChange={(event) => setAvailabilitySearch(event.target.value)}
                      className="w-full md:max-w-sm"
                    />
                    <select
                      value={availabilityFilter}
                      onChange={(event) => setAvailabilityFilter(event.target.value as "all" | "custom" | "default")}
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground sm:w-auto"
                    >
                      <option value="all">All listings</option>
                      <option value="custom">Custom availability</option>
                      <option value="default">Default availability</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Days Available</h3>
                      <p className="text-sm text-muted-foreground">This applies to all properties by default.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.key}
                          onClick={() =>
                            setMainWeeklyAvailability((prev) => ({
                              ...prev,
                              [day.key]: !prev[day.key],
                            }))
                          }
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            mainWeeklyAvailability[day.key]
                              ? "border-border bg-background text-foreground hover:bg-muted"
                              : "border-rose-500 bg-rose-500/10 text-rose-600"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {filteredAvailabilityProperties.map((property) => {
                    const availability = propertyAvailability[property.id]
                    const useCustom = availability?.useCustom ?? false
                    const monthDays = getMonthGrid(calendarAnchorDate)
                    const monthLabel = calendarAnchorDate.toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                    })

                    return (
                      <div key={property.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex w-full items-start gap-4">
                          <button
                            type="button"
                            className="flex flex-1 items-start gap-4 text-left"
                            onClick={() =>
                              setExpandedAvailabilityId((prev) => (prev === property.id ? null : property.id))
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
                              <p className="mt-1 text-xs text-muted-foreground">
                                {useCustom ? "Using custom availability" : "Using main availability"}
                              </p>
                            </div>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Custom</span>
                            <Switch
                              checked={useCustom}
                              onCheckedChange={(checked) =>
                                setPropertyAvailability((prev) => ({
                                  ...prev,
                                  [property.id]: {
                                    ...(prev[property.id] ?? {
                                      useCustom: false,
                                      weekly: { ...mainWeeklyAvailability },
                                      dateOverrides: {},
                                    }),
                                    useCustom: checked,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {weekDays.map((day) => (
                            <button
                              key={`${property.id}-${day.key}`}
                              onClick={() =>
                                setPropertyAvailability((prev) => {
                                  const current = prev[property.id]
                                  if (!current) return prev
                                  const nextWeekly = {
                                    ...current.weekly,
                                    [day.key]: !current.weekly[day.key],
                                  }
                                  return {
                                    ...prev,
                                    [property.id]: { ...current, weekly: nextWeekly },
                                  }
                                })
                              }
                              disabled={!useCustom}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                (useCustom ? availability?.weekly[day.key] : mainWeeklyAvailability[day.key])
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                                  : "border-border bg-background text-muted-foreground hover:bg-muted"
                              } ${useCustom ? "" : "opacity-60"}`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>

                        {expandedAvailabilityId === property.id && (
                          <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <h5 className="text-sm font-semibold text-foreground">Monthly Overrides</h5>
                                <p className="text-xs text-muted-foreground">
                                  Click a date to toggle unavailable ? available ? default.
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCalendarAnchorDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                                  }
                                >
                                  Prev
                                </Button>
                                <span className="text-sm font-medium text-foreground">{monthLabel}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCalendarAnchorDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                                  }
                                >
                                  Next
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-7 gap-2 text-xs">
                              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                                <div key={`${property.id}-${label}`} className="text-center text-muted-foreground">
                                  {label}
                                </div>
                              ))}
                              {monthDays.map((date, index) => {
                                if (!date) {
                                  return <div key={`${property.id}-empty-${index}`} />
                                }
                                const key = toDateKey(date)
                                const override = availability?.dateOverrides?.[key]
                                const available = isDateAvailable(property.id, date)
                                const booking = bookingForDate(property.id, date)
                                return (
                                  <button
                                    type="button"
                                    key={`${property.id}-${key}`}
                                    onClick={() => toggleDateOverride(property.id, date)}
                                    title={
                                      booking
                                        ? `${booking.username} � ${booking.checkIn} ? ${booking.checkOut}`
                                        : undefined
                                    }
                                    className={`relative flex h-9 w-full items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                                      booking
                                        ? "border-slate-400 bg-slate-100 text-slate-500 line-through"
                                        : override === "unavailable"
                                          ? "border-rose-500 bg-rose-500/10 text-rose-600"
                                          : override === "available"
                                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                                            : available
                                              ? "border-border bg-background text-foreground hover:bg-muted"
                                              : "border-amber-500 bg-amber-500/10 text-amber-700"
                                    }`}
                                  >
                                    {date.getDate()}
                                  </button>
                                )
                              })}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                                <span>Unavailable (override)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                                <span>Available (override)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                                <span>Unavailable (weekly default)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full border border-border bg-background" />
                                <span>Available (weekly default)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-slate-300" />
                                <span>Booked</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeSection === "earnings" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Earnings and Finances</h2>
                <p className="mt-4 text-muted-foreground">Track your revenue, payments, transfers, and withdrawals.</p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Revenue (net)</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(revenueTotal)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Payments {formatCurrency(paymentsTotal)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Withdrawn</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(withdrawalsTotal)}</p>
                    <div className="mt-3">
                      <Button
                        className="bg-rose-500 text-white hover:bg-rose-600"
                        onClick={() => setIsWithdrawModalOpen(true)}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(availableBalance)}</p>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => setIsTransferModalOpen(true)}>
                        Transfer to Client
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-foreground">Transactions</h3>
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(startIndex + earningsPageSize, filteredEarnings.length)} of{" "}
                      {filteredEarnings.length}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Input
                      placeholder="Search transactions..."
                      value={earningsSearch}
                      onChange={(event) => {
                        setEarningsSearch(event.target.value)
                        setEarningsPage(1)
                      }}
                      className="w-full md:max-w-sm"
                    />
                    <select
                      value={earningsFilter}
                      onChange={(event) => {
                        setEarningsFilter(event.target.value as "all" | "payments" | "transfers" | "withdrawals")
                        setEarningsPage(1)
                      }}
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground sm:w-auto"
                    >
                      <option value="all">All</option>
                      <option value="payments">Payments received</option>
                      <option value="transfers">Transfers</option>
                      <option value="withdrawals">Withdrawals</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2 text-sm">
                      <Button
                        variant="outline"
                        onClick={() => setEarningsPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEarningsPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Actor</th>
                          <th className="px-4 py-3 font-medium">Flow</th>
                          <th className="px-4 py-3 font-medium">Note</th>
                          <th className="px-4 py-3 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedEarnings.map((tx) => (
                          <tr key={tx.id} className="border-b border-border">
                            <td className="px-4 py-3 text-muted-foreground">{tx.date}</td>
                            <td className="px-4 py-3 text-muted-foreground capitalize">{tx.type}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {tx.actorUserId
                                ? tx.actorUserId === userId
                                  ? "You"
                                  : `${tx.actorUserId.slice(0, 8)}...`
                                : "�"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground capitalize">
                              {tx.sourceType} ? {tx.destinationType}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{tx.note}</td>
                            <td className="px-4 py-3 text-right font-medium text-foreground">
                              {formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        ))}
                        {pagedEarnings.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                              No transactions yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "bookings" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Bookings and Management</h2>
                <p className="mt-4 text-muted-foreground">Track bookings across all your properties.</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Manage calendars per property.</span>
                  <Button
                    className="bg-rose-500 text-white hover:bg-rose-600"
                    onClick={() => router.push("/host/airbnbs")}
                  >
                    Check listings
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total bookings since hosting</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{totalBookings}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total bookings on all properties</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{totalBookings}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Currently occupied</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{totalOccupied}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total cancelled</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{totalCancelled}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Input
                    placeholder="Search bookings..."
                    value={bookingSearch}
                    onChange={(event) => setBookingSearch(event.target.value)}
                    className="w-full md:max-w-sm"
                  />
                  <select
                    value={bookingFilter}
                    onChange={(event) =>
                      setBookingFilter(event.target.value as "all" | "booked-today" | "cancelled-today" | "reserved")
                    }
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground sm:w-auto"
                  >
                    <option value="all">All</option>
                    <option value="booked-today">Booked today</option>
                    <option value="cancelled-today">Cancelled today</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Guest</th>
                          <th className="px-4 py-3 font-medium">Property</th>
                          <th className="px-4 py-3 font-medium">Check-in</th>
                          <th className="px-4 py-3 font-medium">Check-out</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking, index) => (
                          <tr key={`${booking.username}-${index}`} className="border-b border-border">
                            <td className="px-4 py-3 text-muted-foreground">{booking.username}</td>
                            <td className="px-4 py-3 text-muted-foreground">{booking.property}</td>
                            <td className="px-4 py-3 text-muted-foreground">{booking.checkIn}</td>
                            <td className="px-4 py-3 text-muted-foreground">{booking.checkOut}</td>
                            <td className="px-4 py-3 text-muted-foreground capitalize">{booking.status}</td>
                          </tr>
                        ))}
                        {filteredBookings.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                              No bookings match this filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {activeSection === "reviews" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Reviews and Ratings</h2>
                <p className="mt-4 text-muted-foreground">Track performance across all your listings.</p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total reviews</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{totalReviews}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Comments: {totalComments}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Average stars</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{avg(sumStars)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Total stars: {sumStars}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Average host rating</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{avg(sumHostRating)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Average cleanliness</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{avg(sumCleanliness)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Average accuracy</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{avg(sumAccuracy)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Average communication</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{avg(sumCommunication)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Average check-in</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{avg(sumCheckin)}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Input
                    placeholder="Search properties..."
                    value={reviewsSearch}
                    onChange={(event) => setReviewsSearch(event.target.value)}
                    className="w-full md:max-w-sm"
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredReviewProperties.map((property) => {
                    const reviewCount = property.reviews.length
                    const ratingSum = property.reviews.reduce((sum, review) => sum + review.stars, 0)
                    const avgRating = reviewCount > 0 ? (ratingSum / reviewCount).toFixed(2) : "0.00"
                    const avgAccuracy =
                      reviewCount > 0
                        ? (property.reviews.reduce((sum, review) => sum + review.accuracy, 0) / reviewCount).toFixed(2)
                        : "0.00"
                    const avgCheckin =
                      reviewCount > 0
                        ? (property.reviews.reduce((sum, review) => sum + review.checkin, 0) / reviewCount).toFixed(2)
                        : "0.00"
                    const avgCleanliness =
                      reviewCount > 0
                        ? (property.reviews.reduce((sum, review) => sum + review.cleanliness, 0) / reviewCount).toFixed(2)
                        : "0.00"
                    const avgCommunication =
                      reviewCount > 0
                        ? (property.reviews.reduce((sum, review) => sum + review.communication, 0) / reviewCount).toFixed(2)
                        : "0.00"
                    const avgHost =
                      reviewCount > 0
                        ? (property.reviews.reduce((sum, review) => sum + review.hostRating, 0) / reviewCount).toFixed(2)
                        : "0.00"
                    return (
                      <button
                        key={`review-${property.id}`}
                        type="button"
                        className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
                        onClick={() => router.push(`/host/reviews/${property.id}`)}
                      >
                        <div className="h-36 w-full overflow-hidden rounded-md border border-border bg-muted/30">
                          <img src={property.image} alt={property.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="mt-4 space-y-1">
                          <h4 className="text-lg font-semibold text-foreground">{property.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {property.county}, {property.constituency}, {property.ward}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg stars {avgRating} � {reviewCount} reviews
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                            <span>Accuracy {avgAccuracy}</span>
                            <span>Check-in {avgCheckin}</span>
                            <span>Cleanliness {avgCleanliness}</span>
                            <span>Communication {avgCommunication}</span>
                            <span>Host {avgHost}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                  {filteredReviewProperties.length === 0 && (
                    <p className="text-sm text-muted-foreground">No properties match your search.</p>
                  )}
                </div>
              </div>
            )}

            {activeSection === "settings" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Host Settings</h2>
                <p className="mt-4 text-muted-foreground">Manage your host profile and preferences.</p>
              </div>
            )}
          </section>
        </div>
      </div>
      {isPropertyModalOpen && selectedPropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Edit Property</h3>
                <p className="text-sm text-muted-foreground">Update the details of this listing.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPropertyModalOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Property Name</label>
                <Input
                  value={editProperty.name}
                  onChange={(e) => setEditProperty((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Price (KSh)</label>
                <Input
                  type="number"
                  value={editProperty.price}
                  onChange={(e) => setEditProperty((prev) => ({ ...prev, price: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Number of Nights</label>
                <Input
                  type="number"
                  min={1}
                  value={editProperty.nights}
                  onChange={(e) => setEditProperty((prev) => ({ ...prev, nights: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Bedrooms</label>
                <Input
                  type="number"
                  min={1}
                  value={editProperty.rooms}
                  onChange={(e) => setEditProperty((prev) => ({ ...prev, rooms: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Bathrooms</label>
                <Input
                  type="number"
                  min={1}
                  value={editProperty.bathrooms}
                  onChange={(e) => setEditProperty((prev) => ({ ...prev, bathrooms: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Guests</label>
                <Input
                  type="number"
                  min={1}
                  value={editProperty.guests}
                  onChange={(e) => setEditProperty((prev) => ({ ...prev, guests: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Location</label>
                <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-3">
                  <Input
                    placeholder="County"
                    value={editProperty.county}
                    onChange={(e) => setEditProperty((prev) => ({ ...prev, county: e.target.value }))}
                  />
                  <Input
                    placeholder="Constituency"
                    value={editProperty.constituency}
                    onChange={(e) => setEditProperty((prev) => ({ ...prev, constituency: e.target.value }))}
                  />
                  <Input
                    placeholder="Ward"
                    value={editProperty.ward}
                    onChange={(e) => setEditProperty((prev) => ({ ...prev, ward: e.target.value }))}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Photo URL</label>
                <Input
                  value={editProperty.image}
                  onChange={(e) => setEditProperty((prev) => ({ ...prev, image: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Upload Images</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? [])
                    const total = editImages.length + files.length
                    if (total < 5 || total > 10) {
                      setImageError("Please keep between 5 and 10 images.")
                      setNewImages([])
                      return
                    }
                    setImageError("")
                    setNewImages(files)
                    const previews = files.map((file) => URL.createObjectURL(file))
                    setEditImages((prev) => [...prev, ...previews])
                  }}
                  className="mt-2 w-full text-sm text-muted-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">Minimum 5 images, maximum 10 images. JPG, PNG, JPEG, or WebP.</p>
                {imageError ? <p className="mt-1 text-xs text-red-500">{imageError}</p> : null}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Current Images</label>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {editImages.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="group relative h-24 overflow-hidden rounded-md border border-border bg-muted/20"
                    >
                      <img src={src} alt={`Property ${index + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditImages((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Remove
                        </Button>
                        {index > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditImages((prev) => {
                                const next = [...prev]
                                const [item] = next.splice(index, 1)
                                next.splice(index - 1, 0, item)
                                return next
                              })
                            }
                          >
                            Move Left
                          </Button>
                        )}
                        {index < editImages.length - 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditImages((prev) => {
                                const next = [...prev]
                                const [item] = next.splice(index, 1)
                                next.splice(index + 1, 0, item)
                                return next
                              })
                            }
                          >
                            Move Right
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">The first image is used as the cover.</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  rows={4}
                  value={editProperty.description}
                  onChange={(e) => setEditProperty((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-muted/20 p-4">
              <h4 className="text-sm font-semibold text-foreground">Ratings (read-only)</h4>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {properties
                  .find((item) => item.id === selectedPropertyId)
                  ?.ratings && (
                    <>
                      <p>Cleanliness: {properties.find((item) => item.id === selectedPropertyId)?.ratings.cleanliness}</p>
                      <p>Accuracy: {properties.find((item) => item.id === selectedPropertyId)?.ratings.accuracy}</p>
                      <p>Communication: {properties.find((item) => item.id === selectedPropertyId)?.ratings.communication}</p>
                      <p>Location: {properties.find((item) => item.id === selectedPropertyId)?.ratings.location}</p>
                      <p>Check-in: {properties.find((item) => item.id === selectedPropertyId)?.ratings.checkin}</p>
                      <p>Value: {properties.find((item) => item.id === selectedPropertyId)?.ratings.value}</p>
                    </>
                  )}
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-background p-4">
              <h4 className="text-sm font-semibold text-foreground">Amenities</h4>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {amenityOptions.map((amenity) => (
                  <label key={amenity.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(editAmenities[amenity.key])}
                      onChange={(event) =>
                        setEditAmenities((prev) => ({
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

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPropertyModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-rose-500 text-white hover:bg-rose-600" onClick={savePropertyChanges}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Withdraw Funds</h3>
                <p className="text-sm text-muted-foreground">Send funds to your payout method.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsWithdrawModalOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Amount</label>
                <Input
                  type="number"
                  min={1}
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Available: {formatCurrency(availableBalance)}
                </p>
              </div>
              <Button
                className="w-full bg-rose-500 text-white hover:bg-rose-600"
                onClick={() => {
                  const amount = Number(withdrawAmount)
                  if (!amount || amount > availableBalance) return
                  addEarningsTx("withdrawal", amount, "Host withdrawal")
                  setWithdrawAmount("")
                  setIsWithdrawModalOpen(false)
                }}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        </div>
      )}

      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Transfer to Client</h3>
                <p className="text-sm text-muted-foreground">Move funds to your client wallet.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsTransferModalOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Amount</label>
                <Input
                  type="number"
                  min={1}
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(event.target.value)}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Available: {formatCurrency(availableBalance)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Note</label>
                <Textarea
                  rows={3}
                  value={transferNote}
                  onChange={(event) => setTransferNote(event.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                className="w-full bg-rose-500 text-white hover:bg-rose-600"
                onClick={() => {
                  const amount = Number(transferAmount)
                  if (!amount || amount > availableBalance) return
                  addEarningsTx("transfer", amount, transferNote || "Transfer to client wallet")
                  setTransferAmount("")
                  setTransferNote("")
                  setIsTransferModalOpen(false)
                }}
              >
                Confirm Transfer
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

