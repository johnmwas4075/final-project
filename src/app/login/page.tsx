"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const AUTH_KEY = "authUserId"
const AUTH_NAME_KEY = "authUserFirstName"
const AUTH_EMAIL_KEY = "authUserEmail"
const AUTH_PHONE_KEY = "authUserPhone"
const AUTH_USERNAME_KEY = "authUserUsername"

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || "Login failed.")
        setIsSubmitting(false)
        return
      }

      const data = await response.json().catch(() => ({}))
      if (typeof window !== "undefined") {
        if (data?.userId) window.localStorage.setItem(AUTH_KEY, String(data.userId))
        if (data?.firstName) window.localStorage.setItem(AUTH_NAME_KEY, String(data.firstName))
        if (payload.email) window.localStorage.setItem(AUTH_EMAIL_KEY, String(payload.email))
        if (data?.phoneNumber) window.localStorage.setItem(AUTH_PHONE_KEY, String(data.phoneNumber))
        if (data?.username) window.localStorage.setItem(AUTH_USERNAME_KEY, String(data.username))
      }

      router.push("/userpage")
    } catch (err) {
      setError("Login failed.")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to manage your stays and host profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Input id="password" name="password" type="password" required placeholder="********" />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}
