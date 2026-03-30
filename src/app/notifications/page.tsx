"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { getActiveMessageRole } from "@/lib/messages"
import {
  NotificationRole,
  NotificationItem,
  getActiveNotificationRole,
  getNotificationsForRole,
  getReadNotificationIds,
  getUnreadCount,
  markNotificationRead,
} from "@/lib/notifications"

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

export default function NotificationsPage() {
  const router = useRouter()
  const [role, setRole] = useState<NotificationRole>("client")
  const [isAuthed, setIsAuthed] = useState(false)
  const [firstName, setFirstName] = useState<string>("")
  const [readIds, setReadIds] = useState<string[]>([])

  useEffect(() => {
    const active = getActiveNotificationRole()
    if (active) {
      setRole(active)
      return
    }
    const fallback = getActiveMessageRole()
    if (fallback) setRole(fallback)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const authed = Boolean(window.localStorage.getItem(AUTH_KEY))
    setIsAuthed(authed)
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
    if (storedName) setFirstName(storedName)
  }, [])

  useEffect(() => {
    setReadIds(getReadNotificationIds(role))
  }, [role])

  useEffect(() => {
    const handleUpdate = () => setReadIds(getReadNotificationIds(role))
    if (typeof window !== "undefined") {
      window.addEventListener("notifications:updated", handleUpdate)
      return () => window.removeEventListener("notifications:updated", handleUpdate)
    }
  }, [role])

  const notifications = useMemo(() => getNotificationsForRole(role), [role])
  const hostUnreadCount = role === "client" ? getUnreadCount("host") : 0

  const isRead = (id: string) => readIds.includes(id)

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

  const handleGoToHost = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("notificationsActiveRole", "host")
    }
    setRole("host")
  }

  const handleMarkRead = (id: string) => {
    markNotificationRead(role, id)
    setReadIds(getReadNotificationIds(role))
  }

  const handleNotificationClick = (item: NotificationItem) => {
    handleMarkRead(item.id)
    if (item.propertyId) {
      router.push(`/property/${item.propertyId}`)
      return
    }
    const section =
      item.category === "payment"
        ? role === "host"
          ? "earnings"
          : "payments"
        : item.category === "review"
          ? "reviews"
          : "bookings"
    handleNavigate(section)
  }

  const formatTimestamp = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
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
              <p className="truncate text-sm font-semibold text-foreground">Notifications</p>
            </div>

            <div className="flex items-center gap-2">
              <MessageBell role={role} className="rounded-full" href="/messages" />

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
              <h2 className="text-2xl font-semibold text-foreground">Notifications</h2>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {role === "client" && (
                <Button variant="outline" onClick={handleGoToHost}>
                  Host notifications {hostUnreadCount > 0 ? `(${hostUnreadCount} unread)` : ""}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNotificationClick(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleNotificationClick(item)
                    }
                  }}
                  className={`rounded-xl border border-border p-4 shadow-sm transition-colors ${
                    isRead(item.id) ? "opacity-70" : "bg-card cursor-pointer"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                        {!isRead(item.id) && (
                          <Badge variant="destructive" className="h-5 rounded-full px-2 text-[10px]">
                            Unread
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(item.createdAt)}</p>
                    </div>
                    {!isRead(item.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleMarkRead(item.id)
                        }}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

