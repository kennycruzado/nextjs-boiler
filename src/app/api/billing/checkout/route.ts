import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { getAuth } from "@/lib/auth"
import {
  createSubscriptionCheckout,
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

  try {
    const url = await createSubscriptionCheckout({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error("[billing/checkout]", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout",
      },
      { status: 500 }
    )
  }
}
