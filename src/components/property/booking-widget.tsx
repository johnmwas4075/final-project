"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface BookingWidgetProps {
  propertyId: string
  propertyName: string
  minNights: number
  pricePerNight: number
  rating: number
  reviewCount: number
}

export function BookingWidget({
  propertyId,
  propertyName,
  minNights,
  pricePerNight,
  rating,
  reviewCount,
}: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>()
  const [checkOut, setCheckOut] = useState<Date | undefined>()
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const userId =
    typeof window !== "undefined" ? window.localStorage.getItem("authUserId") : null

  const nights = useMemo(() => {
    if (checkIn && checkOut) {
      return differenceInDays(checkOut, checkIn)
    }
    return 0
  }, [checkIn, checkOut])

  const subtotal = nights * pricePerNight
  const serviceFee = Math.round(subtotal * 0.12)
  const total = subtotal + serviceFee
  const hasValidDates = Boolean(checkIn && checkOut && nights >= (minNights || 1))

  const loadWalletBalance = async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/users/profile?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) return
      const data = await response.json()
      const balance = Number(data?.user?.walletBalance ?? 0)
      if (!Number.isNaN(balance)) {
        setWalletBalance(balance)
      }
    } catch {}
  }

  useEffect(() => {
    if (!userId) return
    void loadWalletBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleAction = async (action: "reserve" | "book") => {
    setStatusMessage("")
    setErrorMessage("")
    if (!userId) {
      setErrorMessage("Please log in to continue.")
      return
    }
    if (!hasValidDates) {
      setErrorMessage(`Select dates for at least ${minNights} nights.`)
      return
    }
    if (!checkIn || !checkOut) return
    if (action === "book" && walletBalance !== null && walletBalance < total) {
      setErrorMessage("Insufficient wallet balance for this booking.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          propertyId,
          propertyName,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          action,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setErrorMessage(String(data?.error || "Unable to process request."))
        return
      }
      if (typeof data?.walletBalance === "number") {
        setWalletBalance(data.walletBalance)
      }
      if (action === "reserve") {
        const expiryText = data?.expiresAt ? new Date(data.expiresAt).toDateString() : "in 3 days"
        setStatusMessage(`Reservation created. It expires on ${expiryText}.`)
      } else {
        setStatusMessage("Booking confirmed. Enjoy your stay.")
      }
    } catch {
      setErrorMessage("Unable to process request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="sticky top-24 rounded-xl border border-border bg-background p-6 shadow-lg">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xl font-semibold">Ksh{pricePerNight}</span>
          <span className="text-muted-foreground"> /night</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium">{rating.toFixed(2)}</span>
          <span className="text-muted-foreground">({reviewCount} reviews)</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal h-14 flex-col items-start">
              <span className="text-[10px] uppercase font-semibold">Check-in</span>
              <span className="text-sm">
                {checkIn ? format(checkIn, "MMM d, yyyy") : "Add date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={setCheckIn}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal h-14 flex-col items-start">
              <span className="text-[10px] uppercase font-semibold">Checkout</span>
              <span className="text-sm">
                {checkOut ? format(checkOut, "MMM d, yyyy") : "Add date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => date < (checkIn || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-4 space-y-2">
        <Button
          className="w-full bg-rose-500 hover:bg-rose-600"
          size="lg"
          disabled={isSubmitting || !hasValidDates}
          onClick={() => handleAction("reserve")}
        >
          Reserve
        </Button>
        <Button
          className="w-full"
          size="lg"
          variant="outline"
          disabled={isSubmitting || !hasValidDates}
          onClick={() => handleAction("book")}
        >
          Book now
        </Button>
      </div>

      {walletBalance !== null && (
        <p className="mt-3 text-xs text-muted-foreground">
          Wallet balance: Ksh {walletBalance.toLocaleString()}
        </p>
      )}

      {walletBalance === null && (
        <button
          type="button"
          onClick={loadWalletBalance}
          className="mt-2 text-xs text-rose-600 hover:underline"
        >
          Check wallet balance
        </button>
      )}

      {errorMessage && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {errorMessage}
        </p>
      )}

      {statusMessage && (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {statusMessage}
        </p>
      )}

      {nights > 0 && (
        <>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Wallet balance is required for booking. Reservations can be placed without funds.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="underline">
                Ksh {pricePerNight} x {nights} nights
              </span>
              <span>Ksh {subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Service fee</span>
              <span>Ksh {serviceFee}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border font-semibold">
              <span>Total</span>
              <span>Ksh {total}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

