import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import {
  buildGoogleAuthUrl,
  createOAuthNonce,
  encodeOAuthState,
} from "@/lib/auth/google"

const OAUTH_NONCE_COOKIE = "oauth_nonce"

export async function GET(request: NextRequest) {
  try {
    const popup = request.nextUrl.searchParams.get("popup") === "1"
    const nonce = createOAuthNonce()
    const state = encodeOAuthState({ nonce, popup })

    const cookieStore = await cookies()
    cookieStore.set(OAUTH_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    })

    return NextResponse.redirect(buildGoogleAuthUrl({ state }))
  } catch {
    return NextResponse.json(
      { error: "Google OAuth is not configured" },
      { status: 500 }
    )
  }
}
