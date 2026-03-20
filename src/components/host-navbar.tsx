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
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"

const AUTH_KEY = "authUserId"
const AUTH_NAME_KEY = "authUserFirstName"
const HOST_SECTION_KEY = "hostActiveSection"

export function HostNavbar() {
  const router = useRouter()
  const [firstName, setFirstName] = useState<string>("there")

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY)
    if (storedName) setFirstName(storedName)
  }, [])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY)
      window.localStorage.removeItem(AUTH_NAME_KEY)
    }
    router.push("/login")
  }

  const goToSection = (section: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HOST_SECTION_KEY, section)
    }
    router.push("/host")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-rose-500">airbnb</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-6 w-6" />
          </Button>

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
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-md px-3 py-2 text-sm"
                    onClick={() => goToSection("dashboard")}
                  >
                    Host dashboard
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-md px-3 py-2 text-sm"
                    onClick={() => goToSection("bookings")}
                  >
                    Bookings and Management
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-md px-3 py-2 text-sm"
                    onClick={() => goToSection("airbnbs")}
                  >
                    My Airbnbs
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-md px-3 py-2 text-sm"
                    onClick={() => goToSection("availability")}
                  >
                    Availability Dates
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-md px-3 py-2 text-sm"
                    onClick={() => goToSection("earnings")}
                  >
                    Earnings and Finances
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-md px-3 py-2 text-sm"
                    onClick={() => goToSection("reviews")}
                  >
                    Reviews and Ratings
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-md px-3 py-2 text-sm"
                    onClick={() => goToSection("settings")}
                  >
                    Host Settings
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-md px-3 py-2 text-sm"
                    onClick={() => router.push("/host/airbnbs")}
                  >
                    Check Airbnbs
                  </Button>
                </SheetClose>
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
                    onClick={() => router.push("/userpage")}
                  >
                    Client page
                  </Button>
                </SheetClose>
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
              <DropdownMenuItem onClick={() => goToSection("dashboard")}>Host dashboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goToSection("bookings")}>Bookings and Management</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goToSection("airbnbs")}>My Airbnbs</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goToSection("availability")}>Availability Dates</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goToSection("earnings")}>Earnings and Finances</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goToSection("reviews")}>Reviews and Ratings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goToSection("settings")}>Host Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/host/airbnbs")}>Check Airbnbs</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/")}>Main page</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
