import type { SortKey } from "./types"

// ── Value extraction ──────────────────────────────────────────────────────

/**
 * Extract a nested value from an object using dot notation.
 * Supports: "name", "user.profile.age", "address.city"
 * Returns undefined if any path segment is missing.
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!path || path.trim() === "") return obj
  const parts = path.split(".")
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

// ── Type coercion ─────────────────────────────────────────────────────────

/**
 * Detect and coerce a value to a comparable form based on type hint.
 * Returns a number, string, or boolean for comparison.
 */
export function coerceValue(
  value: unknown,
  typeHint: SortKey["type"]
): number | string | boolean | null {
  if (value === null || value === undefined) return null

  switch (typeHint) {
    case "number": {
      const n = parseFloat(String(value))
      return isNaN(n) ? null : n
    }

    case "date": {
      const d = new Date(value as string | number | Date)
      return isNaN(d.getTime()) ? null : d.getTime()
    }

    case "boolean":
      if (typeof value === "boolean") return value
      if (value === "true" || value === 1) return true
      if (value === "false" || value === 0) return false
      return null

    case "string":
      return String(value)

    case "auto":
    default:
      return autoCoerce(value)
  }
}

function autoCoerce(value: unknown): number | string | boolean | null {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return isNaN(value) ? null : value

  if (typeof value === "string") {
    // Try numeric
    const n = Number(value)
    if (!isNaN(n) && value.trim() !== "") return n

    // Try date — ISO 8601, common date strings
    if (
      /^\d{4}-\d{2}-\d{2}/.test(value) || // ISO date
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(value) // DD/MM/YYYY etc
    ) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d.getTime()
    }

    return value
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.getTime()
  }

  return null
}

// ── Natural sort helper ───────────────────────────────────────────────────

/**
 * Split a string into text/number segments for natural sort.
 * "item10" → ["item", 10], "item2" → ["item", 2]
 */
function naturalSegments(str: string): Array<string | number> {
  return str.split(/(\d+)/).map((seg, i) =>
    i % 2 === 1 ? parseInt(seg, 10) : seg.toLowerCase()
  )
}

function naturalCompare(a: string, b: string): number {
  const segsA = naturalSegments(a)
  const segsB = naturalSegments(b)
  const len = Math.max(segsA.length, segsB.length)
  for (let i = 0; i < len; i++) {
    const sa = segsA[i] ?? ""
    const sb = segsB[i] ?? ""
    if (typeof sa === "number" && typeof sb === "number") {
      if (sa !== sb) return sa - sb
    } else {
      const cmp = String(sa).localeCompare(String(sb))
      if (cmp !== 0) return cmp
    }
  }
  return 0
}

// ── Single key comparator ─────────────────────────────────────────────────

function compareByKey(
  a: unknown,
  b: unknown,
  key: SortKey
): number {
  const rawA = getNestedValue(a, key.field)
  const rawB = getNestedValue(b, key.field)

  // Null handling
  const aIsNull = rawA === null || rawA === undefined
  const bIsNull = rawB === null || rawB === undefined

  if (aIsNull && bIsNull) return 0
  if (aIsNull) return key.nulls === "first" ? -1 : 1
  if (bIsNull) return key.nulls === "first" ? 1 : -1

  // String comparison (locale-aware, case, natural)
  if (
    key.type === "string" ||
    (key.type === "auto" && typeof rawA === "string" && typeof rawB === "string")
  ) {
    const strA = key.caseSensitive ? String(rawA) : String(rawA).toLowerCase()
    const strB = key.caseSensitive ? String(rawB) : String(rawB).toLowerCase()

    if (key.natural) {
      return naturalCompare(strA, strB) * (key.direction === "asc" ? 1 : -1)
    }

    if (key.locale) {
      return strA.localeCompare(strB, key.locale, {
        sensitivity: key.caseSensitive ? "variant" : "base",
        numeric: key.natural,
      }) * (key.direction === "asc" ? 1 : -1)
    }

    const cmp = strA < strB ? -1 : strA > strB ? 1 : 0
    return cmp * (key.direction === "asc" ? 1 : -1)
  }

  // General coercion comparison
  const coercedA = coerceValue(rawA, key.type)
  const coercedB = coerceValue(rawB, key.type)

  if (coercedA === null && coercedB === null) return 0
  if (coercedA === null) return key.nulls === "first" ? -1 : 1
  if (coercedB === null) return key.nulls === "first" ? 1 : -1

  let cmp: number
  if (typeof coercedA === "number" && typeof coercedB === "number") {
    cmp = coercedA - coercedB
  } else if (typeof coercedA === "boolean" && typeof coercedB === "boolean") {
    cmp = (coercedA ? 1 : 0) - (coercedB ? 1 : 0)
  } else {
    const sa = String(coercedA)
    const sb = String(coercedB)
    cmp = sa < sb ? -1 : sa > sb ? 1 : 0
  }

  return cmp * (key.direction === "asc" ? 1 : -1)
}

// ── Multi-key stable sort ─────────────────────────────────────────────────

/**
 * Sort an array by multiple keys with stability.
 * Stability: equal elements preserve their original relative order.
 * Uses Schwartzian transform (index tagging) for guaranteed stability
 * across all JS engines.
 */
export function sortArray(
  arr: unknown[],
  keys: SortKey[]
): unknown[] {
  if (arr.length <= 1) return [...arr]
  if (keys.length === 0) return [...arr]

  // Tag with original index for stable sort
  const tagged = arr.map((item, idx) => ({ item, idx }))

  tagged.sort((a, b) => {
    for (const key of keys) {
      const cmp = compareByKey(a.item, b.item, key)
      if (cmp !== 0) return cmp
    }
    // Equal on all keys — preserve original order (stability)
    return a.idx - b.idx
  })

  return tagged.map(({ item }) => item)
}

// ── Sort object keys ──────────────────────────────────────────────────────

/**
 * Sort the keys of a plain object.
 * Returns a new object with keys in sorted order.
 */
export function sortObjectKeys(
  obj: Record<string, unknown>,
  direction: "asc" | "desc" = "asc",
  locale = ""
): Record<string, unknown> {
  const keys = Object.keys(obj)
  const sorted = locale
    ? keys.sort((a, b) =>
        a.localeCompare(b, locale) * (direction === "asc" ? 1 : -1)
      )
    : keys.sort((a, b) => {
        const cmp = a < b ? -1 : a > b ? 1 : 0
        return cmp * (direction === "asc" ? 1 : -1)
      })

  const result: Record<string, unknown> = {}
  for (const key of sorted) {
    result[key] = obj[key]
  }
  return result
}

// ── Fisher-Yates shuffle ──────────────────────────────────────────────────

/**
 * Cryptographically-seeded Fisher-Yates shuffle.
 * Uses Math.random() — sufficient for automation use cases.
 * Returns a new array, does not mutate input.
 */
export function shuffleArray(arr: unknown[]): unknown[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ── Reverse ───────────────────────────────────────────────────────────────

export function reverseArray(arr: unknown[]): unknown[] {
  return [...arr].reverse()
}
