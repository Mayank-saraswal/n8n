function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v || v.trim() === "")
    throw new Error(`Missing env: ${key}. Set in .env.local or Vercel settings.`)
  return v
}

export function getGoogleGmailClientId() { return requireEnv("GOOGLE_GMAIL_CLIENT_ID") }
export function getGoogleGmailClientSecret() { return requireEnv("GOOGLE_GMAIL_CLIENT_SECRET") }
export function getNextAuthUrl() { return requireEnv("NEXTAUTH_URL") }
export function getGmailPubsubToken() { return process.env.GMAIL_PUBSUB_VERIFICATION_TOKEN ?? "" }
export function getGmailPubsubTopic() { return process.env.GMAIL_PUBSUB_TOPIC_NAME ?? "" }
