"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function GoogleAuthCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: error ? "google-oauth-error" : "google-oauth-success",
          error,
        },
        window.location.origin
      )
      window.close()
      return
    }

    router.replace(error ? "/login" : "/app")
  }, [error, router])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">
        {error ? "Sign in failed. You can close this window." : "Signing you in…"}
      </p>
    </div>
  )
}
