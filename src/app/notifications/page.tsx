"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationBell } from "@/components/notification-bell"\nimport { MessageBell } from "@/components/message-bell"
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
                            onClick={() => router.push("/userpage")}
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
                <span className="text-xl font-bold text-rose-500">airbnb</span>
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
                            onClick={() => router.push("/userpage")}
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
                  onClick={role === "host" ? () => router.push("/userpage") : handleBecomeHost}
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

      <div className="flex h-[calc(100vh-64px)] w-full px-4 py-4 sm:px-6 sm:py-6 overflow-hidden">
        <div className="flex h-full w-full flex-col lg:flex-row overflow-hidden">
          <aside className="hidden w-full border-b border-border bg-background p-4 lg:block lg:w-[240px] lg:border-b-0 lg:border-r lg:sticky lg:top-16 lg:h-[calc(100vh-64px)]">
            <nav className="space-y-0 text-sm">
              {(role === "host" ? hostSidebarNav : clientSidebarNav).map((item, index) => (
                <div key={item.section}>
                  <button
                    onClick={() => handleNavigate(item.section)}
                    className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                      index == 0
                        ? "bg-rose-500/10 text-rose-600"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                  {index < (role === "host" ? hostSidebarNav : clientSidebarNav).length - 1 && (
                    <div className="my-2 border-b border-border" />
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
                  onClick={() => handleOpen(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleOpen(item)
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
