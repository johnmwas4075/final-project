"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const AUTH_KEY = "authUserId"
const AUTH_EMAIL_KEY = "authUserEmail"

export function HostVerifyClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [needsEmail, setNeedsEmail] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const isAuthed = Boolean(window.localStorage.getItem(AUTH_KEY))
    if (!isAuthed) {
      router.replace("/login")
      return
    }
    const storedEmail = window.localStorage.getItem(AUTH_EMAIL_KEY)
    if (storedEmail) {
      setEmail(storedEmail)
      setNeedsEmail(false)
    }
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const payload = {
      email: email.trim().toLowerCase(),
      password,
    }

    if (!payload.password || (!payload.email && needsEmail)) {
      setError("Please enter your credentials.")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || "Verification failed.")
        setIsSubmitting(false)
        return
      }

      await response.json().catch(() => ({}))
      const userId = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_KEY) : null
      const next = searchParams.get("next")
      if (userId) {
        const statusResponse = await fetch("/api/users/host-terms-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        const statusData = await statusResponse.json().catch(() => ({}))
        if (statusResponse.ok && statusData?.hasAcceptedHostTerms) {
          if (next) {
            router.push(next)
          } else {
            router.push("/host")
          }
          return
        }
      }

      router.push("/host/confirm")
    } catch (err) {
      setError("Verification failed.")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">Confirm your details</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to continue to the host setup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-background p-6 shadow-sm">
          {needsEmail ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Go to host account"}
          </Button>
        </form>
      </div>
    </main>
  )
}
