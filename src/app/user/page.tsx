import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UserPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Welcome!</h1>
          <p className="text-sm text-muted-foreground">
            Your user account is set up. From here you can explore stays or continue to become a host.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Next steps</h2>
            <p className="text-sm text-muted-foreground">
              Start browsing locations or complete your host profile.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Browse stays</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/host">Become a host</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
