# nextjs-boiler

Clone-ready Next.js boilerplate for SaaS and product apps, deployed with OpenNext on Cloudflare.

## Stack

- Next.js (App Router) + React + TypeScript
- OpenNext (`@opennextjs/cloudflare`) + Wrangler
- Better Auth (email/password + Google)
- Lemon Squeezy (subscriptions / Merchant of Record)
- Cloudflare D1 + Drizzle ORM
- Tailwind CSS v4 + shadcn/ui (Base UI)

See [CHANGELOG.md](./CHANGELOG.md) for recent boilerplate changes.

## Getting started

```bash
npm install
cp .env.example .env
# set BETTER_AUTH_SECRET (openssl rand -base64 32) and BETTER_AUTH_URL
npm run db:migrate:local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Auth

- Login / sign-up: `/login`
- Protected area: `/app`
- Auth API: `/api/auth/*`

Optional Google OAuth: set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and add this redirect URI in Google Cloud Console:

`{BETTER_AUTH_URL}/api/auth/callback/google`

### Billing (Lemon Squeezy)

Per cloned project, create a Lemon Squeezy **store** (+ domain) and set:

- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_VARIANT_ID` (default subscription variant)
- `LEMONSQUEEZY_WEBHOOK_SECRET`

Webhook URL:

`{BETTER_AUTH_URL}/api/webhooks/lemonsqueezy`

Enable at least: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`.

Flow:

1. Signed-in user clicks **Subscribe** on `/app`
2. App creates a checkout with `custom.user_id` = Better Auth user id
3. Lemon Squeezy webhook upserts `subscription` in D1
4. **Manage billing** opens the Lemon Squeezy customer portal

Helpers:

- `userHasActiveSubscription(userId)` in `src/lib/billing.ts`
- `isSubscriptionActive(status)` in `src/lib/subscription-status.ts`

### Database

```bash
npm run db:generate        # create SQL from Drizzle schema
npm run db:migrate:local   # apply to local D1
npm run db:migrate:remote  # apply to remote D1 (after creating a real DB)
```

Before deploy, create a D1 database and replace `database_id` in `wrangler.jsonc`:

```bash
npx wrangler d1 create nextjs-boiler
```

### Cloudflare scripts

```bash
npm run preview   # OpenNext build + local Workers preview
npm run deploy    # OpenNext build + deploy
npm run cf-typegen
```
