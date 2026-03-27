"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type NotificationBellProps = {
  role: string
  className?: string
  href?: string
  onClick?: () => void
}

export function NotificationBell({ role, className, href, onClick }: NotificationBellProps) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const refresh = () => {
      if (typeof window === "undefined") return
      const userId = window.localStorage.getItem("authUserId")
      if (!userId) return
      fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`)
        .then((res) => res.json())
        .then((data) => {
          const items = Array.isArray(data.notifications) ? data.notifications : []
          setUnreadCount(items.filter((item) => !item.readAt).length)
        })
        .catch(() => setUnreadCount(0))
    }
    refresh()
    if (typeof window === "undefined") return
    const handleUpdate = () => refresh()
    window.addEventListener("notifications:updated", handleUpdate)
    return () => {
      window.removeEventListener("notifications:updated", handleUpdate)
    }
  }, [role])

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("notificationsActiveRole", role)
    }
    if (onClick) {
      onClick()
      return
    }
    router.push(href ?? "/notifications")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative rounded-full ${className ?? ""}`}
      onClick={handleClick}
      aria-label="Notifications"
    >
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] rounded-full px-1 text-[10px]"
        >
          {unreadCount}
        </Badge>
      )}
    </Button>
  )
}

