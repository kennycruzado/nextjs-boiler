"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleSignOut() {
    setIsPending(true)
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={handleSignOut}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
