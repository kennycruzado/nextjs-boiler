# Changelog

All notable changes to this boilerplate are documented here.

## [0.3.1] — 2026-07-16

### Fixed

- Replaced leftover create-next-app home page (`/`) hard-coded zinc/black/white colors with theme tokens (`background`, `foreground`, `primary`, `muted`)
- Aligned `--secondary` / `--muted` / `--accent` hues with the warm primary (removed purple-tinted defaults)
- Unified root fonts to Geist only (removed Inter + dual Geist-sans clash)
- Applied `bg-background text-foreground` on `body` so all pages inherit the theme

## [0.3.0] — 2026-07-16

### Added

- **Lemon Squeezy** billing integration for SaaS subscriptions
  - Official SDK (`@lemonsqueezy/lemonsqueezy.js`)
  - Checkout API: `POST /api/billing/checkout` (passes Better Auth `user_id` as checkout custom data)
  - Customer portal API: `POST /api/billing/portal`
  - Signed webhook endpoint: `POST /api/webhooks/lemonsqueezy`
  - D1 tables: `subscription`, `webhook_event`
  - Billing UI on `/app` (Subscribe / Manage billing)
  - Helpers: `getUserSubscription`, `userHasActiveSubscription`, `isSubscriptionActive`
- Env template entries for store/variant/API/webhook secret

### Notes for clones

1. Create a Lemon Squeezy store (+ domain) per project
2. Create a subscription product/variant and set `LEMONSQUEEZY_VARIANT_ID`
3. Point a webhook at `{BETTER_AUTH_URL}/api/webhooks/lemonsqueezy`
4. Run `npm run db:migrate:local` (or remote) after pulling

## [0.2.0] — 2026-07-16

### Added

- **Better Auth** as the authentication layer (`better-auth`)
  - Email/password sign-up and sign-in wired through the login UI
  - Google social sign-in via Better Auth (redirect flow)
  - Typed React client (`src/lib/auth-client.ts`)
  - Catch-all API handler at `/api/auth/[...all]`
- **Cloudflare D1** database binding for persistent users and sessions
- **Drizzle ORM** schema + migrations for Better Auth core tables (`user`, `session`, `account`, `verification`)
- Local/remote migration scripts: `db:generate`, `db:migrate:local`, `db:migrate:remote`
- Protected `/app` page that reads the Better Auth session and supports sign-out
- Committed `cloudflare-env.d.ts` so clones get binding types without running typegen first

### Changed

- Login form is now a working client form (login ↔ sign-up) instead of static markup
- Google button uses `authClient.signIn.social({ provider: "google" })`
- Route protection in `proxy.ts` uses Better Auth session cookie checks
- Env vars migrated to Better Auth conventions:
  - `BETTER_AUTH_SECRET` (replaces `AUTH_SECRET`)
  - `BETTER_AUTH_URL` (replaces `AUTH_URL`)
  - Google redirect URI is now `{BETTER_AUTH_URL}/api/auth/callback/google`
- `next.config.ts` initializes OpenNext Cloudflare for local binding access via `initOpenNextCloudflareForDev()`

### Removed

- Custom Google OAuth implementation (`src/lib/auth/google.ts`, `/api/auth/google/*`)
- Custom JWT session helpers built on `jose` (`src/lib/auth/session.ts`)
- Auth env helpers (`src/lib/auth/env.ts`)
- Popup OAuth complete pages (`/auth/google/complete`)
- `jose` dependency

### Migration notes for clones

1. Copy `.env.example` → `.env` and set `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`
2. Optionally set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and update Google redirect URIs
3. Apply local schema: `npm run db:migrate:local`
4. Before Cloudflare deploy, create a real D1 database and replace `database_id` in `wrangler.jsonc`, then run `npm run db:migrate:remote`
