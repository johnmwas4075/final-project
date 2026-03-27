"use client"

import { usePathname } from "next/navigation"
import { ChatbotWidget } from "@/components/chatbot-widget"

export function ChatbotWrapper() {
  const pathname = usePathname()
  if (
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/inbox") ||
    pathname.startsWith("/inboxes")
  ) {
    return null
  }
  return <ChatbotWidget />
}

