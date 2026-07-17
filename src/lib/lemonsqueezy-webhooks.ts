import { eq } from "drizzle-orm"

import { getDb } from "@/db"
import { subscription, webhookEvent } from "@/db/schema"

type LemonWebhookPayload = {
  meta: {
    event_name: string
    custom_data?: {
      user_id?: string
    }
  }
  data: {
    id: string
    type: string
    attributes: Record<string, unknown>
  }
}

function hasMeta(value: unknown): value is LemonWebhookPayload {
  if (!value || typeof value !== "object") return false
  const meta = (value as { meta?: unknown }).meta
  if (!meta || typeof meta !== "object") return false
  return typeof (meta as { event_name?: unknown }).event_name === "string"
}

function asString(value: unknown) {
  return typeof value === "string" ? value : value == null ? null : String(value)
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function asUrls(value: unknown) {
  if (!value || typeof value !== "object") {
    return {
      customerPortalUrl: null as string | null,
      updatePaymentMethodUrl: null as string | null,
    }
  }
  const urls = value as Record<string, unknown>
  return {
    customerPortalUrl: asString(urls.customer_portal),
    updatePaymentMethodUrl: asString(urls.update_payment_method),
  }
}

export async function storeWebhookEvent(eventName: string, body: unknown) {
  const db = await getDb()
  const id = crypto.randomUUID()

  await db.insert(webhookEvent).values({
    id,
    eventName,
    body: JSON.stringify(body),
    processed: false,
  })

  return id
}

export async function processWebhookEvent(eventId: string) {
  const db = await getDb()
  const rows = await db
    .select()
    .from(webhookEvent)
    .where(eq(webhookEvent.id, eventId))
    .limit(1)

  const event = rows[0]
  if (!event) {
    throw new Error(`Webhook event ${eventId} not found`)
  }

  let processingError = ""

  try {
    const payload = JSON.parse(event.body) as unknown
    if (!hasMeta(payload)) {
      processingError = "Webhook payload missing meta.event_name"
    } else if (payload.meta.event_name.startsWith("subscription_")) {
      await upsertSubscriptionFromWebhook(payload)
    }
  } catch (error) {
    processingError =
      error instanceof Error ? error.message : "Failed to process webhook"
  }

  await db
    .update(webhookEvent)
    .set({
      processed: true,
      processingError: processingError || null,
    })
    .where(eq(webhookEvent.id, eventId))

  if (processingError) {
    throw new Error(processingError)
  }
}

async function upsertSubscriptionFromWebhook(payload: LemonWebhookPayload) {
  const attributes = payload.data.attributes
  const userId = payload.meta.custom_data?.user_id

  if (!userId) {
    throw new Error(
      "Missing custom_data.user_id. Create checkouts with checkoutData.custom.user_id."
    )
  }

  const variantId = asNumber(attributes.variant_id)
  if (variantId == null) {
    throw new Error("Missing variant_id on subscription webhook")
  }

  const urls = asUrls(attributes.urls)
  const values = {
    userId,
    lemonSqueezyId: payload.data.id,
    orderId: asNumber(attributes.order_id),
    customerId: asNumber(attributes.customer_id),
    variantId,
    productId: asNumber(attributes.product_id),
    name: asString(attributes.user_name) ?? "Customer",
    email: asString(attributes.user_email) ?? "",
    status: asString(attributes.status) ?? "unknown",
    statusFormatted: asString(attributes.status_formatted) ?? "Unknown",
    renewsAt: asString(attributes.renews_at),
    endsAt: asString(attributes.ends_at),
    trialEndsAt: asString(attributes.trial_ends_at),
    isPaused: Boolean(attributes.pause),
    customerPortalUrl: urls.customerPortalUrl,
    updatePaymentMethodUrl: urls.updatePaymentMethodUrl,
    updatedAt: new Date(),
  }

  const db = await getDb()
  const existing = await db
    .select({ id: subscription.id })
    .from(subscription)
    .where(eq(subscription.lemonSqueezyId, payload.data.id))
    .limit(1)

  if (existing[0]) {
    await db
      .update(subscription)
      .set(values)
      .where(eq(subscription.lemonSqueezyId, payload.data.id))
    return
  }

  await db.insert(subscription).values({
    id: crypto.randomUUID(),
    ...values,
  })
}
