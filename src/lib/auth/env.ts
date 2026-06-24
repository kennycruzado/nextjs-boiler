function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getAuthUrl(): string {
  return requireEnv("AUTH_URL").replace(/\/$/, "")
}

export function getGoogleClientId(): string {
  return requireEnv("GOOGLE_CLIENT_ID")
}

export function getGoogleClientSecret(): string {
  return requireEnv("GOOGLE_CLIENT_SECRET")
}

export function getAuthSecret(): string {
  return requireEnv("AUTH_SECRET")
}
