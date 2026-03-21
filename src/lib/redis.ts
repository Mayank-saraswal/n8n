import { Redis } from "@upstash/redis"

// Lazy singleton — only instantiated when first used
let _redis: Redis | null = null

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      throw new Error(
        "Redis not configured. Set UPSTASH_REDIS_REST_URL and " +
        "UPSTASH_REDIS_REST_TOKEN in environment variables."
      )
    }

    _redis = new Redis({ url, token })
  }
  return _redis
}

/**
 * Attempt to claim an idempotency key.
 *
 * Returns true if the key was newly set (first delivery — process it).
 * Returns false if the key already existed (duplicate — discard it).
 *
 * @param key - Unique identifier for this event (e.g. "razorpay:evt_xyz")
 * @param ttlSeconds - How long to remember this key (default: 86400 = 24h)
 */
export async function claimIdempotencyKey(
  key: string,
  ttlSeconds = 86400
): Promise<boolean> {
  try {
    const redis = getRedis()
    
    // SET key "1" NX EX ttl — atomic, returns "OK" if set, null if already exists
    const result = await redis.set(key, "1", {
      nx: true,    // only set if not exists
      ex: ttlSeconds,
    })

    return result === "OK"
  } catch (err) {
    // Redis unavailable — log and allow processing (fail open)
    console.error(
      `[Redis] claimIdempotencyKey failed for key ${key}. ` +
      `Processing event without deduplication. Error:`, err
    )
    return true  // Treat as first delivery to avoid dropping events
  }
}

/**
 * Release an idempotency key (called if processing fails and should be retried).
 * Use sparingly — only for genuine processing failures, not signature errors.
 */
export async function releaseIdempotencyKey(key: string): Promise<void> {
  try {
    const redis = getRedis()
    await redis.del(key)
  } catch (err) {
    console.error(`[Redis] releaseIdempotencyKey failed for key ${key}. Error:`, err)
  }
}
