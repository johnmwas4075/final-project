"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") || "")
    const confirmPassword = String(formData.get("confirmPassword") || "")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setIsSubmitting(false)
      return
    }

    const payload = {
      username: String(formData.get("username") || "").trim(),
      firstName: String(formData.get("firstName") || "").trim(),
      middleName: String(formData.get("middleName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      phoneNumber: String(formData.get("phoneNumber") || "").trim(),
      password,
      confirmPassword,
      hasAcceptedTerms: acceptTerms,
      hasAcceptedHostTerms: false,
    }

    if (!payload.username || !payload.firstName || !payload.lastName || !payload.email || !payload.phoneNumber) {
      setError("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }
    if (!acceptTerms) {
      setError("Please accept the terms and conditions.")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || "Sign up failed.")
        setIsSubmitting(false)
        return
      }

      setSuccess("Account successfully created. Redirecting to login...")
      setTimeout(() => router.push("/login"), 800)
    } catch (err) {
      setError("Sign up failed.")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Sign up as a user first, then you can become a host.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="username">
              Username
            </label>
            <Input id="username" name="username" type="text" required placeholder="yourname" />
            <p className="text-xs text-muted-foreground">Usernames cannot be changed later.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="firstName">
              First name
            </label>
            <Input id="firstName" name="firstName" type="text" required placeholder="Amina" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="middleName">
              Middle name (optional)
            </label>
            <Input id="middleName" name="middleName" type="text" placeholder="" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="lastName">
              Last name
            </label>
            <Input id="lastName" name="lastName" type="text" required placeholder="Otieno" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="phoneNumber">
              Phone number
            </label>
            <Input id="phoneNumber" name="phoneNumber" type="tel" required placeholder="0700 000 000" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Input id="password" name="password" type="password" required placeholder="Create a password" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
              Confirm password
            </label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="Confirm your password" />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(event) => setAcceptTerms(event.target.checked)}
            />
            I accept the terms and conditions
          </label>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          {success ? (
            <p className="text-sm text-green-600">{success}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}

