"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HostNavbar } from "@/components/host-navbar"

const AUTH_KEY = "authUserId"

type ReviewRow = {
  id: string
  reviewer: string
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
}

type PropertyReviews = {
  id: string
  name: string
  image: string
  county: string
  constituency: string
  ward: string
  reviews: ReviewRow[]
}

export default function HostPropertyReviewsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [userId, setUserId] = useState<string | null>(null)
  const [property, setProperty] = useState<PropertyReviews | null>(null)
  const [search, setSearch] = useState("")
  const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedUserId = window.localStorage.getItem(AUTH_KEY)
    if (!storedUserId) {
      router.replace("/login")
      return
    }
    setUserId(storedUserId)
  }, [router])

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const response = await fetch(`/api/host/reviews?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) return
      const data = await response.json()
      const match = (data.properties ?? []).find((item: any) => item.id === params.id)
      if (!match) return
      const mapped: PropertyReviews = {
        id: match.id,
        name: match.propertyName,
        image: match.photos?.[0] || "/images/property.jpg",
        county: match.countyName ?? "",
        constituency: match.constituencyName ?? "",
        ward: match.wardName ?? "",
        reviews: (match.reviews ?? []).map((review: any) => ({
          id: review.id,
          reviewer:
            review.user?.username ||
            [review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") ||
            "Guest",
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
        })),
      }
      setProperty(mapped)
    }
    load()
  }, [userId, params.id])

  const filteredReviews = useMemo(() => {
    if (!property) return []
    const query = search.toLowerCase()
    return property.reviews.filter(
      (review) => review.reviewer.toLowerCase().includes(query)
    )
  }, [property, search])

  const totals = useMemo(() => {
    if (!property) {
      return {
        totalReviews: 0,
        totalRatings: 0,
        totalComments: 0,
        avgRating: "0.00",
        breakdown: {
          cleanliness: 0,
          accuracy: 0,
          communication: 0,
          checkin: 0,
          location: 0,
          value: 0,
          hostRating: 0,
        },
      }
    }
    const totalReviews = property.reviews.length
    const sum = property.reviews.reduce((acc, review) => acc + review.stars, 0)
    const avgRating = totalReviews > 0 ? (sum / totalReviews).toFixed(2) : "0.00"
    const totalComments = property.reviews.filter((review) => review.comment && review.comment.trim().length > 0).length
    const breakdown = {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      checkin: 0,
      location: 0,
      value: 0,
      hostRating: 0,
    }
    if (totalReviews > 0) {
      for (const review of property.reviews) {
        breakdown.cleanliness += review.cleanliness
        breakdown.accuracy += review.accuracy
        breakdown.communication += review.communication
        breakdown.checkin += review.checkin
        breakdown.location += review.location
        breakdown.value += review.value
        breakdown.hostRating += review.hostRating
      }
      breakdown.cleanliness = Number((breakdown.cleanliness / totalReviews).toFixed(2))
      breakdown.accuracy = Number((breakdown.accuracy / totalReviews).toFixed(2))
      breakdown.communication = Number((breakdown.communication / totalReviews).toFixed(2))
      breakdown.checkin = Number((breakdown.checkin / totalReviews).toFixed(2))
      breakdown.location = Number((breakdown.location / totalReviews).toFixed(2))
      breakdown.value = Number((breakdown.value / totalReviews).toFixed(2))
      breakdown.hostRating = Number((breakdown.hostRating / totalReviews).toFixed(2))
    }
    return { totalReviews, totalRatings: sum, totalComments, avgRating, breakdown }
  }, [property])

  if (!property) {
    return (
      <main className="min-h-screen bg-background">
        <HostNavbar />
        <div className="mx-auto w-full max-w-5xl px-4 py-8">
          <Button variant="outline" onClick={() => router.push("/host")}>
            Back to Host
          </Button>
          <p className="mt-6 text-sm text-muted-foreground">Loading property reviews...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <HostNavbar />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{property.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {property.county}, {property.constituency}, {property.ward}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/host")}>
            Back to Host
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total reviews</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{totals.totalReviews}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total ratings</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{totals.totalRatings}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Average rating</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{totals.avgRating}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total comments</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{totals.totalComments}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">Rating breakdown</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p>Cleanliness: {totals.breakdown.cleanliness}</p>
            <p>Accuracy: {totals.breakdown.accuracy}</p>
            <p>Communication: {totals.breakdown.communication}</p>
            <p>Check-in: {totals.breakdown.checkin}</p>
            <p>Location: {totals.breakdown.location}</p>
            <p>Value: {totals.breakdown.value}</p>
            <p>Host rating: {totals.breakdown.hostRating}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search reviews..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full md:max-w-sm"
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Reviewer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Stars</th>
                <th className="px-4 py-3 font-medium">Cleanliness</th>
                <th className="px-4 py-3 font-medium">Accuracy</th>
                <th className="px-4 py-3 font-medium">Communication</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Host</th>
                <th className="px-4 py-3 font-medium">Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className="cursor-pointer border-b border-border hover:bg-muted/40"
                  onClick={() => setSelectedReview(review)}
                >
                  <td className="px-4 py-3 text-muted-foreground">{review.reviewer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.reviewDate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.stars}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.cleanliness}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.accuracy}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.communication}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.checkin}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.location}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.value}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.hostRating}</td>
                  <td className="px-4 py-3 text-muted-foreground">{review.comment}</td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Review Details</h3>
                <p className="text-sm text-muted-foreground">{selectedReview.reviewer}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedReview(null)}>
                Close
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <p>Stars: {selectedReview.stars}</p>
              <p>Cleanliness: {selectedReview.cleanliness}</p>
              <p>Accuracy: {selectedReview.accuracy}</p>
              <p>Communication: {selectedReview.communication}</p>
              <p>Check-in: {selectedReview.checkin}</p>
              <p>Location: {selectedReview.location}</p>
              <p>Value: {selectedReview.value}</p>
              <p>Host rating: {selectedReview.hostRating}</p>
              <p>Date: {selectedReview.reviewDate}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-foreground">Comment</p>
              <p className="mt-2 text-sm text-muted-foreground">{selectedReview.comment || "No comment provided."}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
