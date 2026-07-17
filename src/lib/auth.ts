import { getCloudflareContext } from "@opennextjs/cloudflare"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"
import { cache } from "react"

import * as schema from "@/db/schema"

type AuthDatabase = DrizzleD1Database<typeof schema>

function createAuth(db: AuthDatabase) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      ...(googleClientId && googleClientSecret
        ? {
            google: {
              prompt: "select_account" as const,
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {}),
    },
    plugins: [nextCookies()],
  })
}

/**
 * Request-scoped Better Auth instance backed by Cloudflare D1.
 * Use this at runtime (route handlers, server components, server actions).
 */
export const getAuth = cache(async () => {
  const { env } = await getCloudflareContext({ async: true })
  const db = drizzle(env.DB, { schema })
  return createAuth(db)
})

/**
 * Static export for the Better Auth CLI (`npx auth generate`).
 * Not used at runtime — prefer `getAuth()`.
 */
export const auth = createAuth({} as AuthDatabase)
