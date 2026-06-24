import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { getAuthUrl } from "@/lib/auth/env"
import {
  decodeOAuthState,
  exchangeGoogleCode,
  getGoogleUserInfo,
} from "@/lib/auth/google"
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session"

const OAUTH_NONCE_COOKIE = "oauth_nonce"

function redirectAfterAuth({
  popup,
  error,
}: {
  popup: boolean
  error?: string
}) {
  const baseUrl = getAuthUrl()

  if (popup) {
    const url = new URL("/auth/google/complete", baseUrl)
    if (error) {
      url.searchParams.set("error", error)
    }
    return NextResponse.redirect(url)
  }

  if (error) {
    return NextResponse.redirect(new URL("/login", baseUrl))
  }

  return NextResponse.redirect(new URL("/app", baseUrl))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const oauthError = searchParams.get("error")
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")
  const state = stateParam ? decodeOAuthState(stateParam) : null
  const popup = state?.popup ?? false

  if (oauthError || !code || !state) {
    return redirectAfterAuth({ popup, error: oauthError ?? "invalid_request" })
  }

  const cookieStore = await cookies()
  const storedNonce = cookieStore.get(OAUTH_NONCE_COOKIE)?.value
  cookieStore.delete(OAUTH_NONCE_COOKIE)

  if (!storedNonce || storedNonce !== state.nonce) {
    return redirectAfterAuth({ popup, error: "invalid_state" })
  }

  try {
    const tokens = await exchangeGoogleCode(code)
    const user = await getGoogleUserInfo(tokens.access_token)
    const sessionToken = await createSessionToken(user)
    const response = redirectAfterAuth({ popup })
    response.cookies.set(sessionCookieOptions(sessionToken))
    return response
  } catch {
    return redirectAfterAuth({ popup, error: "authentication_failed" })
  }
}
