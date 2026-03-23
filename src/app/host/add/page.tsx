"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
            <MessageBell role="host" className="rounded-full" href="/messages" />

            <NotificationBell role="host" className="rounded-full" href="/notifications" />

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
                  {hostSidebarNav.map((item) => (
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
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] w-full px-4 py-6 sm:px-6 overflow-hidden">
        <div className="flex h-full w-full flex-col lg:flex-row overflow-hidden">
          <aside className="hidden w-full border-b border-border bg-background p-4 lg:block lg:w-[240px] lg:border-b-0 lg:border-r lg:sticky lg:top-16 lg:h-[calc(100vh-64px)]">
            <nav className="space-y-0 text-sm">
              {hostSidebarNav.map((item, index) => (
                <div key={item.section}>
                  <button
                    onClick={() => handleNavigate(item.section)}
                    className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                      index === 0
                        ? "bg-rose-500/10 text-rose-600"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                  {index < hostSidebarNav.length - 1 && <div className="my-2 border-b border-border" />}
                </div>
              ))}
            </nav>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col gap-6 bg-background p-6 overflow-y-auto">
            <div className="w-full max-w-3xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Add a new Airbnb</h1>
          <p className="text-sm text-muted-foreground">Fill out the details to create a new listing.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-xl border border-border bg-background p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Property Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-foreground">Price (KSh)</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Min Nights</label>
              <Input type="number" min={1} value={minNights} onChange={(e) => setMinNights(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Guests</label>
              <Input type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Bedrooms</label>
              <Input type="number" min={1} value={rooms} onChange={(e) => setRooms(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Bathrooms</label>
              <Input type="number" min={1} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-foreground">County</label>
              <Input value={county} onChange={(e) => setCounty(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Constituency</label>
              <Input value={constituency} onChange={(e) => setConstituency(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Ward</label>
              <Input value={ward} onChange={(e) => setWard(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Upload Images (5–10)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={(event) => handleFileUpload(event.target.files)}
              className="w-full text-sm text-muted-foreground"
            />
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((src, index) => (
                <div key={`${src}-${index}`} className="h-24 overflow-hidden rounded-md border border-border bg-muted/20">
                  <img src={src} alt={`Property ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">First image will be used as the cover image.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amenities</label>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {amenityOptions.map((amenity) => (
                <label key={amenity.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(amenities[amenity.key])}
                    onChange={(event) =>
                      setAmenities((prev) => ({
                        ...prev,
                        [amenity.key]: event.target.checked,
                      }))
                    }
                  />
                  {amenity.label}
                </label>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.push("/host")}>
              Cancel
            </Button>
            <Button className="bg-rose-500 text-white hover:bg-rose-600" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Airbnb"}
            </Button>
          </div>
        </form>
      </div>
          </section>
        </div>
      </div>
    </main>
  )
}
