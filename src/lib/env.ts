function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v || v.trim() === "")
    throw new Error(
      `Missing env: ${key}. Set in .env.local or Vercel project settings.`
    )
  return v
}

function optionalEnv(key: string): string {
  return process.env[key] ?? ""
}

export const GOOGLE_GMAIL_CLIENT_ID = requireEnv("GOOGLE_GMAIL_CLIENT_ID")
export const GOOGLE_GMAIL_CLIENT_SECRET = requireEnv("GOOGLE_GMAIL_CLIENT_SECRET")
export const NEXTAUTH_URL = requireEnv("NEXTAUTH_URL")
export const GMAIL_PUBSUB_VERIFICATION_TOKEN = optionalEnv("GMAIL_PUBSUB_VERIFICATION_TOKEN")
export const GMAIL_PUBSUB_TOPIC_NAME = optionalEnv("GMAIL_PUBSUB_TOPIC_NAME")
