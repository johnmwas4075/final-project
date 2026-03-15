"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, MessageCircle, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"

const AUTH_KEY = "authUserId"
const AUTH_NAME_KEY = "authUserFirstName"

export default function UserPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [firstName, setFirstName] = useState<string>("there")
  const [activeSection, setActiveSection] = useState<string>("dashboard")

  useEffect(() => {
    if (typeof window === "undefined") return
    const isAuthed = Boolean(window.localStorage.getItem(AUTH_KEY))
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
    if (!isAuthed) {
      router.replace("/login")
      return
    }
    if (storedName) setFirstName(storedName)
    setIsReady(true)
  }, [router])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY)
      window.localStorage.removeItem(AUTH_NAME_KEY)
    }
    router.push("/login")
  }

  if (!isReady) return null

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-rose-500">airbnb</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Message and Notification icons - visible on all screen sizes */}
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageCircle className="h-6 w-6" />
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-6 w-6" />
            </Button>

            {/* Mobile/Desktop hamburger menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <div className="border-b border-border mt-2 mx-4" />
                <nav className="space-y-1 p-4">
                  {/* Sidebar navigation items */}
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium"
                      onClick={() => setActiveSection("dashboard")}
                    >
                      Dashboard
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("bookings")}
                    >
                      My bookings
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("reviews")}
                    >
                      Reviews
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("payments")}
                    >
                      Payments and invoices
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("support")}
                    >
                      Help and support
                    </Button>
                  </SheetClose>

                  {/* Separator */}
                  <div className="my-2 border-t border-border" />

                  {/* Profile links */}
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/")}
                    >
                      Main page
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
                  <SheetClose asChild>
                    <Button
                      className="w-full justify-start rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600"
                      onClick={() => router.push("/host/verify")}
                    >
                      Become a Host
                    </Button>
                  </SheetClose>

                  {/* Logout separator */}
                  <div className="my-2 border-t border-border" />

                  {/* Logout */}
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

            {/* Desktop menu items */}
            <Button
              variant="ghost"
              className="hidden rounded-full text-sm font-medium md:inline-flex"
              onClick={() => router.push("/host/verify")}
            >
              Become a Host
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden rounded-full gap-2 px-3 md:inline-flex">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Hi, {firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/")}>Main page</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full px-4 py-6 sm:px-6">
        <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
          <aside className="hidden w-full border-b border-border bg-background p-4 lg:block lg:w-[240px] lg:border-b-0 lg:border-r">
            <nav className="space-y-0 text-sm">
              <button 
                onClick={() => setActiveSection("dashboard")}
                className={`w-full rounded-md px-3 py-2 text-left font-medium transition-colors ${
                  activeSection === "dashboard" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Dashboard
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("bookings")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "bookings" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                My bookings
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("reviews")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "reviews" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Reviews
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("payments")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "payments" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Payments and invoices
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("support")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "support" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Help and support
              </button>
            </nav>
          </aside>

          <section className="flex flex-1 flex-col gap-6 bg-background p-6">
            {activeSection === "dashboard" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
                <p className="mt-4 text-muted-foreground">Welcome to your dashboard, {firstName}!</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Bookings</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">0</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Revenue</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">$0</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Rating</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">-</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "bookings" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">My Bookings</h2>
                <p className="mt-4 text-muted-foreground">You have no bookings yet.</p>
              </div>
            )}

            {activeSection === "reviews" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Reviews</h2>
                <p className="mt-4 text-muted-foreground">You have no reviews yet.</p>
              </div>
            )}

            {activeSection === "payments" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Payments and Invoices</h2>
                <p className="mt-4 text-muted-foreground">You have no payment history.</p>
              </div>
            )}

            {activeSection === "support" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Help and Support</h2>
                <p className="mt-4 text-muted-foreground">Visit our help center for more information.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
