import Link from "next/link"
import { GalleryVerticalEndIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-chart-2/10"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-medium transition-colors hover:text-primary"
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-3.5" />
          </span>
          Acme Inc.
        </Link>
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Log in
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="mb-3 text-sm font-medium text-primary">SaaS starter</p>
        <h1 className="font-heading max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Ship your next product on a theme-ready stack
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted-foreground text-pretty sm:text-lg">
          Auth, billing, and Cloudflare deployment wired in — clone this
          boilerplate and start building.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
          <Link
            href="/app"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Open app
          </Link>
        </div>
      </main>
    </div>
  )
}
