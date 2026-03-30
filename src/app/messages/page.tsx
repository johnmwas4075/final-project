"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageBell } from "@/components/message-bell"
import { NotificationBell } from "@/components/notification-bell"
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
const AUTH_EMAIL_KEY = "authUserEmail"
const AUTH_USERNAME_KEY = "authUserUsername"

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

type ThreadItem = {
  id: string
  name: string
  username: string
  lastMessage: string
  timestamp: string
  unreadCount: number
}

export default function MessagesPage() {
  const router = useRouter()
  const [role, setRole] = useState<MessageRole>("client")
  const [threads, setThreads] = useState<ThreadItem[]>([])
  const [threadsQuery, setThreadsQuery] = useState("")
  const [hostUnreadTotal, setHostUnreadTotal] = useState(0)
  const [clientUnreadTotal, setClientUnreadTotal] = useState(0)
  const [isAuthed, setIsAuthed] = useState(false)
  const [firstName, setFirstName] = useState<string>("")
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

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
    const storedEmail = window.localStorage.getItem(AUTH_EMAIL_KEY)
    if (storedEmail) setUserEmail(storedEmail)
    const storedUsername = window.localStorage.getItem(AUTH_USERNAME_KEY)
    if (storedUsername) setUsername(storedUsername)
  }, [])

  useEffect(() => {
    if (!userId && !userEmail && !username) {
      setThreads([])
      setHostUnreadTotal(0)
      setClientUnreadTotal(0)
      return
    }
    let cancelled = false

    const fetchThreads = async (roleValue: MessageRole) => {
      const params = new URLSearchParams()
      if (userId) params.set("userId", userId)
      if (userEmail) params.set("email", userEmail)
      if (username) params.set("username", username)
      params.set("role", roleValue)
      const res = await fetch(`/api/messages/threads?${params.toString()}`)
      const data = await res.json()
      return Array.isArray(data.threads) ? data.threads : []
    }

    const load = async () => {
      try {
        const [hostThreads, clientThreads] = await Promise.all([
          fetchThreads("host"),
          fetchThreads("client"),
        ])
        if (cancelled) return
        setHostUnreadTotal(
          hostThreads.reduce((sum: number, thread: ThreadItem) => sum + (thread.unreadCount || 0), 0)
        )
        setClientUnreadTotal(
          clientThreads.reduce((sum: number, thread: ThreadItem) => sum + (thread.unreadCount || 0), 0)
        )
        setThreads(role === "host" ? hostThreads : clientThreads)
      } catch {
        if (!cancelled) {
          setThreads([])
          setHostUnreadTotal(0)
          setClientUnreadTotal(0)
        }
      }
    }

    load()
    const interval = setInterval(load, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [role, userId, userEmail, username])

  const filteredThreads = useMemo(() => {
    const query = threadsQuery.trim().toLowerCase()
    if (!query) return threads
    return threads.filter((thread) => {
      return (
        thread.name.toLowerCase().includes(query) ||
        thread.username.toLowerCase().includes(query) ||
        thread.lastMessage.toLowerCase().includes(query)
      )
    })
  }, [threads, threadsQuery])

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

  const handleBecomeHost = () => {
    const authed = Boolean(typeof window !== "undefined" && window.localStorage.getItem(AUTH_KEY))
    router.push(authed ? "/host/verify" : "/login")
  }

  const handleClientPage = () => {
    router.push("/userpage")
  }

  const switchInbox = () => {
    const nextRole: MessageRole = role === "host" ? "client" : "host"
    if (typeof window !== "undefined") {
      window.localStorage.setItem("messagesActiveRole", nextRole)
    }
    if (role !== "host" && nextRole === "host") {
      router.push(`/host/verify?next=${encodeURIComponent("/messages")}`)
      return
    }
    setRole(nextRole)
  }

  return (
    <main className="h-screen bg-background overflow-hidden">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <MessageBell role={role} className="rounded-full" href="/messages" />

            <div className="flex min-w-0 flex-1 justify-center px-3">
              <p className="truncate text-sm font-semibold text-foreground">Messages</p>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell role={role} className="rounded-full" href="/notifications" />

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
          </div>

          <div className="hidden w-full items-center justify-between md:flex">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-rose-500 font-brand">Dwellify</span>
            </div>

            <div className="flex items-center gap-3">
              <MessageBell role={role} className="rounded-full" href="/messages" />
              <NotificationBell role={role} className="rounded-full" href="/notifications" />

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full md:hidden">
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

      <div className="flex h-[calc(100vh-64px)] w-full px-4 lg:pl-0 py-4 sm:px-6 sm:py-6 overflow-hidden">
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

          <section className="flex w-full min-w-0 flex-1 flex-col gap-4 bg-background p-4 sm:p-6 overflow-y-auto">
            <div className="hidden md:block">
              <h2 className="text-2xl font-semibold text-foreground">Messages</h2>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-full" onClick={switchInbox}>
                <span>{role === "host" ? "Client inbox" : "Host inbox"}</span>
                {(role === "host" ? clientUnreadTotal : hostUnreadTotal) > 0 && (
                  <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {role === "host" ? clientUnreadTotal : hostUnreadTotal}
                  </span>
                )}
              </Button>
              <div className="flex w-full max-w-md items-center rounded-full border border-border bg-background px-4 py-2 shadow-sm">
                <input
                  type="search"
                  value={threadsQuery}
                  onChange={(event) => setThreadsQuery(event.target.value)}
                  placeholder="Search users or usernames"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  aria-label="Search messages"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/messages/${thread.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      router.push(`/messages/${thread.id}`)
                    }
                  }}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-base font-semibold text-foreground">{thread.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {thread.unreadCount > 0 && (
                        <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-semibold text-white">
                          {thread.unreadCount}
                        </span>
                      )}
                      <span>{thread.timestamp}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">@{thread.username}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {thread.lastMessage}
                  </p>
                </div>
              ))}

              {threads.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

