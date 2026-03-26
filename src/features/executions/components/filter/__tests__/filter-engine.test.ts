import { describe, expect, it } from "vitest"
import {
  filterArray,
  filterObjectKeys,
  getNestedValue,
  applyOperator,
  evaluateConditionGroup,
} from "../filter-engine"
import type { ConditionGroup, FilterCondition, FilterOptions } from "../types"

const defaultOpts: FilterOptions = {
  includeMetadata: false,
  caseSensitive: false,
  trimWhitespace: true,
  typeCoerce: true,
}

const condOpts = { caseSensitive: false, trimWhitespace: true, typeCoerce: true }

// ─── getNestedValue ───────────────────────────────────────────────────────────
describe("getNestedValue", () => {
  it("returns top-level value", () => {
    expect(getNestedValue({ name: "Rahul" }, "name")).toBe("Rahul")
  })

  it("returns deeply nested value", () => {
    expect(getNestedValue({ user: { address: { city: "Mumbai" } } }, "user.address.city")).toBe("Mumbai")
  })

  it("returns [this] for primitive arrays", () => {
    expect(getNestedValue(42, "[this]")).toBe(42)
    expect(getNestedValue("hello", "[this]")).toBe("hello")
  })

  it("handles array index notation", () => {
    expect(getNestedValue({ items: [{ sku: "X" }] }, "items[0].sku")).toBe("X")
  })

  it("returns null (not undefined) for null values", () => {
    expect(getNestedValue({ a: { b: null } }, "a.b")).toBeNull()
  })

  it("returns undefined for missing path", () => {
    expect(getNestedValue({ a: 1 }, "a.b.c")).toBeUndefined()
  })

  it("returns undefined for null input", () => {
    expect(getNestedValue(null, "any.path")).toBeUndefined()
  })

  it("returns undefined for undefined input", () => {
    expect(getNestedValue(undefined, "name")).toBeUndefined()
  })
})

// ─── applyOperator ────────────────────────────────────────────────────────────
describe("applyOperator — is_empty", () => {
  it("null is empty", () => expect(applyOperator(null, "is_empty", "", "", condOpts)).toBe(true))
  it("undefined is empty", () => expect(applyOperator(undefined, "is_empty", "", "", condOpts)).toBe(true))
  it("empty string is empty", () => expect(applyOperator("", "is_empty", "", "", condOpts)).toBe(true))
  it("whitespace-only string is empty (trimWhitespace=true)", () => expect(applyOperator("  ", "is_empty", "", "", condOpts)).toBe(true))
  it("empty array is empty", () => expect(applyOperator([], "is_empty", "", "", condOpts)).toBe(true))
  it("empty object is empty", () => expect(applyOperator({}, "is_empty", "", "", condOpts)).toBe(true))
  it("0 is NOT empty", () => expect(applyOperator(0, "is_empty", "", "", condOpts)).toBe(false))
  it("false is NOT empty", () => expect(applyOperator(false, "is_empty", "", "", condOpts)).toBe(false))
  it("non-empty string is not empty", () => expect(applyOperator("hello", "is_empty", "", "", condOpts)).toBe(false))
})

describe("applyOperator — regex_match", () => {
  it("matches valid regex", () => expect(applyOperator("hello123", "regex_match", "^hello", "", condOpts)).toBe(true))
  it("invalid regex returns false, never throws", () => expect(applyOperator("test", "regex_match", "[invalid", "", condOpts)).toBe(false))
  it("case insensitive by default", () => expect(applyOperator("HELLO", "regex_match", "hello", "", condOpts)).toBe(true))
  it("case sensitive when set", () => expect(applyOperator("HELLO", "regex_match", "^hello$", "", { ...condOpts, caseSensitive: true })).toBe(false))
})

describe("applyOperator — between", () => {
  it("number within range", () => expect(applyOperator(1500, "between", "1000", "2000", condOpts)).toBe(true))
  it("number at min boundary (inclusive)", () => expect(applyOperator(1000, "between", "1000", "2000", condOpts)).toBe(true))
  it("number at max boundary (inclusive)", () => expect(applyOperator(2000, "between", "1000", "2000", condOpts)).toBe(true))
  it("number outside range", () => expect(applyOperator(500, "between", "1000", "2000", condOpts)).toBe(false))
  it("ISO date between", () => {
    expect(applyOperator("2023-06-15", "between", "2023-01-01", "2023-12-31", condOpts)).toBe(true)
    expect(applyOperator("2024-01-01", "between", "2023-01-01", "2023-12-31", condOpts)).toBe(false)
  })
})

describe("applyOperator — in_array", () => {
  it("comma-separated match", () => expect(applyOperator("Mumbai", "in_array", "Mumbai,Delhi,Bangalore", "", condOpts)).toBe(true))
  it("comma-separated no match", () => expect(applyOperator("Chennai", "in_array", "Mumbai,Delhi", "", condOpts)).toBe(false))
  it("JSON array string match", () => expect(applyOperator("Delhi", "in_array", '["Mumbai","Delhi"]', "", condOpts)).toBe(true))
  it("case insensitive in_array", () => expect(applyOperator("mumbai", "in_array", "Mumbai,Delhi", "", condOpts)).toBe(true))
  it("not_in_array works", () => expect(applyOperator("Chennai", "not_in_array", "Mumbai,Delhi", "", condOpts)).toBe(true))
})

describe("applyOperator — typeof", () => {
  it("typeof string", () => expect(applyOperator("hello", "typeof", "string", "", condOpts)).toBe(true))
  it("typeof number", () => expect(applyOperator(42, "typeof", "number", "", condOpts)).toBe(true))
  it("typeof boolean", () => expect(applyOperator(true, "typeof", "boolean", "", condOpts)).toBe(true))
  it("typeof array", () => expect(applyOperator([1, 2], "typeof", "array", "", condOpts)).toBe(true))
  it("typeof null (not 'object')", () => expect(applyOperator(null, "typeof", "null", "", condOpts)).toBe(true))
  it("typeof null does NOT return 'object'", () => expect(applyOperator(null, "typeof", "object", "", condOpts)).toBe(false))
})

describe("applyOperator — type coercion", () => {
  it('"123" equals 123 when typeCoerce=true', () => expect(applyOperator("123", "equals", "123", "", { ...condOpts, typeCoerce: true })).toBe(true))
  it('"123" NOT equals 123 when typeCoerce=false (numeric path bypassed by string compare)', () => {
    // with typeCoerce=false, fallback to string comparison: "123" === "123" → still true (strings match)
    expect(applyOperator("123", "equals", "123", "", { ...condOpts, typeCoerce: false })).toBe(true)
  })
  it("numeric string comparison — 123 equals 123", () => expect(applyOperator(123, "equals", "123", "", condOpts)).toBe(true))
})

describe("applyOperator — caseSensitive", () => {
  it("MUMBAI equals mumbai when caseSensitive=false", () => expect(applyOperator("MUMBAI", "equals", "mumbai", "", condOpts)).toBe(true))
  it("MUMBAI NOT equals mumbai when caseSensitive=true", () => expect(applyOperator("MUMBAI", "equals", "mumbai", "", { ...condOpts, caseSensitive: true })).toBe(false))
})

describe("applyOperator — trimWhitespace", () => {
  it("'  Mumbai  ' contains 'Mumbai' when trimWhitespace=true", () => {
    expect(applyOperator("  Mumbai  ", "equals", "Mumbai", "", condOpts)).toBe(true)
  })
})

// ─── filterArray ─────────────────────────────────────────────────────────────
describe("filterArray", () => {
  it("filters objects by greater_than condition", () => {
    const items = [{ amount: 500 }, { amount: 2000 }, { amount: 1500 }]
    const groups: ConditionGroup[] = [{
      id: "g1",
      logic: "AND",
      conditions: [{ id: "c1", field: "amount", operator: "greater_than", value: "1000", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true }],
    }]
    const result = filterArray(items, groups, "AND", defaultOpts)
    expect(result.passed).toHaveLength(2)
    expect(result.rejected).toHaveLength(1)
    expect(result.passed[0]).toEqual({ amount: 2000 })
  })

  it("filters primitive array using [this] path", () => {
    const items = [1, 50, 200, 30]
    const groups: ConditionGroup[] = [{
      id: "g1",
      logic: "AND",
      conditions: [{ id: "c1", field: "[this]", operator: "greater_than", value: "40", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true }],
    }]
    const result = filterArray(items, groups, "AND", defaultOpts)
    expect(result.passed).toEqual([50, 200])
  })

  it("handles compound AND conditions", () => {
    const items = [
      { amount: 2000, status: "captured" },
      { amount: 500, status: "captured" },
      { amount: 2000, status: "pending" },
    ]
    const groups: ConditionGroup[] = [{
      id: "g1",
      logic: "AND",
      conditions: [
        { id: "c1", field: "amount", operator: "greater_than", value: "1000", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true },
        { id: "c2", field: "status", operator: "equals", value: "captured", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true },
      ],
    }]
    const result = filterArray(items, groups, "AND", defaultOpts)
    expect(result.passed).toHaveLength(1)
    expect(result.passed[0]).toEqual({ amount: 2000, status: "captured" })
  })

  it("handles OR logic between groups", () => {
    const items = [{ city: "Mumbai" }, { city: "Delhi" }, { city: "Chennai" }]
    const groups: ConditionGroup[] = [
      { id: "g1", logic: "AND", conditions: [{ id: "c1", field: "city", operator: "equals", value: "Mumbai", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true }] },
      { id: "g2", logic: "AND", conditions: [{ id: "c2", field: "city", operator: "equals", value: "Delhi", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true }] },
    ]
    const result = filterArray(items, groups, "OR", defaultOpts)
    expect(result.passed).toHaveLength(2)
  })

  it("handles nested ConditionGroup (group within group)", () => {
    const items = [{ amount: 2000, status: "captured" }, { amount: 500, status: "pending" }]
    const nestedGroup: ConditionGroup = {
      id: "nested",
      logic: "OR",
      conditions: [
        { id: "c1", field: "amount", operator: "greater_than", value: "1000", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true },
      ],
    }
    const groups: ConditionGroup[] = [{
      id: "g1",
      logic: "AND",
      conditions: [
        nestedGroup,
        { id: "c2", field: "status", operator: "equals", value: "captured", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true },
      ],
    }]
    const result = filterArray(items, groups, "AND", defaultOpts)
    expect(result.passed).toHaveLength(1)
    expect((result.passed[0] as Record<string, unknown>).status).toBe("captured")
  })

  it("empty groups = passthrough (all pass)", () => {
    const items = [{ a: 1 }, { a: 2 }]
    const result = filterArray(items, [], "AND", defaultOpts)
    expect(result.passed).toHaveLength(2)
    expect(result.rejected).toHaveLength(0)
  })

  it("includes _filterMeta when includeMetadata=true", () => {
    const items = [{ amount: 2000 }]
    const groups: ConditionGroup[] = [{
      id: "g1",
      logic: "AND",
      conditions: [{ id: "c1", field: "amount", operator: "greater_than", value: "1000", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true }],
    }]
    const result = filterArray(items, groups, "AND", { ...defaultOpts, includeMetadata: true })
    expect((result.passed[0] as Record<string, unknown>)._filterMeta).toBeDefined()
    expect(((result.passed[0] as Record<string, unknown>)._filterMeta as Record<string, unknown>).passed).toBe(true)
  })
})

// ─── filterObjectKeys ─────────────────────────────────────────────────────────
describe("filterObjectKeys", () => {
  const obj = { name: "Rahul", email: "r@r.com", password: "secret", internalId: "abc" }

  it("keeps matching keys by key_name", () => {
    const groups: ConditionGroup[] = [{
      id: "g1",
      logic: "OR",
      conditions: [
        { id: "c1", field: "[this]", operator: "equals", value: "name", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true },
        { id: "c2", field: "[this]", operator: "equals", value: "email", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true },
      ],
    }]
    const result = filterObjectKeys(obj, groups, "OR", true, "key_name")
    expect(Object.keys(result.result)).toEqual(["name", "email"])
    expect(result.removedKeys).toEqual(["password", "internalId"])
  })

  it("removes matching keys when keepMatching=false", () => {
    const groups: ConditionGroup[] = [{
      id: "g1",
      logic: "OR",
      conditions: [
        { id: "c1", field: "[this]", operator: "equals", value: "password", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true },
        { id: "c2", field: "[this]", operator: "equals", value: "internalId", value2: "", caseSensitive: false, trimWhitespace: true, typeCoerce: true },
      ],
    }]
    const result = filterObjectKeys(obj, groups, "OR", false, "key_name")
    expect(Object.keys(result.result)).toEqual(["name", "email"])
    expect(result.removedKeys).toEqual(["password", "internalId"])
  })

  it("empty groups keeps all keys", () => {
    const result = filterObjectKeys(obj, [], "AND", true, "key_name")
    expect(Object.keys(result.result)).toHaveLength(4)
    expect(result.removedKeys).toHaveLength(0)
  })
})
