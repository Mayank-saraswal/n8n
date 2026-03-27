import type {
  FilterOperator,
  FilterCondition,
  ConditionGroup,
  FilterOptions,
  ConditionOptions,
  FilterArrayResult,
  FilterObjectResult,
} from "./types"
import { isConditionGroup } from "./types"

// ─── getNestedValue ───────────────────────────────────────────────────────────
// Supports: "user.name", "items[0].sku", "[this]" for primitives
export function getNestedValue(obj: unknown, path: string): unknown {
  if (path === "[this]") return obj
  if (obj === null || obj === undefined) return undefined
  if (!path || typeof path !== "string") return undefined

  // Tokenize path: split by "." but keep array indices attached to the key
  // e.g. "items[0].sku" → ["items[0]", "sku"]
  const tokens = path.split(".")
  let current: unknown = obj

  for (const token of tokens) {
    if (current === null || current === undefined) return undefined

    // Check for array index notation: "items[0]" or "[0]"
    const arrayMatch = token.match(/^([^\[]*)\[(\d+)\]$/)
    if (arrayMatch) {
      const key = arrayMatch[1]
      const idx = parseInt(arrayMatch[2], 10)

      if (key) {
        // "items[0]" → first get "items", then index into it
        const step = (current as Record<string, unknown>)[key]
        if (!Array.isArray(step)) return undefined
        current = step[idx]
      } else {
        // "[0]" alone → index directly
        if (!Array.isArray(current)) return undefined
        current = (current as unknown[])[idx]
      }
    } else {
      // Plain key
      if (typeof current !== "object" || Array.isArray(current)) return undefined
      current = (current as Record<string, unknown>)[token]
    }
  }

  return current
}

// ─── applyOperator ────────────────────────────────────────────────────────────
export function applyOperator(
  actual: unknown,
  operator: FilterOperator,
  expected: string,
  expected2: string,
  options: ConditionOptions
): boolean {
  const { caseSensitive, trimWhitespace, typeCoerce } = options

  // Helper: normalize a string for comparison
  const norm = (v: string): string => {
    let s = v
    if (trimWhitespace) s = s.trim()
    if (!caseSensitive) s = s.toLowerCase()
    return s
  }

  // Helper: normalize actual value to string
  const actualStr = (): string => {
    if (actual === null || actual === undefined) return ""
    const s = String(actual)
    return trimWhitespace ? s.trim() : s
  }

  const actualNorm = (): string => norm(actualStr())

  switch (operator) {
    case "exists":
      return actual !== undefined

    case "not_exists":
      return actual === undefined

    case "is_empty": {
      if (actual === null || actual === undefined) return true
      if (typeof actual === "string") {
        return (trimWhitespace ? actual.trim() : actual) === ""
      }
      if (Array.isArray(actual)) return actual.length === 0
      if (typeof actual === "object") return Object.keys(actual as object).length === 0
      // 0 and false are NOT empty
      return false
    }

    case "is_not_empty":
      return !applyOperator(actual, "is_empty", expected, expected2, options)

    case "is_truthy":
      return !!actual

    case "is_falsy":
      return !actual

    case "equals": {
      if (typeCoerce) {
        // Try numeric comparison first
        const numActual = Number(actual)
        const numExpected = Number(expected)
        if (!isNaN(numActual) && !isNaN(numExpected) && expected.trim() !== "") {
          return numActual === numExpected
        }
        // Boolean coercion
        if (expected === "true" || expected === "false") {
          return Boolean(actual) === (expected === "true")
        }
      }
      return actualNorm() === norm(expected)
    }

    case "not_equals":
      return !applyOperator(actual, "equals", expected, expected2, options)

    case "contains": {
      if (typeof actual === "string") {
        return actualNorm().includes(norm(expected))
      }
      if (Array.isArray(actual)) {
        if (typeCoerce) {
          const numExp = Number(expected)
          if (!isNaN(numExp)) return actual.some((v) => Number(v) === numExp)
        }
        return actual.some((v) =>
          norm(String(v ?? "")) === norm(expected)
        )
      }
      if (actual !== null && typeof actual === "object") {
        return Object.values(actual as object).some(
          (v) => norm(String(v ?? "")) === norm(expected)
        )
      }
      return false
    }

    case "not_contains":
      return !applyOperator(actual, "contains", expected, expected2, options)

    case "starts_with":
      return actualNorm().startsWith(norm(expected))

    case "ends_with":
      return actualNorm().endsWith(norm(expected))

    case "greater_than": {
      const a = Number(actual)
      const e = Number(expected)
      if (!isNaN(a) && !isNaN(e)) return a > e
      // ISO date fallback
      const da = new Date(actualStr())
      const de = new Date(expected)
      if (!isNaN(da.getTime()) && !isNaN(de.getTime())) return da > de
      return false
    }

    case "greater_than_or_equal": {
      const a = Number(actual)
      const e = Number(expected)
      if (!isNaN(a) && !isNaN(e)) return a >= e
      const da = new Date(actualStr())
      const de = new Date(expected)
      if (!isNaN(da.getTime()) && !isNaN(de.getTime())) return da >= de
      return false
    }

    case "less_than": {
      const a = Number(actual)
      const e = Number(expected)
      if (!isNaN(a) && !isNaN(e)) return a < e
      const da = new Date(actualStr())
      const de = new Date(expected)
      if (!isNaN(da.getTime()) && !isNaN(de.getTime())) return da < de
      return false
    }

    case "less_than_or_equal": {
      const a = Number(actual)
      const e = Number(expected)
      if (!isNaN(a) && !isNaN(e)) return a <= e
      const da = new Date(actualStr())
      const de = new Date(expected)
      if (!isNaN(da.getTime()) && !isNaN(de.getTime())) return da <= de
      return false
    }

    case "between": {
      const a = Number(actual)
      const min = Number(expected)
      const max = Number(expected2)
      if (!isNaN(a) && !isNaN(min) && !isNaN(max)) {
        return a >= min && a <= max
      }
      // ISO date fallback
      const da = new Date(actualStr())
      const dmin = new Date(expected)
      const dmax = new Date(expected2)
      if (!isNaN(da.getTime()) && !isNaN(dmin.getTime()) && !isNaN(dmax.getTime())) {
        return da >= dmin && da <= dmax
      }
      return false
    }

    case "regex_match": {
      try {
        const flags = caseSensitive ? "" : "i"
        const regex = new RegExp(expected, flags)
        return regex.test(actualStr())
      } catch {
        // Invalid regex → return false, never throw
        return false
      }
    }

    case "in_array": {
      let candidates: string[] = []
      // Try JSON array first
      const trimmed = expected.trim()
      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed) as unknown[]
          candidates = parsed.map((v) => String(v ?? ""))
        } catch {
          // Fall through to comma-separated
          candidates = expected.split(",").map((s) => s.trim())
        }
      } else {
        candidates = expected.split(",").map((s) => s.trim())
      }
      const actualNormVal = actualNorm()
      return candidates.some((c) => norm(c) === actualNormVal)
    }

    case "not_in_array":
      return !applyOperator(actual, "in_array", expected, expected2, options)

    case "typeof": {
      const expectedType = expected.trim().toLowerCase()
      if (actual === null) return expectedType === "null"
      if (Array.isArray(actual)) return expectedType === "array"
      return typeof actual === expectedType
    }

    default:
      return false
  }
}

// ─── evaluateCondition ────────────────────────────────────────────────────────
export function evaluateCondition(
  item: unknown,
  condition: FilterCondition,
  options: FilterOptions
): boolean {
  const actual = getNestedValue(item, condition.field)

  const condOpts: ConditionOptions = {
    caseSensitive: condition.caseSensitive ?? options.caseSensitive ?? false,
    trimWhitespace: condition.trimWhitespace ?? options.trimWhitespace ?? true,
    typeCoerce: condition.typeCoerce ?? options.typeCoerce ?? true,
  }

  return applyOperator(actual, condition.operator, condition.value, condition.value2, condOpts)
}

// ─── evaluateConditionGroup ───────────────────────────────────────────────────
export function evaluateConditionGroup(
  item: unknown,
  group: ConditionGroup,
  options: FilterOptions
): boolean {
  if (!group.conditions || group.conditions.length === 0) return true

  if (group.logic === "AND") {
    return group.conditions.every((c) => {
      if (isConditionGroup(c)) return evaluateConditionGroup(item, c, options)
      return evaluateCondition(item, c as FilterCondition, options)
    })
  } else {
    // OR
    return group.conditions.some((c) => {
      if (isConditionGroup(c)) return evaluateConditionGroup(item, c, options)
      return evaluateCondition(item, c as FilterCondition, options)
    })
  }
}

// ─── filterArray ─────────────────────────────────────────────────────────────
export function filterArray(
  items: unknown[],
  groups: ConditionGroup[],
  rootLogic: "AND" | "OR",
  options: FilterOptions
): FilterArrayResult {
  const passed: unknown[] = []
  const rejected: unknown[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    let passes: boolean
    if (!groups || groups.length === 0) {
      // No conditions → all pass
      passes = true
    } else if (rootLogic === "AND") {
      passes = groups.every((g) => evaluateConditionGroup(item, g, options))
    } else {
      passes = groups.some((g) => evaluateConditionGroup(item, g, options))
    }

    if (passes) {
      if (options.includeMetadata && typeof item === "object" && item !== null) {
        passed.push({
          ...(item as Record<string, unknown>),
          _filterMeta: { passed: true, index: i },
        })
      } else {
        passed.push(item)
      }
    } else {
      if (options.includeMetadata && typeof item === "object" && item !== null) {
        rejected.push({
          ...(item as Record<string, unknown>),
          _filterMeta: { passed: false, index: i },
        })
      } else {
        rejected.push(item)
      }
    }
  }

  return { passed, rejected }
}

// ─── filterObjectKeys ─────────────────────────────────────────────────────────
export function filterObjectKeys(
  obj: Record<string, unknown>,
  groups: ConditionGroup[],
  rootLogic: "AND" | "OR",
  keepMatching: boolean,
  keyFilterMode: "key_name" | "key_value" | "both"
): FilterObjectResult {
  const result: Record<string, unknown> = {}
  const removedKeys: string[] = []

  const baseOptions: FilterOptions = {
    includeMetadata: false,
    caseSensitive: false,
    trimWhitespace: true,
    typeCoerce: true,
  }

  for (const [key, value] of Object.entries(obj)) {
    // Build a synthetic item depending on the filter mode
    let testItem: unknown
    if (keyFilterMode === "key_name") {
      testItem = key  // test against key name as a primitive
    } else if (keyFilterMode === "key_value") {
      testItem = value  // test against the value
    } else {
      // "both" — test key name; if passes, also test value
      testItem = key
    }

    let matches: boolean
    if (!groups || groups.length === 0) {
      matches = true
    } else if (rootLogic === "AND") {
      matches = groups.every((g) => evaluateConditionGroup(testItem, g, baseOptions))
    } else {
      matches = groups.some((g) => evaluateConditionGroup(testItem, g, baseOptions))
    }

    // For "both" mode, also check value if key matched
    if (keyFilterMode === "both" && matches) {
      if (rootLogic === "AND") {
        matches = groups.every((g) => evaluateConditionGroup(value, g, baseOptions))
      } else {
        matches = groups.some((g) => evaluateConditionGroup(value, g, baseOptions))
      }
    }

    const shouldKeep = keepMatching ? matches : !matches
    if (shouldKeep) {
      result[key] = value
    } else {
      removedKeys.push(key)
    }
  }

  return { result, removedKeys }
}
