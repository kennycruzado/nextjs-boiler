import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { getAuth } from "@/lib/auth"
import { getUserSubscription } from "@/lib/billing"
import {
  getCustomerPortalUrl,
  isLemonSqueezyConfigured,
} from "@/lib/lemonsqueezy"

export async function POST() {
  if (!isLemonSqueezyConfigured()) {
    return NextResponse.json(
      { error: "Lemon Squeezy is not configured" },
      { status: 503 }
    )
  }

  const auth = await getAuth()
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const current = await getUserSubscription(session.user.id)
  if (!current?.customerId) {
    return NextResponse.json(
      { error: "No Lemon Squeezy customer found for this account" },
      { status: 404 }
    )
  }

  try {
    const url =
      current.customerPortalUrl ??
      (await getCustomerPortalUrl(current.customerId))

    return NextResponse.json({ url })
  } catch (error) {
    console.error("[billing/portal]", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open customer portal",
      },
      { status: 500 }
    )
  }
}
