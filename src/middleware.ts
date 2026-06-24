import { NextRequest, NextResponse } from "next/server"

import { getSessionFromRequest } from "@/lib/auth/session"

export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request)

  if (request.nextUrl.pathname.startsWith("/app") && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (request.nextUrl.pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/login"],
}
