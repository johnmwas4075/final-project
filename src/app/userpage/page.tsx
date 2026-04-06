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
const AUTH_EMAIL_KEY = "authUserEmail"
const AUTH_USERNAME_KEY = "authUserUsername"

const PLATFORM_MPESA_NUMBER = "0703399867"

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
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [isRecLoading, setIsRecLoading] = useState(false)
  const [bookingSearch, setBookingSearch] = useState("")
  const [bookingPage, setBookingPage] = useState(0)
  const [reviewSearch, setReviewSearch] = useState("")
  const [reviewPage, setReviewPage] = useState(0)
  const [paymentSearch, setPaymentSearch] = useState("")
  const [paymentPage, setPaymentPage] = useState(0)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationItem | null>(null)
  const [username, setUsername] = useState<string | null>(null)
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
  const [depositError, setDepositError] = useState("")
  const [depositSubmitting, setDepositSubmitting] = useState(false)
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
  const [saveWithdrawPhone, setSaveWithdrawPhone] = useState(false)
  const [withdrawStep, setWithdrawStep] = useState<"details" | "confirm" | "success">("details")
  const [walletReceiptEmail, setWalletReceiptEmail] = useState("john@email.com")
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
      router.replace("/")
      return
    }
    const storedPhone = window.localStorage.getItem(AUTH_PHONE_KEY)
    const storedEmail = window.localStorage.getItem(AUTH_EMAIL_KEY)
    const storedUsername = window.localStorage.getItem(AUTH_USERNAME_KEY)
    if (storedPhone) {
      const sanitized = storedPhone.replace(/^\+254/, "").replace(/\s+/g, "")
      setDepositPhone(sanitized)
      setWithdrawPhone(sanitized)
    }
    if (storedEmail) setWalletReceiptEmail(storedEmail)
    if (storedUsername) setUsername(storedUsername)
    setUserId(window.localStorage.getItem(AUTH_KEY))
    if (storedName) setFirstName(storedName)
    setIsReady(true)
  }, [router])

  useEffect(() => {
    if (!userId) return
    setIsRecLoading(true)
    fetch(`/api/recommendations?userId=${encodeURIComponent(userId)}&limit=4`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations)
        }
      })
      .catch(() => null)
      .finally(() => setIsRecLoading(false))
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const loadProfileDefaults = async () => {
      try {
        const response = await fetch(`/api/users/profile?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) return
        const data = await response.json()
        const savedPhone = String(data?.user?.defaultMpesaPhone || data?.user?.phoneNumber || "")
        const savedEmail = String(data?.user?.email || "")
        if (savedPhone) {
          const sanitized = savedPhone.replace(/^\+254/, "").replace(/\s+/g, "")
          setDepositPhone(sanitized)
          setWithdrawPhone(sanitized)
        }
        if (savedEmail) {
          setWalletReceiptEmail(savedEmail)
          window.localStorage.setItem(AUTH_EMAIL_KEY, savedEmail)
        }
      } catch {}
    }

    void loadProfileDefaults()
  }, [userId])

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
    router.push("/")
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

  const persistDefaultMpesaPhone = async (phone: string) => {
    if (!userId) return

    try {
      const response = await fetch(`/api/users/profile?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) return

      const data = await response.json()
      const user = data?.user
      if (!user) return

      await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          firstName: user.firstName,
          middleName: user.middleName || "",
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          defaultMpesaPhone: phone,
        }),
      })
    } catch {}
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

  const bookingRecords = [
    {
      id: "bk-1",
      propertyId: "property-1",
      propertyName: "Diani House",
      userName: "you",
      status: "pending",
      bookingDate: "Mar 10, 2026",
      cost: "Ksh 320",
      checkIn: "Mar 20, 2026",
      checkOut: "Mar 23, 2026",
      rating: "-",
      timeRemaining: "4 days",
    },
    {
      id: "bk-2",
      propertyId: "property-2",
      propertyName: "Naivasha Retreat",
      userName: "you",
      status: "past",
      bookingDate: "Jan 5, 2026",
      cost: "Ksh 540",
      checkIn: "Jan 12, 2026",
      checkOut: "Jan 15, 2026",
      rating: "4.8",
      timeRemaining: "Completed",
    },
    {
      id: "bk-3",
      propertyId: "property-3",
      propertyName: "Nairobi Loft",
      userName: "you",
      status: "cancelled",
      bookingDate: "Feb 2, 2026",
      cost: "Ksh 210",
      checkIn: "Feb 20, 2026",
      checkOut: "Feb 22, 2026",
      rating: "-",
      timeRemaining: "Cancelled",
    },
  ]

  const bookingFiltered = bookingRecords.filter((item) => {
    if (item.status !== bookingTab) return false
    const query = bookingSearch.trim().toLowerCase()
    if (!query) return true
    return [item.propertyName, item.userName].some((value) => value.toLowerCase().includes(query))
  })

  const bookingPageSize = 20
  const bookingStart = bookingPage * bookingPageSize
  const bookingEnd = Math.min(bookingStart + bookingPageSize, bookingFiltered.length)
  const bookingPageItems = bookingFiltered.slice(bookingStart, bookingEnd)
  const bookingRangeLabel = bookingFiltered.length == 0 ? "0-0 of 0" : (bookingStart + 1) + "-" + bookingEnd + " of " + bookingFiltered.length

  const writtenReviewRecords = writtenReviews.map((review) => ({
    id: review.id,
    propertyId: review.propertyId,
    propertyName: review.propertyName,
    reviewerName: review.reviewerName,
    reviewDate: formatDate(review.reviewDate),
    stars: String(review.stars),
    rating: review.rating,
    comment: review.comment,
    hostId: review.hostId,
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
  }))

  const pendingReviewRecords = pendingReviews.map((booking) => ({
    id: booking.id,
    propertyId: booking.propertyId,
    propertyName: booking.propertyName,
    reviewerName: "-",
    reviewDate: "-",
    stars: "-",
    rating: "Pending",
    comment: "Review not yet submitted.",
    hostId: booking.hostId,
    checkIn: formatDate(booking.checkIn),
    checkOut: formatDate(booking.checkOut),
    ratings: {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      checkin: 0,
      value: 0,
      hostRating: 0,
    },
  }))

  const reviewRecords = reviewTab === "written" ? writtenReviewRecords : pendingReviewRecords
  const reviewFiltered = reviewRecords.filter((item) => {
    const query = reviewSearch.trim().toLowerCase()
    if (!query) return true
    return [item.propertyName, item.reviewerName].some((value) => value.toLowerCase().includes(query))
  })

  const reviewPageSize = 20
  const reviewStart = reviewPage * reviewPageSize
  const reviewEnd = Math.min(reviewStart + reviewPageSize, reviewFiltered.length)
  const reviewPageItems = reviewFiltered.slice(reviewStart, reviewEnd)
  const reviewRangeLabel = reviewFiltered.length == 0 ? "0-0 of 0" : (reviewStart + 1) + "-" + reviewEnd + " of " + reviewFiltered.length

  const paymentRecords = [
    {
      id: "pay-1",
      type: "Deposit",
      typeKey: "deposits",
      date: "Mar 12, 2026",
      amount: "Ksh 100.00",
      status: "Completed",
      to: "Wallet deposit",
      username: "",
      reference: "TXN-1001",
    },
    {
      id: "pay-2",
      type: "Payment",
      typeKey: "payments",
      date: "Mar 20, 2026",
      amount: "Ksh 320.00",
      status: "Processing",
      to: "@host123",
      username: "host123",
      reference: "PAY-8832",
    },
    {
      id: "pay-3",
      type: "Withdrawal",
      typeKey: "withdrawals",
      date: "Mar 25, 2026",
      amount: "Ksh 200.00",
      status: "Completed",
      to: "MPESA 0703***867",
      username: "",
      reference: "WTH-4401",
    },
  ]

  const paymentFiltered = paymentRecords.filter((item) => {
    if (transactionTab !== "all" && item.typeKey !== transactionTab) {
      return false
    }
    const query = paymentSearch.trim().toLowerCase()
    if (!query) return true
    return [item.to, item.username].some((value) => value.toLowerCase().includes(query))
  })

  const paymentPageSize = 20
  const paymentStart = paymentPage * paymentPageSize
  const paymentEnd = Math.min(paymentStart + paymentPageSize, paymentFiltered.length)
  const paymentPageItems = paymentFiltered.slice(paymentStart, paymentEnd)
  const paymentRangeLabel = paymentFiltered.length == 0 ? "0-0 of 0" : (paymentStart + 1) + "-" + paymentEnd + " of " + paymentFiltered.length

  return (
    <main className="h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-rose-500 font-brand">Dwellify</span>
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
                      onClick={() => router.push("/favorites")}
                    >
                      Favourites
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

      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:pl-0">
        <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden lg:flex-row">
          <aside className="hidden h-full w-full flex-shrink-0 border-b border-rose-400/60 bg-rose-500 p-4 text-white lg:block lg:w-[240px] lg:border-b-0 lg:border-r lg:sticky lg:top-16 lg:h-[calc(100vh-64px)]">
            <nav className="space-y-0 text-sm">
              <button 
                onClick={() => setActiveSection("dashboard")}
                className={`w-full rounded-md px-3 py-2 text-left font-medium transition-colors ${
                  activeSection === "dashboard" 
                    ? "bg-white text-rose-600" 
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
              >
                Dashboard
              </button>
              <div className="my-2 border-b border-white/30" />
              <button 
                onClick={() => setActiveSection("bookings")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "bookings" 
                    ? "bg-white text-rose-600" 
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
              >
                My bookings
              </button>
              <div className="my-2 border-b border-white/30" />
              <button 
                onClick={() => setActiveSection("reviews")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "reviews" 
                    ? "bg-white text-rose-600" 
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
              >
                Reviews
              </button>
              <div className="my-2 border-b border-white/30" />
              <button 
                onClick={() => setActiveSection("payments")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "payments" 
                    ? "bg-white text-rose-600" 
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
              >
                Payments and invoices
              </button>
              <div className="my-2 border-b border-white/30" />
              <button 
                onClick={() => router.push("/favorites")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "favorites" 
                    ? "bg-white text-rose-600" 
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
              >
                Favourites
              </button>
              <div className="my-2 border-b border-white/30" />
              <button 
                onClick={() => setActiveSection("support")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "support" 
                    ? "bg-white text-rose-600" 
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
              >
                Help and support
              </button>
            </nav>
          </aside>

          <section className="min-w-0 flex-1 overflow-y-auto bg-background p-6">
            {activeSection === "dashboard" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
                <p className="mt-4 text-muted-foreground">Welcome to your dashboard, {firstName}!</p>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Current Balance</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">Ksh 0.00</p>
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
                    {isRecLoading ? (
                      <p className="mt-3 text-sm text-muted-foreground">Loading recommendations...</p>
                    ) : recommendations.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">No recommendations yet.</p>
                    ) : (
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {recommendations.map((item) => (
                          <div
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedRecommendation(item)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                setSelectedRecommendation(item)
                              }
                            }}
                            className="flex min-h-[120px] gap-3 rounded-md border border-border bg-background p-4 hover:border-rose-400"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-24 w-28 rounded-md object-cover"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                              <p className="mt-1 text-xs font-medium text-rose-500">{item.rating.toFixed(1)} ★</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Input
                      value={bookingSearch}
                      onChange={(event) => { setBookingSearch(event.target.value); setBookingPage(0) }}
                      placeholder="Search properties or users"
                      className="w-full max-w-xs"
                    />
                    <Select value={bookingTab} onValueChange={(value) => { setBookingTab(value as "pending" | "past" | "cancelled"); setBookingPage(0) }}>
                      <SelectTrigger className="w-full max-w-[200px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="ml-auto text-xs text-muted-foreground">{"< "}{bookingRangeLabel}{" >"}</div>
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
                          {bookingPageItems.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-border cursor-pointer"
                              onClick={() => setSelectedBooking(item)}
                            >
                              <td className="px-4 py-3 font-medium text-foreground">{item.propertyName}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.bookingDate}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.cost}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.checkIn}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.checkOut}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.rating}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.timeRemaining}</td>
                            </tr>
                          ))}
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

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Input
                      value={bookingSearch}
                      onChange={(event) => { setBookingSearch(event.target.value); setBookingPage(0) }}
                      placeholder="Search properties or users"
                      className="w-full max-w-xs"
                    />
                    <Select value={reviewTab} onValueChange={(value) => { setReviewTab(value as "written" | "pending"); setReviewPage(0) }}>
                      <SelectTrigger className="w-full max-w-[200px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="ml-auto text-xs text-muted-foreground">{"< "}{bookingRangeLabel}{" >"}</div>
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
                            reviewPageItems.map((review) => (
                              <tr
                                key={review.id}
                                className="border-b border-border cursor-pointer"
                                onClick={() =>
                                  openReviewModal({
                                    property: review.propertyName,
                                    propertyId: review.propertyId,
                                    hostId: review.hostId,
                                    reviewerName: review.reviewerName,
                                    date: review.reviewDate,
                                    stars: review.stars,
                                    rating: review.rating,
                                    comment: review.comment,
                                    checkIn: review.checkIn,
                                    checkOut: review.checkOut,
                                    ratings: review.ratings,
                                  })
                                }
                              >
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
                            reviewPageItems.map((booking) => (
                              <tr
                                key={booking.id}
                                className="border-b border-border cursor-pointer"
                                onClick={() =>
                                  openReviewModal({
                                    property: booking.propertyName,
                                    propertyId: booking.propertyId,
                                    hostId: booking.hostId,
                                    reviewerName: booking.reviewerName,
                                    date: booking.reviewDate,
                                    stars: booking.stars,
                                    rating: booking.rating,
                                    comment: booking.comment,
                                    checkIn: booking.checkIn,
                                    checkOut: booking.checkOut,
                                    ratings: booking.ratings,
                                  })
                                }
                              >
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
                    <p className="mt-2 text-3xl font-bold text-rose-500">Ksh 0.00</p>
                    <p className="mt-1 text-sm text-muted-foreground">Available to withdraw.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Deposited</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">Ksh 0.00</p>
                    <p className="mt-1 text-sm text-muted-foreground">All time deposits.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Withdrawn</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">Ksh 0.00</p>
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

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Input
                    value={paymentSearch}
                    onChange={(event) => { setPaymentSearch(event.target.value); setPaymentPage(0) }}
                    placeholder="Search username"
                    className="w-full max-w-xs"
                  />
                  <Select value={transactionTab} onValueChange={(value) => { setTransactionTab(value as "all" | "payments" | "deposits" | "withdrawals"); setPaymentPage(0) }}>
                    <SelectTrigger className="w-full max-w-[200px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="payments">Payments</SelectItem>
                      <SelectItem value="deposits">Deposits</SelectItem>
                      <SelectItem value="withdrawals">Withdrawals</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="ml-auto text-xs text-muted-foreground">{"< "}{paymentRangeLabel}{" >"}</div>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Amount</th>
                          <th className="px-4 py-3 font-medium">To</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentPageItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-border cursor-pointer"
                            onClick={() => setSelectedPayment(item)}
                          >
                            <td className="px-4 py-3 text-muted-foreground">{item.type}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{item.date}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.amount}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.to}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.status}</td>
                          </tr>
                        ))}
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
          

            {selectedBooking && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">Booking ??????</h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Property:</span> {selectedBooking.propertyName}</p>
                      <p><span className="font-medium text-foreground">Status:</span> {selectedBooking.status}</p>
                      <p><span className="font-medium text-foreground">Booking Date:</span> {selectedBooking.bookingDate}</p>
                      <p><span className="font-medium text-foreground">Cost:</span> {selectedBooking.cost}</p>
                      <p><span className="font-medium text-foreground">Check-in:</span> {selectedBooking.checkIn}</p>
                      <p><span className="font-medium text-foreground">Check-out:</span> {selectedBooking.checkOut}</p>
                      <p><span className="font-medium text-foreground">Rating:</span> {selectedBooking.rating}</p>
                      <p><span className="font-medium text-foreground">Time Remaining:</span> {selectedBooking.timeRemaining}</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setSelectedBooking(null)}>
                        Close
                      </Button>
                      <Button
                        className="bg-rose-500 text-white hover:bg-rose-600"
                        onClick={() => router.push(`/property/${selectedBooking.propertyId}`)}
                      >
                        View property
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPayment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">Payment Details</h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Type:</span> {selectedPayment.type}</p>
                      <p><span className="font-medium text-foreground">Date:</span> {selectedPayment.date}</p>
                      <p><span className="font-medium text-foreground">Amount:</span> {selectedPayment.amount}</p>
                      <p><span className="font-medium text-foreground">To:</span> {selectedPayment.to}</p>
                      <p><span className="font-medium text-foreground">Status:</span> {selectedPayment.status}</p>
                      <p><span className="font-medium text-foreground">Reference:</span> {selectedPayment.reference}</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setSelectedPayment(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {selectedRecommendation && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl">
                  <div className="relative">
                    <img
                      src={selectedRecommendation.image}
                      alt={selectedRecommendation.name}
                      className="h-48 w-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedRecommendation(null)}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-2 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Recommended stay</h3>
                      <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600">
                        {selectedRecommendation.rating.toFixed(1)} ★
                      </span>
                    </div>
                    <p className="text-base font-semibold text-foreground">{selectedRecommendation.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedRecommendation.description}</p>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="ghost" onClick={() => setSelectedRecommendation(null)}>
                        Not now
                      </Button>
                      <Button
                        className="bg-rose-500 text-white hover:bg-rose-600"
                        onClick={() => router.push(`/property/${selectedRecommendation.id}`)}
                      >
                        View property
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}</section>
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
                <p className="text-sm text-muted-foreground">Deposit into your Dwellify balance.</p>
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
                        <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                          Send to: <span className="font-medium text-foreground">{PLATFORM_MPESA_NUMBER}</span>
                        </div>
                        <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                          Receiver name:{" "}
                          <span className="font-medium text-foreground">
                            dwellify-{(username || "guest").replace(/^@/, "")}
                          </span>
                        </div>
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
                            <td className="py-1 font-medium text-foreground">Send to</td>
                            <td className="py-1 text-right">{PLATFORM_MPESA_NUMBER}</td>
                          </tr>
                        )}
                        {depositMethod === "mpesa" && (
                          <tr>
                            <td className="py-1 font-medium text-foreground">Receiver</td>
                            <td className="py-1 text-right">dwellify-{(username || "guest").replace(/^@/, "")}</td>
                          </tr>
                        )}
                        {depositMethod === "mpesa" && (
                          <tr>
                            <td className="py-1 font-medium text-foreground">From</td>
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
                    <Button
                      className="bg-rose-500 text-white hover:bg-rose-600"
                      onClick={async () => {
                        if (depositMethod === "mpesa" && saveDepositPhone) {
                          await persistDefaultMpesaPhone(depositPhone)
                        }
                        setDepositStep("send")
                      }}
                    >
                      Confirm and Deposit
                    </Button>
                  </div>
                </>
              )}

              {depositStep === "send" && (
                <>
                  <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                    <p>Send STK push or transfer to complete payment.</p>
                    {depositMethod === "mpesa" && (
                      <>
                        <p>Send to: {PLATFORM_MPESA_NUMBER}</p>
                        <p>Receiver: dwellify-{(username || "guest").replace(/^@/, "")}</p>
                        <p>From: +254 {depositPhone}</p>
                      </>
                    )}
                    <p>Amount: KSh {depositAmount ? Number(depositAmount).toLocaleString() : "0"}</p>
                  </div>
                  {depositError ? (
                    <p className="text-sm text-destructive">{depositError}</p>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDepositStep("confirm")}>
                      Back
                    </Button>
                    <Button
                      className="bg-rose-500 text-white hover:bg-rose-600"
                      disabled={depositSubmitting}
                      onClick={async () => {
                        if (depositMethod !== "mpesa") {
                          setDepositStep("success")
                          return
                        }
                        if (!userId) return
                        setDepositSubmitting(true)
                        setDepositError("")
                        try {
                          const response = await fetch("/api/payments/mpesa/stk", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId,
                              phone: `254${depositPhone}`.replace(/\s+/g, ""),
                              amount: Number(depositAmount),
                              username: username || "",
                            }),
                          })
                          const data = await response.json().catch(() => ({}))
                          if (!response.ok) {
                            setDepositError(data?.error || "Unable to send STK push.")
                            return
                          }
                          setDepositStep("success")
                        } catch {
                          setDepositError("Unable to send STK push.")
                        } finally {
                          setDepositSubmitting(false)
                        }
                      }}
                    >
                      {depositSubmitting ? "Sending..." : "Send STK and Deposit"}
                    </Button>
                  </div>
                </>
              )}

              {depositStep === "success" && (
                <>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">STK push sent</p>
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
                          <td className="py-1 font-medium text-foreground">Status</td>
                          <td className="py-1 text-right">Pending confirmation</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    <p>Receiver name: dwellify-{(username || "guest").replace(/^@/, "")}</p>
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
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">+254</span>
                          <Input
                            type="text"
                            value={withdrawPhone}
                            onChange={(e) => setWithdrawPhone(e.target.value)}
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={saveWithdrawPhone}
                            onChange={(event) => setSaveWithdrawPhone(event.target.checked)}
                          />
                          Save this number for future withdrawals
                        </label>
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
                      onClick={async () => {
                        if (withdrawMethod === "mpesa" && saveWithdrawPhone) {
                          await persistDefaultMpesaPhone(withdrawPhone)
                        }
                        setWithdrawStep("success")
                      }}
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

