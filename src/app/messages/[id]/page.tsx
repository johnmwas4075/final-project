"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Menu, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { MessageBell } from "@/components/message-bell"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageRole, getActiveMessageRole } from "@/lib/messages"
import { getActiveNotificationRole } from "@/lib/notifications"

const AUTH_KEY = "authUserId"
const AUTH_NAME_KEY = "authUserFirstName"

const hostSidebarNav = [
  { label: "Dashboard", section: "dashboard" },
  { label: "My Dwellify listings", section: "airbnbs" },
  { label: "Availability Dates", section: "availability" },
  { label: "Earnings and Finances", section: "earnings" },
  { label: "Bookings and Management", section: "bookings" },
  { label: "Reviews and Ratings", section: "reviews" },
  { label: "Host Settings", section: "settings" },
]

const clientSidebarNav = [
  { label: "Dashboard", section: "dashboard" },
  { label: "My bookings", section: "bookings" },
  { label: "Reviews", section: "reviews" },
  { label: "Payments and invoices", section: "payments" },
  { label: "Help and support", section: "support" },
]

const CLIENT_SECTION_KEY = "userActiveSection"
const HOST_SECTION_KEY = "hostActiveSection"

export default function MessageThreadPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const threadId = String(params?.id ?? "")
  const propertyName = searchParams.get("propertyName") || ""
  const hostNameParam = searchParams.get("hostName") || ""
  const hostUsernameParam = searchParams.get("hostUsername") || ""
  const [role, setRole] = useState<MessageRole>("client")
  const [isAuthed, setIsAuthed] = useState(false)
  const [firstName, setFirstName] = useState<string>("")
  const [threadData, setThreadData] = useState<any | null>(null)
  const [log, setLog] = useState<any[]>([])
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const active = getActiveMessageRole()
    if (active) {
      setRole(active)
      return
    }
    const fallback = getActiveNotificationRole()
    if (fallback) setRole(fallback)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const authed = Boolean(window.localStorage.getItem(AUTH_KEY))
    setIsAuthed(authed)
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
    if (storedName) setFirstName(storedName)
    const storedUserId = window.localStorage.getItem(AUTH_KEY)
    if (storedUserId) setUserId(storedUserId)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [log.length])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!threadId) return
    fetch(`/api/messages/thread?threadId=${encodeURIComponent(threadId)}`)
      .then((res) => res.json())
      .then((data) => setThreadData(data.thread ?? null))
      .catch(() => setThreadData(null))
  }, [threadId])

  useEffect(() => {
    if (!threadId) return
    const fetchLog = () => {
      const logUrl =
        "/api/messages/log?threadId=" +
        encodeURIComponent(threadId) +
        (userId ? "&userId=" + encodeURIComponent(userId) : "")
      fetch(logUrl)
        .then((res) => res.json())
        .then((data) => setLog(Array.isArray(data.messages) ? data.messages : []))
        .catch(() => setLog([]))
    }
    fetchLog()
    const interval = setInterval(fetchLog, 3000)
    return () => clearInterval(interval)
  }, [threadId, userId])

  useEffect(() => {
    if (!threadId || !userId) return
    const fetchTyping = () => {
      fetch(
        "/api/messages/typing?threadId=" +
          encodeURIComponent(threadId) +
          "&userId=" +
          encodeURIComponent(userId)
      )
        .then((res) => res.json())
        .then((data) => {
          setIsOtherTyping(Array.isArray(data.typing) && data.typing.length > 0)
        })
        .catch(() => {
          setIsOtherTyping(false)
        })
    }
    fetchTyping()
    const interval = setInterval(fetchTyping, 2000)
    return () => clearInterval(interval)
  }, [threadId, userId])

  useEffect(() => {
    if (!threadId || !userId) return
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current)
    typingDebounceRef.current = setTimeout(() => {
      fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, userId, isTyping }),
      }).catch(() => null)
    }, 300)
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current)
    }
  }, [isTyping, threadId, userId])

  const handleNavigate = (section: string) => {
    if (typeof window === "undefined") return
    if (role === "host") {
      window.localStorage.setItem(HOST_SECTION_KEY, section)
      router.push("/host")
    } else {
      window.localStorage.setItem(CLIENT_SECTION_KEY, section)
      router.push("/userpage")
    }
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY)
      window.localStorage.removeItem(AUTH_NAME_KEY)
    }
    router.push("/login")
  }

  const handleInputResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  const handleBecomeHost = () => {
    const authed = Boolean(
      typeof window !== "undefined" && window.localStorage.getItem(AUTH_KEY)
    )
    router.push(authed ? "/host/verify" : "/login")
  }

  const handleClientPage = () => {
    router.push("/userpage")
  }

  const handleSend = async () => {
    if (isSending) return
    const nextBody = messageText.trim()
    if (!nextBody) return
    if (!userId || !threadData) return
    setIsSending(true)
    const isHost = role === "host"
    const hostId = threadData.hostId
    const guestId = threadData.guestId
    const receiverId = isHost ? guestId : hostId

    try {
      const payload = {
        threadId,
        hostId,
        guestId,
        senderId: userId,
        receiverId,
        body: nextBody,
      }

      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        return
      }

      const data = await response.json()
      if (data?.message) {
        setLog((prev) => [...prev, data.message])
        setMessageText("")
        setIsTyping(false)
        if (typingIdleRef.current) clearTimeout(typingIdleRef.current)
        requestAnimationFrame(() => handleInputResize())
      }
    } catch {
      // leave message text for retry
    } finally {
      setIsSending(false)
    }
  }

  const otherUser =
    userId && threadData?.hostId && threadData?.guestId
      ? userId === threadData.hostId
        ? threadData?.guest
        : userId === threadData.guestId
          ? threadData?.host
          : role === "host"
            ? threadData?.guest
            : threadData?.host
      : role === "host"
        ? threadData?.guest
        : threadData?.host
  const cleanedUsername = ((otherUser?.username ?? hostUsernameParam) || "username").replace(/^@+/, "")
  const otherDisplayName =
    [otherUser?.firstName, otherUser?.middleName, otherUser?.lastName].filter(Boolean).join(" ") ||
    cleanedUsername ||
    hostNameParam ||
    "Chat"

  return (
    <main className="h-screen bg-background overflow-hidden">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push("/messages")}
              aria-label="Back to messages"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                <img
                  src={otherUser?.avatarUrl ?? "/images/avatars/default.png"}
                  alt={otherDisplayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {otherDisplayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{cleanedUsername}
                </p>
              </div>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <div className="border-b border-border mt-2 mx-4" />
                <nav className="space-y-1 p-4">
                  {(role === "host" ? hostSidebarNav : clientSidebarNav).map((item) => (
                    <SheetClose asChild key={item.section}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-md px-3 py-2 text-sm"
                        onClick={() => handleNavigate(item.section)}
                      >
                        {item.label}
                      </Button>
                    </SheetClose>
                  ))}
                  <div className="my-2 border-t border-border" />
                  <SheetClose asChild>
                    <Button variant="ghost" className="w-full justify-start rounded-md px-3 py-2 text-sm" asChild>
                      <Link href="/">Main page</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/profile")}
                    >
                      Profile settings
                    </Button>
                  </SheetClose>
                  {role === "host" ? (
                    <SheetClose asChild>
                      <Button
                        className="w-full justify-start rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600"
                        onClick={handleClientPage}
                      >
                        Client page
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        className="w-full justify-start rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600"
                        onClick={handleBecomeHost}
                      >
                        Become a Host
                      </Button>
                    </SheetClose>
                  )}
                  <div className="my-2 border-t border-border" />
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      Log out
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden w-full items-center justify-between md:flex">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-rose-500 font-brand">Dwellify</span>
            </div>

            <div className="flex items-center gap-3">
              <MessageBell role={role} className="rounded-full" href="/messages" />
              <NotificationBell role={role} className="rounded-full" href="/notifications" />
              <Button
                variant="ghost"
                className="hidden rounded-full text-sm font-medium md:inline-flex"
                onClick={role === "host" ? handleClientPage : handleBecomeHost}
              >
                {role === "host" ? "Client page" : "Become a Host"}
              </Button>

              {isAuthed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="hidden rounded-full gap-2 px-3 md:inline-flex">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Hi, {firstName || "there"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild><Link href="/">Main page</Link></DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>Profile settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] w-full px-4 lg:pl-0 py-6 sm:px-6 overflow-hidden">
        <div className="flex h-full w-full flex-col lg:flex-row overflow-hidden">
          <aside className="hidden w-full border-b border-rose-400/60 bg-rose-500 p-4 text-white lg:block lg:w-[240px] lg:border-b-0 lg:border-r lg:sticky lg:top-16 lg:h-[calc(100vh-64px)]">
            <nav className="space-y-0 text-sm">
              {(role === "host" ? hostSidebarNav : clientSidebarNav).map((item, index) => (
                <div key={item.section}>
                  <button
                    onClick={() => handleNavigate(item.section)}
                    className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                      index === 0
                        ? "bg-white text-rose-600"
                        : "text-white/90 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                  {index < (role === "host" ? hostSidebarNav : clientSidebarNav).length - 1 && (
                    <div className="my-2 border-b border-white/30" />
                  )}
                </div>
              ))}
            </nav>
          </aside>

          <section className="flex w-full min-w-0 flex-1 flex-col bg-background p-6 overflow-hidden">
            <div className="hidden md:flex items-center gap-3 border-b border-border pb-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => router.push("/messages")}
                aria-label="Back to messages"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                <img
                  src={otherUser?.avatarUrl ?? "/images/avatars/default.png"}
                  alt={otherDisplayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{otherDisplayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  @{cleanedUsername}
                </p>
              </div>
            </div>

            {propertyName && (
              <p className="text-xs font-medium text-muted-foreground">{propertyName}</p>
            )}

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              {log.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col justify-end overflow-y-auto">
                  <div className="space-y-3">
                    {log.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={"flex " + (msg.senderId === userId ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={
                            "max-w-[640px] rounded-2xl px-4 py-2 text-sm shadow-sm " +
                            (msg.senderId === userId ? "bg-rose-500 text-white" : "bg-muted text-foreground")
                          }
                        >
                          <p>{msg.body}</p>
                          <p
                            className={
                              "mt-2 text-[10px] " +
                              (msg.senderId === userId ? "text-white/80" : "text-muted-foreground")
                            }
                          >
                            {new Date(msg.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isOtherTyping && (
                    <div className="mt-3 text-xs text-muted-foreground">Typing...</div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={(event) => {
                      setMessageText(event.target.value)
                      setIsTyping(true)
                      handleInputResize()
                      if (typingIdleRef.current) clearTimeout(typingIdleRef.current)
                      typingIdleRef.current = setTimeout(() => setIsTyping(false), 1200)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="min-h-[44px] w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  />
                  <Button
                    type="button"
                    className="h-11 w-11 rounded-full"
                    onClick={handleSend}
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
