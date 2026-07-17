import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"

import { cn } from "@/lib/utils"

import "./globals.css"

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Acme Inc.",
  description: "Next.js SaaS boilerplate with Better Auth and Lemon Squeezy",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
              "h-full antialiased font-sans",
              geistMono.variable
            , "font-sans", inter.variable)}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
