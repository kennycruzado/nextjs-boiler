import { desc, eq } from "drizzle-orm"

import { getDb } from "@/db"
import { subscription } from "@/db/schema"
import { isSubscriptionActive } from "@/lib/subscription-status"

export async function getUserSubscription(userId: string) {
  const db = await getDb()
  const rows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .orderBy(desc(subscription.updatedAt))
    .limit(1)

  return rows[0] ?? null
}

export async function userHasActiveSubscription(userId: string) {
  const current = await getUserSubscription(userId)
  return isSubscriptionActive(current?.status)
}
