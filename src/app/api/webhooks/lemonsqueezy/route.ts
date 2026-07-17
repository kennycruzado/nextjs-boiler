import crypto from "node:crypto"

import {
  processWebhookEvent,
  storeWebhookEvent,
} from "@/lib/lemonsqueezy-webhooks"

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    return new Response("LEMONSQUEEZY_WEBHOOK_SECRET is not set", {
      status: 500,
    })
  }

  const rawBody = await request.text()
  const signatureHeader = request.headers.get("X-Signature") ?? ""

  const digest = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "hex"
  )
  const signature = Buffer.from(signatureHeader, "hex")

  if (
    digest.length === 0 ||
    signature.length === 0 ||
    digest.length !== signature.length ||
    !crypto.timingSafeEqual(digest, signature)
  ) {
    return new Response("Invalid signature", { status: 400 })
  }

  const data = JSON.parse(rawBody) as {
    meta?: { event_name?: string }
  }

  const eventName = data.meta?.event_name
  if (!eventName) {
    return new Response("Missing event name", { status: 400 })
  }

  const eventId = await storeWebhookEvent(eventName, data)

  try {
    await processWebhookEvent(eventId)
  } catch (error) {
    console.error("[lemonsqueezy webhook]", error)
    // Still acknowledge receipt so Lemon Squeezy does not retry forever
    // while the stored event retains processing_error for debugging.
  }

  return new Response("OK", { status: 200 })
}
