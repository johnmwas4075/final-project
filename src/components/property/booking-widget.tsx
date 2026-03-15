"use client"

import { useState, useMemo } from "react"
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
  pricePerNight: number
  rating: number
  reviewCount: number
}

export function BookingWidget({ pricePerNight, rating, reviewCount }: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>()
  const [checkOut, setCheckOut] = useState<Date | undefined>()

  const nights = useMemo(() => {
    if (checkIn && checkOut) {
      return differenceInDays(checkOut, checkIn)
    }
    return 0
  }, [checkIn, checkOut])

  const subtotal = nights * pricePerNight
  const serviceFee = Math.round(subtotal * 0.12)
  const total = subtotal + serviceFee

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

      <Button className="mt-4 w-full bg-rose-500 hover:bg-rose-600" size="lg">
        Reserve
      </Button>

      {nights > 0 && (
        <>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            You won't be charged yet
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
