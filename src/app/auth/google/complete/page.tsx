import { Suspense } from "react"

import GoogleAuthCompletePage from "./complete-client"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-background text-foreground">
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </div>
      }
    >
      <GoogleAuthCompletePage />
    </Suspense>
  )
}
