import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { BillingPanel } from "@/components/billing-panel"
import { SignOutButton } from "@/components/sign-out-button"
import { getAuth } from "@/lib/auth"
import { getUserSubscription } from "@/lib/billing"
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy"

export default async function AppPage() {
  const auth = await getAuth()
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const currentSubscription = await getUserSubscription(session.user.id)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-foreground">
      <main className="flex w-full max-w-lg flex-col items-start gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Signed in</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {session.user.name}
          </h1>
          <p className="text-muted-foreground">{session.user.email}</p>
        </div>

        <BillingPanel
          configured={isLemonSqueezyConfigured()}
          subscription={
            currentSubscription
              ? {
                  status: currentSubscription.status,
                  statusFormatted: currentSubscription.statusFormatted,
                  renewsAt: currentSubscription.renewsAt,
                  endsAt: currentSubscription.endsAt,
                  customerPortalUrl: currentSubscription.customerPortalUrl,
                }
              : null
          }
        />

        <SignOutButton />
      </main>
    </div>
  )
}
