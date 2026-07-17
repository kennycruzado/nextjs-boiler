import {
  createCheckout,
  getCustomer,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js"

const REQUIRED_ENV = [
  "LEMONSQUEEZY_API_KEY",
  "LEMONSQUEEZY_STORE_ID",
  "LEMONSQUEEZY_VARIANT_ID",
  "LEMONSQUEEZY_WEBHOOK_SECRET",
] as const

export function isLemonSqueezyConfigured() {
  return REQUIRED_ENV.every((key) => Boolean(process.env[key]?.trim()))
}

export function configureLemonSqueezy() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim())

  if (missing.length > 0) {
    throw new Error(
      `Missing Lemon Squeezy env vars: ${missing.join(", ")}. Copy values from .env.example.`
    )
  }

  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  })
}

export function getAppUrl() {
  return (
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  )
}

export function getDefaultVariantId() {
  const value = process.env.LEMONSQUEEZY_VARIANT_ID?.trim()
  if (!value) {
    throw new Error("LEMONSQUEEZY_VARIANT_ID is not set")
  }
  const variantId = Number(value)
  if (!Number.isFinite(variantId)) {
    throw new Error("LEMONSQUEEZY_VARIANT_ID must be a number")
  }
  return variantId
}

export async function createSubscriptionCheckout({
  userId,
  email,
  name,
  variantId,
}: {
  userId: string
  email: string
  name?: string | null
  variantId?: number
}) {
  configureLemonSqueezy()

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!
  const resolvedVariantId = variantId ?? getDefaultVariantId()
  const appUrl = getAppUrl()

  const checkout = await createCheckout(storeId, resolvedVariantId, {
    checkoutData: {
      email,
      name: name ?? undefined,
      custom: {
        user_id: userId,
      },
    },
    productOptions: {
      enabledVariants: [resolvedVariantId],
      redirectUrl: `${appUrl}/app?checkout=success`,
      receiptButtonText: "Go to app",
      receiptThankYouNote: "Thanks for subscribing!",
    },
  })

  if (checkout.error) {
    throw new Error(checkout.error.message || "Failed to create checkout")
  }

  const url = checkout.data?.data.attributes.url
  if (!url) {
    throw new Error("Checkout URL missing from Lemon Squeezy response")
  }

  return url
}

export async function getCustomerPortalUrl(customerId: number) {
  configureLemonSqueezy()

  const customer = await getCustomer(customerId)
  if (customer.error) {
    throw new Error(customer.error.message || "Failed to load customer")
  }

  const portalUrl = customer.data?.data.attributes.urls?.customer_portal
  if (!portalUrl) {
    throw new Error("Customer portal URL is not available yet")
  }

  return portalUrl
}
