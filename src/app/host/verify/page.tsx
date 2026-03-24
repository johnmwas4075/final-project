import { Suspense } from "react"
import { HostVerifyClient } from "./verify-client"

export default function HostVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-foreground">Confirm your details</h1>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <HostVerifyClient />
    </Suspense>
  )
}
