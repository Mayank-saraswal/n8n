/**
 * Pure merge strategy functions for the Merge node.
 * No Prisma, no Inngest, no side effects — fully testable in isolation.
 */

type Item = Record<string, unknown>

/**
 * Get a nested value from an object using a dot-path string.
 * e.g. getNestedValue({ order: { id: "123" } }, "order.id") → "123"
 */
export function getNestedValue(obj: Item, path: string): unknown {
  if (!path.trim()) return obj
  return path.split(".").reduce((current: unknown, key: string) => {
    if (current === null || current === undefined) return undefined
    if (typeof current !== "object") return undefined
    return (current as Item)[key]
  }, obj as unknown)
}

/**
 * Ensure a value is an array of items.
 * If already an array, return as-is.
 * If a plain object, wrap in a single-element array.
 * Otherwise return empty array.
 */
function toItemArray(value: unknown): Item[] {
  if (Array.isArray(value)) return value as Item[]
  if (value !== null && typeof value === "object") return [value as Item]
  return []
}

/**
 * MODE 1: Merge by Position (Zip)
 *
 * Combines item[i] from branch1 with item[i] from branch2.
 * positionFill: "shortest" — zip to shortest branch length
 * positionFill: "longest"  — pad shorter branches with null
 */
export function mergeByPosition(
  branches: unknown[],
  positionFill: "shortest" | "longest" = "shortest"
): Item[] {
  const arrays = branches.map(toItemArray)
  if (arrays.length === 0) return []

  const lengths = arrays.map((a) => a.length)
  const targetLength =
    positionFill === "shortest"
      ? Math.min(...lengths)
      : Math.max(...lengths)

  const result: Item[] = []
  for (let i = 0; i < targetLength; i++) {
    const merged: Item = {}
    for (let b = 0; b < arrays.length; b++) {
      const item = arrays[b][i]
      if (item !== undefined && item !== null) {
        Object.assign(merged, item)
      }
    }
    result.push(merged)
  }
  return result
}

/**
 * MODE 2: Combine All (Cross Join / Cartesian Product)
 *
 * Every item from branch1 paired with every item from branch2, etc.
 * Output: branch1.length × branch2.length × ... items
 */
export function crossJoin(branches: unknown[]): Item[] {
  const arrays = branches.map(toItemArray)
  if (arrays.length === 0) return []
  if (arrays.some((a) => a.length === 0)) return []

  // Start with the first array and cross-join each subsequent array
  let result: Item[] = arrays[0].map((item) => ({ ...item }))

  for (let b = 1; b < arrays.length; b++) {
    const nextResult: Item[] = []
    for (const existing of result) {
      for (const item of arrays[b]) {
        nextResult.push({ ...existing, ...item })
      }
    }
    result = nextResult
  }

  return result
}

/**
 * MODE 3: Keep Key Matches (Inner Join)
 *
 * Match items from branch1 and branch2 by key fields.
 * Returns only items where the key exists in BOTH branches.
 */
export function keyMatch(
  branch1: unknown,
  branch2: unknown,
  key1: string,
  key2: string
): Item[] {
  const arr1 = toItemArray(branch1)
  const arr2 = toItemArray(branch2)

  if (!key1 || !key2) return []

  // Build a lookup map from branch2 keyed by the match field
  const lookup = new Map<string, Item[]>()
  for (const item of arr2) {
    const keyVal = String(getNestedValue(item, key2) ?? "")
    if (!lookup.has(keyVal)) lookup.set(keyVal, [])
    lookup.get(keyVal)!.push(item)
  }

  const result: Item[] = []
  for (const item1 of arr1) {
    const keyVal = String(getNestedValue(item1, key1) ?? "")
    const matches = lookup.get(keyVal)
    if (matches) {
      for (const item2 of matches) {
        result.push({ ...item1, ...item2 })
      }
    }
  }

  return result
}

/**
 * MODE 4: Keep Non-Matches (Outer Difference)
 *
 * Items from branch1 that have NO match in branch2 by key field.
 */
export function keyDiff(
  branch1: unknown,
  branch2: unknown,
  key1: string,
  key2: string
): Item[] {
  const arr1 = toItemArray(branch1)
  const arr2 = toItemArray(branch2)

  if (!key1 || !key2) return arr1

  // Build a set of key values from branch2
  const branch2Keys = new Set<string>()
  for (const item of arr2) {
    branch2Keys.add(String(getNestedValue(item, key2) ?? ""))
  }

  return arr1.filter((item) => {
    const keyVal = String(getNestedValue(item, key1) ?? "")
    return !branch2Keys.has(keyVal)
  })
}

/**
 * MODE: Combine (default) — merge all branch contexts into one object.
 * Simply spreads all branch data together.
 */
export function combineAll(branches: unknown[]): Item {
  const result: Item = {}
  for (const branch of branches) {
    if (branch !== null && typeof branch === "object" && !Array.isArray(branch)) {
      Object.assign(result, branch)
    }
  }
  return result
}
