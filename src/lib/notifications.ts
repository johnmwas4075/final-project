export type NotificationRole = "host" | "client"

export type NotificationItem = {
  id: string
  role: NotificationRole
  title: string
  message: string
  createdAt: string
  category: "checkin" | "checkout" | "payment" | "review"
  bookingId?: string
  propertyId?: string
}

const ACTIVE_ROLE_KEY = "notificationsActiveRole"
const READ_KEY_PREFIX = "notificationsRead:"

const nowIso = () => new Date().toISOString()

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "host-checkin-1",
    role: "host",
    title: "Check-in tomorrow at 3:00 PM",
    message: "Alex arrives tomorrow for Coastal Loft. Prepare keys and welcome kit.",
    createdAt: nowIso(),
    category: "checkin",
  },
  {
    id: "host-checkin-2",
    role: "host",
    title: "Check-in today at 2:00 PM",
    message: "Kendi is checking in today at Garden Studio. Please confirm entry details.",
    createdAt: nowIso(),
    category: "checkin",
  },
  {
    id: "host-payment-1",
    role: "host",
    title: "Payment sent to your host wallet",
    message: "A client payment for Riverside Apartment has been released to you.",
    createdAt: nowIso(),
    category: "payment",
  },
  {
    id: "host-review-1",
    role: "host",
    title: "New review from your guest",
    message: "A guest left a rating and comment after their stay at Cityview Condo.",
    createdAt: nowIso(),
    category: "review",
  },
  {
    id: "client-payment-1",
    role: "client",
    title: "Payment deducted",
    message: "Your payment to the host for Skyline Suite has been processed.",
    createdAt: nowIso(),
    category: "payment",
  },
  {
    id: "client-checkin-1",
    role: "client",
    title: "Check-in tomorrow",
    message: "Reminder: Check-in is tomorrow at 3:00 PM for Ocean Breeze Villa.",
    createdAt: nowIso(),
    category: "checkin",
  },
  {
    id: "client-checkin-2",
    role: "client",
    title: "Check-in today",
    message: "Your stay at Forest Cabin starts today. Check-in time is 2:00 PM.",
    createdAt: nowIso(),
    category: "checkin",
  },
  {
    id: "client-checkout-1",
    role: "client",
    title: "Check-out today",
    message: "Please check out by 11:00 AM from Downtown Loft.",
    createdAt: nowIso(),
    category: "checkout",
  },
  {
    id: "client-review-1",
    role: "client",
    title: "Rate your stay",
    message: "Tell us about your visit at Sunset Retreat and leave a comment.",
    createdAt: nowIso(),
    category: "review",
  },
]

export const getNotificationsForRole = (role: NotificationRole) =>
  NOTIFICATIONS.filter((item) => item.role === role)

export const setActiveNotificationRole = (role: NotificationRole) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACTIVE_ROLE_KEY, role)
}

export const getActiveNotificationRole = (): NotificationRole | null => {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(ACTIVE_ROLE_KEY)
  if (stored === "host" || stored === "client") return stored
  return null
}

const readKey = (role: NotificationRole) => `${READ_KEY_PREFIX}${role}`

export const getReadNotificationIds = (role: NotificationRole): string[] => {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(readKey(role))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const setReadNotificationIds = (role: NotificationRole, ids: string[]) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(readKey(role), JSON.stringify(ids))
}

export const markNotificationRead = (role: NotificationRole, id: string) => {
  const current = new Set(getReadNotificationIds(role))
  current.add(id)
  setReadNotificationIds(role, Array.from(current))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications:updated"))
  }
}

export const getUnreadCount = (role: NotificationRole) => {
  const readIds = new Set(getReadNotificationIds(role))
  return getNotificationsForRole(role).filter((item) => !readIds.has(item.id)).length
}

