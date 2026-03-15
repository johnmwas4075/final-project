"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AddUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      middleName: String(formData.get("middleName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      phoneNumber: String(formData.get("phoneNumber") || "").trim(),
      password: String(formData.get("password") || ""),
    }

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phoneNumber || !payload.password) {
      setError("Please fill in all required fields.")
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
        setError(data.error || "Unable to save user.")
        setIsSubmitting(false)
        return
      }

      setSuccess("User saved to database.")
      event.currentTarget.reset()
      setIsSubmitting(false)
    } catch (err) {
      setError("Unable to save user.")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">Add User</h1>
          <p className="text-sm text-muted-foreground">Simple form to add a user to the database.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-background p-6 shadow-sm">
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

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save user"}
          </Button>
        </form>
      </div>
    </main>
  )
}
