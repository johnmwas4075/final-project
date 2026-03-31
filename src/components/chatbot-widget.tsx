"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { MessageCircle, X } from "lucide-react"

const AUTH_KEY = "authUserId"

type ChatRole = "BOT" | "USER"

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt?: string
}

const SUGGESTIONS = [
  "Try: Best places to visit in Mombasa",
  "Try: 2-bedroom stays in Nairobi",
  "Try: How do I reserve a place?",
]

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\[[^\]]+\]\([^\)]+\))/g)
    return parts.map((part, index) => {
      const match = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)
      if (match) {
        return (
          <Link key={`link-${index}`} href={match[2]} className="text-rose-600 underline">
            {match[1]}
          </Link>
        )
      }
      return <span key={`text-${index}`}>{part}</span>
    })
  }

  const suggestion = useMemo(() => SUGGESTIONS[suggestionIndex % SUGGESTIONS.length], [suggestionIndex])

  useEffect(() => {
    if (typeof window === "undefined") return
    setUserId(window.localStorage.getItem(AUTH_KEY))
  }, [])

  useEffect(() => {
    if (!isOpen) return
    if (!userId) {
      setMessages([
        {
          id: "welcome",
          role: "BOT",
          content: "You're chatting as a guest. Messages won't be saved, but I'm happy to help.",
        },
      ])
      return
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/chatbot?userId=${encodeURIComponent(userId)}`)
        const data = await res.json()
        const items = Array.isArray(data.messages) ? data.messages : []
        setMessages(
          items.map((item: ChatMessage) => ({
            id: item.id,
            role: item.role,
            content: item.content,
            createdAt: item.createdAt,
          }))
        )
      } catch {
        setMessages([
          {
            id: "error",
            role: "BOT",
            content: "I had trouble loading your conversation. Please try again.",
          },
        ])
      }
    }
    load()
  }, [isOpen, userId])

  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => prev + 1)
    }, 6000)
    return () => clearInterval(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const node = listRef.current
    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return
    setInput("")
    setSending(true)
    setIsThinking(true)

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "USER",
      content: trimmed,
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userId ? { userId, message: trimmed } : { message: trimmed }),
      })
      const data = await res.json()
      if (data?.userMessage && data?.botMessage) {
        setMessages((prev) => [
          ...prev.filter((item) => item.id !== optimistic.id),
          data.userMessage,
          data.botMessage,
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `bot-error-${Date.now()}`, role: "BOT", content: "Sorry, I couldn't send that. Try again." },
      ])
    } finally {
      setSending(false)
      setIsThinking(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      {!isOpen && (
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 animate-pulse">
            {suggestion}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-transform hover:scale-105 animate-pulse"
            aria-label="Open chatbot"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="w-[340px] max-w-[92vw] overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 text-sm font-semibold">
                B
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Bot</p>
                <p className="text-xs text-muted-foreground">Tourist places, stays, and help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-[320px] max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 py-3" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.role === "USER" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    message.role === "USER"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-rose-500/10 text-rose-600"
                  }`}
                >
                  {message.role === "USER" ? "U" : "B"}
                </div>
                <div className="flex max-w-[70%] flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {message.role === "USER" ? "You" : "Bot"}
                  </span>
                  <div className="rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground whitespace-pre-line">
                    {renderMessageContent(message.content)}
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-xs font-semibold text-rose-600">B</div>
                <div className="flex max-w-[70%] flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">Bot</span>
                  <div className="rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              </div>
            )}
            {messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Ask me about tourist places, Dwellify stays, or how to use the system.
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            {!userId && (
              <div className="mb-2 text-center text-xs text-muted-foreground">
                You're in guest mode. Messages won't be saved.
                <Link href="/login" className="ml-1 text-rose-600 underline">
                  Log in
                </Link>
                to save your chat.
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={userId ? "Ask me anything..." : "Ask me anything (guest mode)..."}
                className="h-10 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-rose-500/70"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="h-10 rounded-full bg-rose-500 px-4 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

