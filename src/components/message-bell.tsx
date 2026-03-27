"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type MessageBellProps = {
  role: string
  className?: string
  href?: string
  onClick?: () => void
}

export function MessageBell({ role, className, href, onClick }: MessageBellProps) {
  const router = useRouter()
  const [unreadThreads, setUnreadThreads] = useState(0)

  useEffect(() => {
    const refresh = () => {
      if (typeof window === "undefined") return
      const userId = window.localStorage.getItem("authUserId")
      if (!userId) return
      fetch(`/api/messages/unread?userId=${encodeURIComponent(userId)}`)
        .then((res) => res.json())
        .then((data) => {
          setUnreadThreads(typeof data.unreadThreads === "number" ? data.unreadThreads : 0)
        })
        .catch(() => setUnreadThreads(0))
    }
    refresh()
    if (typeof window === "undefined") return
    const interval = setInterval(refresh, 5000)
    const handleUpdate = () => refresh()
    window.addEventListener("messages:updated", handleUpdate)
    return () => {
      clearInterval(interval)
      window.removeEventListener("messages:updated", handleUpdate)
    }
  }, [role])

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("messagesActiveRole", role)
    }
    if (onClick) {
      onClick()
      return
    }
    router.push(href ?? "/messages")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative rounded-full ${className ?? ""}`}
      onClick={handleClick}
      aria-label="Messages"
    >
      <MessageCircle className="h-6 w-6" />
      {unreadThreads > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] rounded-full px-1 text-[10px]"
        >
          {unreadThreads}
        </Badge>
      )}
    </Button>
  )
}

