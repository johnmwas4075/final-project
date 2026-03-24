"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageBell } from "@/components/message-bell"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
const AUTH_PHONE_KEY = "authUserPhone"

type WrittenReview = {
  id: string
  propertyId: string
  propertyName: string
  hostId: string
  reviewerName: string
  reviewDate: string
  stars: number
  rating: string
  comment: string
  cleanliness: number
  accuracy: number
  communication: number
  location: number
  checkin: number
  value: number
  hostRating: number
  checkIn: string
  checkOut: string
}

type PendingBooking = {
  id: string
  propertyId: string
  propertyName: string
  hostId: string
  checkIn: string
  checkOut: string
}

export default function UserPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [firstName, setFirstName] = useState<string>("there")
  const [activeSection, setActiveSection] = useState<string>("dashboard")
  const [bookingTab, setBookingTab] = useState<"pending" | "past" | "cancelled">("pending")
  const [reviewTab, setReviewTab] = useState<"pending" | "written">("written")
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [writtenReviews, setWrittenReviews] = useState<WrittenReview[]>([])
  const [pendingReviews, setPendingReviews] = useState<PendingBooking[]>([])
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string>("")
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [selectedBookingDates, setSelectedBookingDates] = useState<{ checkIn: string; checkOut: string } | null>(null)
  const [addReviewProperty, setAddReviewProperty] = useState<string>("")
  const [newReview, setNewReview] = useState({
    stars: "",
    rating: "",
    comment: "",
    cleanliness: "",
    accuracy: "",
    communication: "",
    location: "",
    checkin: "",
    value: "",
    host: "",
  })
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [transactionTab, setTransactionTab] = useState<"all" | "payments" | "deposits" | "withdrawals">("all")
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [depositPhone, setDepositPhone] = useState("712345678")
  const [saveDepositPhone, setSaveDepositPhone] = useState(true)
  const [depositMethod, setDepositMethod] = useState<"mpesa" | "card" | "bank" | "paypal">("mpesa")
  const [depositStep, setDepositStep] = useState<"details" | "confirm" | "send" | "success">("details")
  const [cardType, setCardType] = useState<"visa" | "mastercard">("visa")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  })
  const [bankAccount, setBankAccount] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<"mpesa" | "bank" | "paypal">("mpesa")
  const [withdrawPhone, setWithdrawPhone] = useState("712345678")
  const [withdrawStep, setWithdrawStep] = useState<"details" | "confirm" | "success">("details")
  const [selectedReview, setSelectedReview] = useState<{
    property: string
    propertyId: string
    hostId: string
    reviewerName: string
    date: string
    stars: string
    rating: string
    comment: string
    checkIn: string
    checkOut: string
    ratings: {
      cleanliness: number
      accuracy: number
      communication: number
      location: number
      checkin: number
      value: number
      hostRating: number
    }
  } | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const isAuthed = Boolean(window.localStorage.getItem(AUTH_KEY))
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
    if (!isAuthed) {
      router.replace("/login")
      return
    }
    const storedPhone = window.localStorage.getItem(AUTH_PHONE_KEY)
    if (storedPhone) {
      const sanitized = storedPhone.replace(/^\+254/, "").replace(/\s+/g, "")
      setDepositPhone(sanitized)
      setWithdrawPhone(sanitized)
    }
    setUserId(window.localStorage.getItem(AUTH_KEY))
    if (storedName) setFirstName(storedName)
    setIsReady(true)
  }, [router])

  useEffect(() => {
    if (!userId) return
    const loadReviews = async () => {
      setIsReviewsLoading(true)
      setReviewsError("")
      try {
        const response = await fetch(`/api/reviews?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) {
          throw new Error("Failed to load reviews")
        }
        const data = await response.json()
        const written = (data.written ?? []).map((review: any) => ({
          id: review.id,
          propertyId: review.property?.id ?? "",
          propertyName: review.property?.propertyName ?? "Unknown property",
          hostId: review.property?.userId ?? "",
          reviewerName: review.user?.username || review.user?.firstName || "Guest",
          reviewDate: review.reviewDate,
          stars: review.stars,
          rating: review.rating,
          comment: review.comment,
          cleanliness: review.cleanliness,
          accuracy: review.accuracy,
          communication: review.communication,
          location: review.location,
          checkin: review.checkin,
          value: review.value,
          hostRating: review.hostRating,
          checkIn: review.booking?.checkIn,
          checkOut: review.booking?.checkOut,
        }))
        const pending = (data.pending ?? []).map((booking: any) => ({
          id: booking.id,
          propertyId: booking.property?.id ?? "",
          propertyName: booking.property?.propertyName ?? "Unknown property",
          hostId: booking.property?.userId ?? "",
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        }))
        setWrittenReviews(written)
        setPendingReviews(pending)
      } catch (error) {
        setReviewsError("Unable to load reviews.")
      } finally {
        setIsReviewsLoading(false)
      }
    }
    loadReviews()
  }, [userId])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY)
      window.localStorage.removeItem(AUTH_NAME_KEY)
    }
    router.push("/login")
  }

  const openReviewModal = (review: {
    property: string
    propertyId: string
    hostId: string
    date: string
    stars: string
    rating: string
    comment: string
    checkIn: string
    checkOut: string
    ratings: {
      cleanliness: number
      accuracy: number
      communication: number
      location: number
      checkin: number
      value: number
      hostRating: number
    }
  }) => {
    setSelectedReview(review)
    setIsReviewModalOpen(true)
  }

  const openAddReviewModal = (booking: PendingBooking) => {
    setAddReviewProperty(booking.propertyName)
    setSelectedBookingId(booking.id)
    setSelectedBookingDates({ checkIn: booking.checkIn, checkOut: booking.checkOut })
    setNewReview({
      stars: "",
      rating: "",
      comment: "",
      cleanliness: "",
      accuracy: "",
      communication: "",
      location: "",
      checkin: "",
      value: "",
      host: "",
    })
    setIsAddReviewModalOpen(true)
  }

  const handlePostReview = async () => {
    if (!userId || !selectedBookingId) return
    const payload = {
      userId,
      bookingId: selectedBookingId,
      stars: Number(newReview.stars),
      rating: newReview.rating,
      comment: newReview.comment,
      cleanliness: Number(newReview.cleanliness),
      accuracy: Number(newReview.accuracy),
      communication: Number(newReview.communication),
      location: Number(newReview.location),
      checkin: Number(newReview.checkin),
      value: Number(newReview.value),
      hostRating: Number(newReview.host),
    }
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Failed to post review")
      }
      const data = await response.json()
      const created = data.review
      setWrittenReviews((prev) => [
        {
          id: created.id,
          propertyId: created.property?.id ?? "",
          propertyName: created.property?.propertyName ?? addReviewProperty,
          hostId: created.property?.userId ?? "",
          reviewerName: created.user?.username || created.user?.firstName || "Guest",
          reviewDate: created.reviewDate,
          stars: created.stars,
          rating: created.rating,
          comment: created.comment,
          cleanliness: created.cleanliness,
          accuracy: created.accuracy,
          communication: created.communication,
          location: created.location,
          checkin: created.checkin,
          value: created.value,
          hostRating: created.hostRating,
          checkIn: created.booking?.checkIn,
          checkOut: created.booking?.checkOut,
        },
        ...prev,
      ])
      setPendingReviews((prev) => prev.filter((booking) => booking.id !== selectedBookingId))
      setIsAddReviewModalOpen(false)
    } catch (error) {
      setReviewsError("Unable to post review.")
    }
  }

  if (!isReady) return null

  const formatDate = (value?: string) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-rose-500">airbnb</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Message and Notification icons - visible on all screen sizes */}

            <MessageBell role="client" className="rounded-full" href="/messages" />

            <NotificationBell role="client" className="rounded-full" href="/notifications" />

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
                  {/* Sidebar navigation items */}
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
                      onClick={() => setActiveSection("bookings")}
                    >
                      My bookings
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("reviews")}
                    >
                      Reviews
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("payments")}
                    >
                      Payments and invoices
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("support")}
                    >
                      Help and support
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
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/profile")}
                    >
                      Profile settings
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="w-full justify-start rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600"
                      onClick={() => router.push("/host/verify")}
                    >
                      Become a Host
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

      <div className="mx-auto w-full px-4 py-6 sm:px-6">
        <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
          <aside className="hidden w-full border-b border-border bg-background p-4 lg:block lg:w-[240px] lg:border-b-0 lg:border-r">
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
                onClick={() => setActiveSection("bookings")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "bookings" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                My bookings
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
                Reviews
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("payments")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "payments" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Payments and invoices
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("support")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "support" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Help and support
              </button>
            </nav>
          </aside>

          <section className="flex flex-1 flex-col gap-6 bg-background p-6">
            {activeSection === "dashboard" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
                <p className="mt-4 text-muted-foreground">Welcome to your dashboard, {firstName}!</p>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Current Balance</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">$0.00</p>
                    <p className="mt-1 text-sm text-muted-foreground">Available to spend on upcoming trips.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Bookings</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">0</p>
                    <p className="mt-1 text-sm text-muted-foreground">All-time stays and experiences.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Upcoming Bookings</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">0</p>
                    <p className="mt-1 text-sm text-muted-foreground">Trips scheduled in the next 90 days.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4 md:col-span-2">
                    <h3 className="font-semibold text-foreground">Recommended Places</h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-md border border-border bg-background p-3">
                        <p className="text-sm font-semibold text-foreground">Diani Beach</p>
                        <p className="text-xs text-muted-foreground">Relaxing seaside escapes</p>
                      </div>
                      <div className="rounded-md border border-border bg-background p-3">
                        <p className="text-sm font-semibold text-foreground">Nairobi</p>
                        <p className="text-xs text-muted-foreground">City breaks and culture</p>
                      </div>
                      <div className="rounded-md border border-border bg-background p-3">
                        <p className="text-sm font-semibold text-foreground">Naivasha</p>
                        <p className="text-xs text-muted-foreground">Lakeside stays</p>
                      </div>
                      <div className="rounded-md border border-border bg-background p-3">
                        <p className="text-sm font-semibold text-foreground">Nanyuki</p>
                        <p className="text-xs text-muted-foreground">Mountain views</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Pending Actions</h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <div className="rounded-md border border-border bg-background p-3">
                        <p className="font-medium text-foreground">Write reviews</p>
                        <p className="text-xs text-muted-foreground">You have 0 stays awaiting feedback.</p>
                      </div>
                      <div className="rounded-md border border-border bg-background p-3">
                        <p className="font-medium text-foreground">Complete profile</p>
                        <p className="text-xs text-muted-foreground">Add a photo and emergency contact.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "bookings" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">My Bookings</h2>
                <p className="mt-4 text-muted-foreground">Track your stays across every status.</p>
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Pending Bookings</h3>
                    <p className="mt-2 text-2xl font-bold text-rose-500">0</p>
                    <p className="mt-1 text-sm text-muted-foreground">Awaiting confirmation.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Past Bookings</h3>
                    <p className="mt-2 text-2xl font-bold text-rose-500">0</p>
                    <p className="mt-1 text-sm text-muted-foreground">Completed stays.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Cancelled Bookings</h3>
                    <p className="mt-2 text-2xl font-bold text-rose-500">0</p>
                    <p className="mt-1 text-sm text-muted-foreground">Cancelled by you or host.</p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={bookingTab === "pending" ? "default" : "outline"}
                      className={bookingTab === "pending" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                      onClick={() => setBookingTab("pending")}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={bookingTab === "past" ? "default" : "outline"}
                      className={bookingTab === "past" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                      onClick={() => setBookingTab("past")}
                    >
                      Past
                    </Button>
                    <Button
                      variant={bookingTab === "cancelled" ? "default" : "outline"}
                      className={bookingTab === "cancelled" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                      onClick={() => setBookingTab("cancelled")}
                    >
                      Cancelled
                    </Button>
                  </div>

                  <div className="mt-4 rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 font-medium">Property</th>
                            <th className="px-4 py-3 font-medium">Booking Date</th>
                            <th className="px-4 py-3 font-medium">Cost</th>
                            <th className="px-4 py-3 font-medium">From</th>
                            <th className="px-4 py-3 font-medium">To</th>
                            <th className="px-4 py-3 font-medium">Rating</th>
                            <th className="px-4 py-3 font-medium">Time Remaining</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingTab === "pending" && (
                            <tr className="border-b border-border">
                              <td className="px-4 py-3 font-medium text-foreground">Diani House</td>
                              <td className="px-4 py-3 text-muted-foreground">Mar 10, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">$320</td>
                              <td className="px-4 py-3 text-muted-foreground">Mar 20, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">Mar 23, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">-</td>
                              <td className="px-4 py-3 text-rose-500">4 days</td>
                            </tr>
                          )}

                          {bookingTab === "past" && (
                            <tr className="border-b border-border">
                              <td className="px-4 py-3 font-medium text-foreground">Naivasha Retreat</td>
                              <td className="px-4 py-3 text-muted-foreground">Jan 5, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">$540</td>
                              <td className="px-4 py-3 text-muted-foreground">Jan 12, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">Jan 15, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">4.8</td>
                              <td className="px-4 py-3 text-muted-foreground">Completed</td>
                            </tr>
                          )}

                          {bookingTab === "cancelled" && (
                            <tr className="border-b border-border">
                              <td className="px-4 py-3 font-medium text-foreground">Nairobi Loft</td>
                              <td className="px-4 py-3 text-muted-foreground">Feb 2, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">$210</td>
                              <td className="px-4 py-3 text-muted-foreground">Feb 20, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">Feb 22, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">-</td>
                              <td className="px-4 py-3 text-muted-foreground">Cancelled</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "reviews" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Reviews</h2>
                <p className="mt-4 text-muted-foreground">Manage pending and completed reviews.</p>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Reviews</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">
                      {writtenReviews.length + pendingReviews.length}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">Across all your stays.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Written Reviews</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">{writtenReviews.length}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Completed feedback.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Pending Reviews</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">{pendingReviews.length}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Needs your input.</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={reviewTab === "written" ? "default" : "outline"}
                      className={reviewTab === "written" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                      onClick={() => setReviewTab("written")}
                    >
                      Written Reviews
                    </Button>
                    <Button
                      variant={reviewTab === "pending" ? "default" : "outline"}
                      className={reviewTab === "pending" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                      onClick={() => setReviewTab("pending")}
                    >
                      Pending Reviews
                    </Button>
                  </div>

                  <div className="mt-4 rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                          {reviewTab === "written" ? (
                            <tr>
                              <th className="px-4 py-3 font-medium">Property</th>
                              <th className="px-4 py-3 font-medium">Username</th>
                              <th className="px-4 py-3 font-medium">Review Date</th>
                              <th className="px-4 py-3 font-medium">Stars</th>
                              <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                          ) : (
                            <tr>
                              <th className="px-4 py-3 font-medium">Property</th>
                              <th className="px-4 py-3 font-medium text-right">Action</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {reviewTab === "written" &&
                            writtenReviews.map((review) => (
                              <tr key={review.id} className="border-b border-border">
                                <td className="px-4 py-3">
                                  <button
                                    className="font-medium text-rose-500 hover:text-rose-600"
                                    onClick={() =>
                                      openReviewModal({
                                        property: review.propertyName,
                                        propertyId: review.propertyId,
                                        hostId: review.hostId,
                                        reviewerName: review.reviewerName,
                                        date: formatDate(review.reviewDate),
                                        stars: String(review.stars),
                                        rating: review.rating,
                                        comment: review.comment,
                                        checkIn: formatDate(review.checkIn),
                                        checkOut: formatDate(review.checkOut),
                                        ratings: {
                                          cleanliness: review.cleanliness,
                                          accuracy: review.accuracy,
                                          communication: review.communication,
                                          location: review.location,
                                          checkin: review.checkin,
                                          value: review.value,
                                          hostRating: review.hostRating,
                                        },
                                      })
                                    }
                                  >
                                    {review.propertyName}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">@{review.reviewerName}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                  {formatDate(review.reviewDate)}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{review.stars}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        openReviewModal({
                                          property: review.propertyName,
                                          propertyId: review.propertyId,
                                          hostId: review.hostId,
                                          reviewerName: review.reviewerName,
                                          date: formatDate(review.reviewDate),
                                          stars: String(review.stars),
                                          rating: review.rating,
                                          comment: review.comment,
                                          checkIn: formatDate(review.checkIn),
                                          checkOut: formatDate(review.checkOut),
                                          ratings: {
                                            cleanliness: review.cleanliness,
                                            accuracy: review.accuracy,
                                            communication: review.communication,
                                            location: review.location,
                                            checkin: review.checkin,
                                            value: review.value,
                                            hostRating: review.hostRating,
                                          },
                                        })
                                      }
                                    >
                                      View Review
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                                      Delete Review
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                          {reviewTab === "pending" &&
                            pendingReviews.map((booking) => (
                              <tr key={booking.id} className="border-b border-border">
                                <td className="px-4 py-3 font-medium text-foreground">{booking.propertyName}</td>
                                <td className="px-4 py-3 text-right">
                                  <Button
                                    size="sm"
                                    className="bg-rose-500 text-white hover:bg-rose-600"
                                    onClick={() => openAddReviewModal(booking)}
                                  >
                                    Add Review
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {isReviewsLoading && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">Loading reviews...</p>
                    )}
                    {!isReviewsLoading && reviewsError && (
                      <p className="px-4 py-3 text-sm text-red-500">{reviewsError}</p>
                    )}
                    {!isReviewsLoading &&
                      !reviewsError &&
                      reviewTab === "written" &&
                      writtenReviews.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">No written reviews yet.</p>
                      )}
                    {!isReviewsLoading &&
                      !reviewsError &&
                      reviewTab === "pending" &&
                      pendingReviews.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">No pending reviews right now.</p>
                      )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "payments" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Payments and Invoices</h2>
                <p className="mt-4 text-muted-foreground">Track your account balances and transactions.</p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Current Balance</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">$0.00</p>
                    <p className="mt-1 text-sm text-muted-foreground">Available to withdraw.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Deposited</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">$0.00</p>
                    <p className="mt-1 text-sm text-muted-foreground">All time deposits.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Withdrawn</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">$0.00</p>
                    <p className="mt-1 text-sm text-muted-foreground">All time withdrawals.</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    className="bg-rose-500 text-white hover:bg-rose-600"
                    onClick={() => {
                      setDepositStep("details")
                      setIsDepositModalOpen(true)
                    }}
                  >
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setWithdrawStep("details")
                      setIsWithdrawModalOpen(true)
                    }}
                  >
                    Withdraw
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    variant={transactionTab === "all" ? "default" : "outline"}
                    className={transactionTab === "all" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                    onClick={() => setTransactionTab("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={transactionTab === "payments" ? "default" : "outline"}
                    className={transactionTab === "payments" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                    onClick={() => setTransactionTab("payments")}
                  >
                    Payments
                  </Button>
                  <Button
                    variant={transactionTab === "deposits" ? "default" : "outline"}
                    className={transactionTab === "deposits" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                    onClick={() => setTransactionTab("deposits")}
                  >
                    Deposits
                  </Button>
                  <Button
                    variant={transactionTab === "withdrawals" ? "default" : "outline"}
                    className={transactionTab === "withdrawals" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                    onClick={() => setTransactionTab("withdrawals")}
                  >
                    Withdrawals
                  </Button>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Amount</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-4 py-3 text-muted-foreground">Deposit</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">Mar 12, 2026</td>
                          <td className="px-4 py-3 text-muted-foreground">$100.00</td>
                          <td className="px-4 py-3 text-muted-foreground">Completed</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "support" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Help and Support</h2>
                <p className="mt-4 text-muted-foreground">Visit our help center for more information.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {isReviewModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{selectedReview.property}</h3>
                <p className="text-sm text-muted-foreground">Review Date: {selectedReview.date}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)}>
                Close
              </Button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Property ID:</span> {selectedReview.propertyId}
              </p>
              <p>
                <span className="font-medium text-foreground">Guest Username:</span> @{selectedReview.reviewerName}
              </p>
              <p>
                <span className="font-medium text-foreground">Host ID:</span> {selectedReview.hostId}
              </p>
              <p>
                <span className="font-medium text-foreground">Check-in:</span> {selectedReview.checkIn}
              </p>
              <p>
                <span className="font-medium text-foreground">Check-out:</span> {selectedReview.checkOut}
              </p>
              <p>
                <span className="font-medium text-foreground">Stars:</span> {selectedReview.stars}
              </p>
              <p>
                <span className="font-medium text-foreground">Rating:</span> {selectedReview.rating}
              </p>
              <p className="leading-relaxed">
                <span className="font-medium text-foreground">Comment:</span> {selectedReview.comment}
              </p>
              <div className="pt-2">
                <p className="font-medium text-foreground">Ratings Breakdown</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <p>Cleanliness: {selectedReview.ratings.cleanliness}</p>
                  <p>Accuracy: {selectedReview.ratings.accuracy}</p>
                  <p>Communication: {selectedReview.ratings.communication}</p>
                  <p>Location: {selectedReview.ratings.location}</p>
                  <p>Check-in: {selectedReview.ratings.checkin}</p>
                  <p>Value: {selectedReview.ratings.value}</p>
                  <p>Host: {selectedReview.ratings.hostRating}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Add Review</h3>
                <p className="text-sm text-muted-foreground">Property: {addReviewProperty}</p>
                {selectedBookingDates && (
                  <p className="text-sm text-muted-foreground">
                    Stay: {formatDate(selectedBookingDates.checkIn)} to {formatDate(selectedBookingDates.checkOut)}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddReviewModalOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Stars</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.stars}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, stars: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Rating must be between 1 and 5.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Overall Rating</label>
                <Select
                  value={newReview.rating}
                  onValueChange={(value) => setNewReview((prev) => ({ ...prev, rating: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Cleanliness</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.cleanliness}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, cleanliness: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Rating must be between 1 and 5.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Accuracy</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.accuracy}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, accuracy: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Rating must be between 1 and 5.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Communication</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.communication}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, communication: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Rating must be between 1 and 5.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.location}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, location: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Rating must be between 1 and 5.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Check-in</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.checkin}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, checkin: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Rating must be between 1 and 5.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Value</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.value}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, value: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Rating must be between 1 and 5.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Host Rating</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.host}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, host: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Rating must be between 1 and 5.</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-foreground">Comment</label>
              <Textarea
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-rose-500 text-white hover:bg-rose-600" onClick={handlePostReview}>
                Post Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Deposit Funds</h3>
                <p className="text-sm text-muted-foreground">Deposit into your Airbnb balance.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsDepositModalOpen(false)}>
                Close
              </Button>
            </div>
            <div className="mt-6 space-y-6">
              {depositStep === "details" && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Payment Method</p>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="depositMethod"
                          checked={depositMethod === "mpesa"}
                          onChange={() => setDepositMethod("mpesa")}
                        />
                        M-PESA
                      </label>
                      <label className="flex items-center gap-2 opacity-50">
                        <input
                          type="radio"
                          name="depositMethod"
                          disabled
                          checked={depositMethod === "card"}
                          onChange={() => setDepositMethod("card")}
                        />
                        Card Payment (Visa/Mastercard)
                      </label>
                      <label className="flex items-center gap-2 opacity-50">
                        <input
                          type="radio"
                          name="depositMethod"
                          disabled
                          checked={depositMethod === "bank"}
                          onChange={() => setDepositMethod("bank")}
                        />
                        Bank Transfer
                      </label>
                      <label className="flex items-center gap-2 opacity-50">
                        <input
                          type="radio"
                          name="depositMethod"
                          disabled
                          checked={depositMethod === "paypal"}
                          onChange={() => setDepositMethod("paypal")}
                        />
                        PayPal
                      </label>
                    </div>
                  </div>

                  {depositMethod === "mpesa" && (
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                      <p className="text-sm font-semibold text-foreground">Mpesa Details</p>
                      <div className="mt-3 space-y-3">
                        <label className="text-sm text-muted-foreground">Phone Number</label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">+254</span>
                          <Input
                            type="text"
                            value={depositPhone}
                            onChange={(e) => setDepositPhone(e.target.value)}
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={saveDepositPhone}
                            onChange={(event) => setSaveDepositPhone(event.target.checked)}
                          />
                          Save this number for future deposits
                        </label>
                      </div>
                    </div>
                  )}

                  {depositMethod === "card" && (
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                      <p className="text-sm font-semibold text-foreground">Card Details</p>
                      <div className="mt-3 space-y-3">
                        <label className="text-sm text-muted-foreground">Card Type</label>
                        <div className="flex gap-2">
                          <Button
                            variant={cardType === "visa" ? "default" : "outline"}
                            className={cardType === "visa" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                            onClick={() => setCardType("visa")}
                          >
                            Visa
                          </Button>
                          <Button
                            variant={cardType === "mastercard" ? "default" : "outline"}
                            className={cardType === "mastercard" ? "bg-rose-500 text-white hover:bg-rose-600" : ""}
                            onClick={() => setCardType("mastercard")}
                          >
                            Mastercard
                          </Button>
                        </div>
                        <Input
                          placeholder="Card number"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails((prev) => ({ ...prev, number: e.target.value }))}
                        />
                        <Input
                          placeholder="Name on card"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails((prev) => ({ ...prev, name: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails((prev) => ({ ...prev, expiry: e.target.value }))}
                          />
                          <Input
                            placeholder="CVV"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails((prev) => ({ ...prev, cvv: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {depositMethod === "bank" && (
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                      <p className="text-sm font-semibold text-foreground">Bank Transfer</p>
                      <Input
                        placeholder="Account number"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="mt-3"
                      />
                    </div>
                  )}

                  {depositMethod === "paypal" && (
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                      <p className="text-sm font-semibold text-foreground">PayPal</p>
                      <Input
                        placeholder="PayPal email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="mt-3"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-foreground">Quick Select</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["1000", "2500", "5000", "10000"].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          onClick={() => setDepositAmount(amount)}
                        >
                          KSh {Number(amount).toLocaleString()}
                        </Button>
                      ))}
                      <Button variant="outline" onClick={() => setDepositAmount("")}>
                        Other
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground">Enter Amount</label>
                    <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                      <span className="text-sm text-muted-foreground">KSh</span>
                      <Input
                        type="number"
                        min={1}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="border-0 p-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-rose-500 text-white hover:bg-rose-600"
                      onClick={() => setDepositStep("confirm")}
                    >
                      Deposit
                    </Button>
                  </div>
                </>
              )}

              {depositStep === "confirm" && (
                <>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-foreground">Confirm Details</p>
                    <table className="mt-3 w-full text-sm text-muted-foreground">
                      <tbody>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Deposit Amount</td>
                          <td className="py-1 text-right">
                            KSh {depositAmount ? Number(depositAmount).toLocaleString() : "0"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Payment Method</td>
                          <td className="py-1 text-right">{depositMethod.toUpperCase()}</td>
                        </tr>
                        {depositMethod === "mpesa" && (
                          <tr>
                            <td className="py-1 font-medium text-foreground">Phone</td>
                            <td className="py-1 text-right">+254 {depositPhone}</td>
                          </tr>
                        )}
                        {depositMethod === "card" && (
                          <tr>
                            <td className="py-1 font-medium text-foreground">Card</td>
                            <td className="py-1 text-right">
                              {cardType.toUpperCase()} ���� {cardDetails.number.slice(-4) || "0000"}
                            </td>
                          </tr>
                        )}
                        {depositMethod === "bank" && (
                          <tr>
                            <td className="py-1 font-medium text-foreground">Account</td>
                            <td className="py-1 text-right">{bankAccount || "-"}</td>
                          </tr>
                        )}
                        {depositMethod === "paypal" && (
                          <tr>
                            <td className="py-1 font-medium text-foreground">PayPal</td>
                            <td className="py-1 text-right">{paypalEmail || "-"}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-1 font-medium text-foreground">Fee</td>
                          <td className="py-1 text-right">KSh 0 (Free)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDepositStep("details")}>
                      Back
                    </Button>
                    <Button className="bg-rose-500 text-white hover:bg-rose-600" onClick={() => setDepositStep("send")}>
                      Confirm and Deposit
                    </Button>
                  </div>
                </>
              )}

              {depositStep === "send" && (
                <>
                  <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                    <p>Send STK push or transfer to complete payment.</p>
                    {depositMethod === "mpesa" && <p>Phone: +254 {depositPhone}</p>}
                    <p>Amount: KSh {depositAmount ? Number(depositAmount).toLocaleString() : "0"}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDepositStep("confirm")}>
                      Back
                    </Button>
                    <Button className="bg-rose-500 text-white hover:bg-rose-600" onClick={() => setDepositStep("success")}>
                      Send STK and Deposit
                    </Button>
                  </div>
                </>
              )}

              {depositStep === "success" && (
                <>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Deposit Successful</p>
                    <table className="mt-3 w-full text-sm text-muted-foreground">
                      <tbody>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Amount</td>
                          <td className="py-1 text-right">
                            KSh {depositAmount ? Number(depositAmount).toLocaleString() : "0"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Transaction ID</td>
                          <td className="py-1 text-right">MPS123456789</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Date</td>
                          <td className="py-1 text-right">Mar 30, 2025 14:23</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">New Balance</td>
                          <td className="py-1 text-right">KSh 18,500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    <p>Receipt sent to: john@email.com</p>
                    <p>SMS sent to: +254 {depositPhone}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="outline">View Transaction</Button>
                    <Button className="bg-rose-500 text-white hover:bg-rose-600" onClick={() => setIsDepositModalOpen(false)}>
                      Back to Wallet
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Withdraw to Mpesa</h3>
                <p className="text-sm text-muted-foreground">Send funds to your personal account.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsWithdrawModalOpen(false)}>
                Close
              </Button>
            </div>
            <div className="mt-6 space-y-6">
              {withdrawStep === "details" && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Withdraw Method</p>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="withdrawMethod"
                          checked={withdrawMethod === "mpesa"}
                          onChange={() => setWithdrawMethod("mpesa")}
                        />
                        M-PESA
                      </label>
                      <label className="flex items-center gap-2 opacity-50">
                        <input
                          type="radio"
                          name="withdrawMethod"
                          disabled
                          checked={withdrawMethod === "bank"}
                          onChange={() => setWithdrawMethod("bank")}
                        />
                        Bank Account
                      </label>
                      <label className="flex items-center gap-2 opacity-50">
                        <input
                          type="radio"
                          name="withdrawMethod"
                          disabled
                          checked={withdrawMethod === "paypal"}
                          onChange={() => setWithdrawMethod("paypal")}
                        />
                        PayPal
                      </label>
                    </div>
                  </div>

                  {withdrawMethod === "mpesa" && (
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                      <p className="text-sm font-semibold text-foreground">Mpesa Details</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <Input
                          type="text"
                          value={withdrawPhone}
                          onChange={(e) => setWithdrawPhone(e.target.value)}
                        />
                        <Button variant="outline" size="sm">
                          Change
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-foreground">Quick Withdraw</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["1000", "2500", "5000", "10000"].map((amount) => (
                        <Button key={amount} variant="outline" onClick={() => setWithdrawAmount(amount)}>
                          KSh {Number(amount).toLocaleString()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground">Withdrawal Amount</label>
                    <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                      <span className="text-sm text-muted-foreground">KSh</span>
                      <Input
                        type="number"
                        min={1}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="border-0 p-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    <p>Current Balance: KSh 18,500</p>
                    <p>Minimum Withdrawal: KSh 100</p>
                    <p>Maximum Withdrawal: KSh 140,000</p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      className="bg-rose-500 text-white hover:bg-rose-600"
                      onClick={() => setWithdrawStep("confirm")}
                    >
                      Withdraw
                    </Button>
                  </div>
                </>
              )}

              {withdrawStep === "confirm" && (
                <>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-foreground">Confirm Details</p>
                    <table className="mt-3 w-full text-sm text-muted-foreground">
                      <tbody>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Amount</td>
                          <td className="py-1 text-right">
                            KSh {withdrawAmount ? Number(withdrawAmount).toLocaleString() : "0"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Fee</td>
                          <td className="py-1 text-right">KSh 35</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">You get</td>
                          <td className="py-1 text-right">
                            KSh {withdrawAmount ? Number(withdrawAmount) - 35 : 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">To</td>
                          <td className="py-1 text-right">+254 {withdrawPhone}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setWithdrawStep("details")}>
                      Back
                    </Button>
                    <Button
                      className="bg-rose-500 text-white hover:bg-rose-600"
                      onClick={() => setWithdrawStep("success")}
                    >
                      Withdraw
                    </Button>
                  </div>
                </>
              )}

              {withdrawStep === "success" && (
                <>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Withdrawal Successful</p>
                    <table className="mt-3 w-full text-sm text-muted-foreground">
                      <tbody>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Amount Sent</td>
                          <td className="py-1 text-right">
                            KSh {withdrawAmount ? Number(withdrawAmount) - 35 : 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">To</td>
                          <td className="py-1 text-right">+254 {withdrawPhone}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Transaction ID</td>
                          <td className="py-1 text-right">WTH123456789</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">Date</td>
                          <td className="py-1 text-right">Mar 30, 2025 15:47</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium text-foreground">New Balance</td>
                          <td className="py-1 text-right">KSh 13,500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    <p>Mpesa confirmation sent to your phone.</p>
                    <p>Check your messages for transaction details.</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="outline">View Receipt</Button>
                    <Button className="bg-rose-500 text-white hover:bg-rose-600" onClick={() => setIsWithdrawModalOpen(false)}>
                      Back to Wallet
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
