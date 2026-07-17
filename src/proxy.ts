import { getSessionCookie } from "better-auth/cookies"
import { NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/app") && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (pathname === "/login" && sessionCookie) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/login"],
}
