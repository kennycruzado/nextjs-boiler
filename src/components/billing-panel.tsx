"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { isSubscriptionActive } from "@/lib/subscription-status"

type BillingPanelProps = {
  configured: boolean
  subscription: {
    status: string
    statusFormatted: string
    renewsAt: string | null
    endsAt: string | null
    customerPortalUrl: string | null
  } | null
}

export function BillingPanel({ configured, subscription }: BillingPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const active = isSubscriptionActive(subscription?.status)

  async function startCheckout() {
    setError(null)
    setIsPending(true)
    try {
      const response = await fetch("/api/billing/checkout", { method: "POST" })
      const data = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout")
        return
      }
      window.location.assign(data.url)
    } catch {
      setError("Unable to start checkout")
    } finally {
      setIsPending(false)
    }
  }

  async function openPortal() {
    setError(null)
    setIsPending(true)
    try {
      if (subscription?.customerPortalUrl) {
        window.location.assign(subscription.customerPortalUrl)
        return
      }

      const response = await fetch("/api/billing/portal", { method: "POST" })
      const data = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to open billing portal")
        return
      }
      window.location.assign(data.url)
    } catch {
      setError("Unable to open billing portal")
    } finally {
      setIsPending(false)
      router.refresh()
    }
  }

  if (!configured) {
    return (
      <section className="w-full space-y-2 border-t border-border pt-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Billing
        </h2>
        <p className="text-sm text-muted-foreground">
          Lemon Squeezy is not configured. Add store credentials to{" "}
          <code className="text-foreground">.env</code> to enable subscriptions.
        </p>
      </section>
    )
  }

  return (
    <section className="w-full space-y-4 border-t border-border pt-6">
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Billing
        </h2>
        <p className="text-sm text-muted-foreground">
          {active
            ? `Status: ${subscription?.statusFormatted ?? subscription?.status}`
            : "No active subscription yet."}
        </p>
        {active && subscription?.renewsAt ? (
          <p className="text-sm text-muted-foreground">
            Renews at {new Date(subscription.renewsAt).toLocaleString()}
          </p>
        ) : null}
        {!active && subscription?.endsAt ? (
          <p className="text-sm text-muted-foreground">
            Ends at {new Date(subscription.endsAt).toLocaleString()}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {active ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={openPortal}
          >
            {isPending ? "Opening…" : "Manage billing"}
          </Button>
        ) : (
          <Button type="button" disabled={isPending} onClick={startCheckout}>
            {isPending ? "Redirecting…" : "Subscribe"}
          </Button>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  )
}
