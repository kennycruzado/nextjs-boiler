/** Statuses that should grant paid access in the app. */
export function isSubscriptionActive(status: string | null | undefined) {
  if (!status) return false
  return ["active", "on_trial", "paused", "past_due"].includes(status)
}
