"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function HostConfirmPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const userId = window.localStorage.getItem("authUserId")
    if (!userId) {
      router.replace("/login")
      return
    }
    setIsReady(true)
  }, [router])

  const handleNext = async () => {
    if (!agreed) return
    if (typeof window === "undefined") return
    const userId = window.localStorage.getItem("authUserId")
    if (!userId) {
      router.replace("/login")
      return
    }

    try {
      const response = await fetch("/api/users/accept-host-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || "Unable to accept terms.")
        return
      }
      router.push("/host")
    } catch (err) {
      setError("Unable to accept terms.")
    }
  }

  if (!isReady) return null

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Host Terms and Conditions</h1>
          <p className="text-sm text-muted-foreground">
            Please review and accept the terms before continuing.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              By becoming a host, you agree to provide accurate listing information, comply with local
              regulations, and maintain a safe, clean space for guests.
            </p>
            <p>
              You are responsible for managing bookings, responding to guests, and honoring confirmed
              reservations unless exceptional circumstances apply.
            </p>
            <p>
              Payouts, cancellations, and service fees are governed by the platform policies and may
              change over time.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            I agree to the terms and conditions
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex items-center justify-end">
            <Button onClick={handleNext} disabled={!agreed}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

