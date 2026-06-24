import { getAuthUrl, getGoogleClientId, getGoogleClientSecret } from "@/lib/auth/env"
import type { SessionUser } from "@/lib/auth/session"

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

export type OAuthState = {
  nonce: string
  popup: boolean
}

export function createOAuthNonce() {
  return crypto.randomUUID()
}

export function encodeOAuthState(state: OAuthState) {
  const json = JSON.stringify(state)
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export function decodeOAuthState(value: string): OAuthState | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json) as OAuthState
    if (typeof parsed.nonce !== "string" || typeof parsed.popup !== "boolean") {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function getGoogleRedirectUri() {
  return `${getAuthUrl()}/api/auth/google/callback`
}

export function buildGoogleAuthUrl({
  state,
}: {
  state: string
}) {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

type GoogleTokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  id_token?: string
}

type GoogleUserInfo = {
  sub: string
  email: string
  name: string
  picture?: string
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to exchange Google authorization code")
  }

  return (await response.json()) as GoogleTokenResponse
}

export async function getGoogleUserInfo(
  accessToken: string
): Promise<SessionUser> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Google user profile")
  }

  const user = (await response.json()) as GoogleUserInfo
  return {
    sub: user.sub,
    email: user.email,
    name: user.name,
    picture: user.picture,
  }
}
