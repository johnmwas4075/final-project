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

export default function HostPage() {
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
                  {/* Host navigation items */}
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
                      onClick={() => setActiveSection("airbnbs")}
                    >
                      My Airbnbs
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("availability")}
                    >
                      Availability Dates
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("earnings")}
                    >
                      Earnings and Finances
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("bookings")}
                    >
                      Bookings and Management
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("reviews")}
                    >
                      Reviews and Ratings
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => setActiveSection("settings")}
                    >
                      Host Settings
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
              onClick={() => router.push("/userpage")}
            >
              Client page
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
                onClick={() => setActiveSection("airbnbs")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "airbnbs" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                My Airbnbs
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("availability")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "availability" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Availability Dates
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("earnings")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "earnings" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Earnings and Finances
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
                Bookings and Management
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
                Reviews and Ratings
              </button>
              <div className="my-2 border-b border-border" />
              <button 
                onClick={() => setActiveSection("settings")}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  activeSection === "settings" 
                    ? "bg-rose-500/10 text-rose-600" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Host Settings
              </button>
            </nav>
          </aside>

          <section className="flex flex-1 flex-col gap-6 bg-background p-6">
            {activeSection === "dashboard" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
                <p className="mt-4 text-muted-foreground">Welcome to your host dashboard, {firstName}!</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Active Listings</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">0</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Total Earnings</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">$0</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">Avg. Rating</h3>
                    <p className="mt-2 text-3xl font-bold text-rose-500">-</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "airbnbs" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">My Airbnbs</h2>
                <p className="mt-4 text-muted-foreground">You have no properties listed yet.</p>
              </div>
            )}

            {activeSection === "availability" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Availability Dates</h2>
                <p className="mt-4 text-muted-foreground">Manage your property availability calendar.</p>
              </div>
            )}

            {activeSection === "earnings" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Earnings and Finances</h2>
                <p className="mt-4 text-muted-foreground">View your earnings and financial reports.</p>
              </div>
            )}

            {activeSection === "bookings" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Bookings and Management</h2>
                <p className="mt-4 text-muted-foreground">You have no bookings yet.</p>
              </div>
            )}

            {activeSection === "reviews" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Reviews and Ratings</h2>
                <p className="mt-4 text-muted-foreground">You have no reviews yet.</p>
              </div>
            )}

            {activeSection === "settings" && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Host Settings</h2>
                <p className="mt-4 text-muted-foreground">Manage your host profile and preferences.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
