import { describe, expect, it } from "vitest"
import {
  sortArray,
  sortObjectKeys,
  shuffleArray,
  reverseArray,
  getNestedValue,
} from "../sort-engine"
import { DEFAULT_SORT_KEY } from "../types"

describe("Sort Engine", () => {
  describe("getNestedValue", () => {
    const obj = { user: { profile: { age: 30 } }, name: "Test" }

    it("gets valid path", () => {
      expect(getNestedValue(obj, "name")).toBe("Test")
    })

    it("gets deeply nested path", () => {
      expect(getNestedValue(obj, "user.profile.age")).toBe(30)
    })

    it("returns undefined for missing path", () => {
      expect(getNestedValue(obj, "user.profile.height")).toBeUndefined()
    })

    it("returns undefined for totally invalid path", () => {
      expect(getNestedValue(obj, "invalid.path")).toBeUndefined()
    })
  })

  describe("sortArray", () => {
    it("sort array of objects by string field asc/desc", () => {
      const data = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }]
      
      const asc = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "name", direction: "asc", type: "string" }])
      expect(asc).toEqual([{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }])

      const desc = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "name", direction: "desc", type: "string" }])
      expect(desc).toEqual([{ name: "Charlie" }, { name: "Bob" }, { name: "Alice" }])
    })

    it("sort by nested dot-notation field (user.profile.age)", () => {
      const data = [
        { user: { profile: { age: 40 } } },
        { user: { profile: { age: 20 } } },
        { user: { profile: { age: 30 } } }
      ]
      const asc = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "user.profile.age", direction: "asc", type: "number" }])
      expect(asc).toEqual([
        { user: { profile: { age: 20 } } },
        { user: { profile: { age: 30 } } },
        { user: { profile: { age: 40 } } }
      ])
    })

    it("multi-key sort (primary: department asc, secondary: salary desc)", () => {
      const data = [
        { dept: "IT", salary: 80000 },
        { dept: "HR", salary: 50000 },
        { dept: "IT", salary: 90000 },
        { dept: "HR", salary: 60000 },
      ]
      const sorted = sortArray(data, [
        { ...DEFAULT_SORT_KEY, field: "dept", direction: "asc" },
        { ...DEFAULT_SORT_KEY, field: "salary", direction: "desc", type: "number" }
      ])
      expect(sorted).toEqual([
        { dept: "HR", salary: 60000 },
        { dept: "HR", salary: 50000 },
        { dept: "IT", salary: 90000 },
        { dept: "IT", salary: 80000 },
      ])
    })

    it("null values sort last by default", () => {
      const data = [{ val: null }, { val: 2 }, { val: undefined }, { val: 1 }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "val", direction: "asc", type: "number", nulls: "last" }])
      // Null and undefined go to the end
      expect(sorted[0]).toEqual({ val: 1 })
      expect(sorted[1]).toEqual({ val: 2 })
    })

    it("null values sort first when nulls: 'first'", () => {
      const data = [{ val: null }, { val: 2 }, { val: undefined }, { val: 1 }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "val", direction: "asc", type: "number", nulls: "first" }])
      expect(sorted[2]).toEqual({ val: 1 })
      expect(sorted[3]).toEqual({ val: 2 })
    })

    it("case-insensitive sort", () => {
      const data = [{ v: "Apple" }, { v: "cherry" }, { v: "banana" }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "v", direction: "asc", caseSensitive: false }])
      expect(sorted).toEqual([{ v: "Apple" }, { v: "banana" }, { v: "cherry" }])
    })

    it("case-sensitive sort", () => {
      const data = [{ v: "Apple" }, { v: "cherry" }, { v: "banana" }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "v", direction: "asc", caseSensitive: true }])
      // Uppercase sorts before lowercase in ASCII/Unicode
      expect(sorted).toEqual([{ v: "Apple" }, { v: "banana" }, { v: "cherry" }])
    })

    it("natural sort", () => {
      const data = [{ v: "item10" }, { v: "item2" }, { v: "item1" }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "v", direction: "asc", natural: true }])
      expect(sorted).toEqual([{ v: "item1" }, { v: "item2" }, { v: "item10" }])
    })

    it("locale sort with 'hi' locale", () => {
      // In Hindi, आ (Aa) comes after अ (A), and ई (Ii) comes after इ (I)
      const data = [{ v: "आलस" }, { v: "कमल" }, { v: "अमन" }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "v", direction: "asc", locale: "hi" }])
      expect(sorted).toEqual([{ v: "अमन" }, { v: "आलस" }, { v: "कमल" }])
    })

    it("date sort", () => {
      const data = [{ v: "2023-12-01" }, { v: "2023-01-01" }, { v: "2023-06-01" }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "v", direction: "asc", type: "date" }])
      expect(sorted).toEqual([{ v: "2023-01-01" }, { v: "2023-06-01" }, { v: "2023-12-01" }])
    })

    it("number sort (strings '10', '2', '30')", () => {
      const data = [{ v: "10" }, { v: "30" }, { v: "2" }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "v", direction: "asc", type: "number" }])
      expect(sorted).toEqual([{ v: "2" }, { v: "10" }, { v: "30" }])
    })

    it("boolean sort (false before true asc)", () => {
      const data = [{ v: true }, { v: false }, { v: true }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "v", direction: "asc", type: "boolean" }])
      expect(sorted).toEqual([{ v: false }, { v: true }, { v: true }])
    })

    it("array of primitives", () => {
      const data = ["banana", "cherry", "apple"]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "", direction: "asc" }])
      expect(sorted).toEqual(["apple", "banana", "cherry"])
    })

    it("stability — equal elements preserve original order", () => {
      const data = [
        { id: 1, val: "A" },
        { id: 2, val: "B" },
        { id: 3, val: "A" },
        { id: 4, val: "B" },
      ]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "val", direction: "asc" }])
      expect(sorted).toEqual([
        { id: 1, val: "A" },
        { id: 3, val: "A" },
        { id: 2, val: "B" },
        { id: 4, val: "B" },
      ])
    })

    it("empty array returns empty array", () => {
      expect(sortArray([], [{ ...DEFAULT_SORT_KEY }])).toEqual([])
    })

    it("single-element array returns same element", () => {
      expect(sortArray([{ a: 1 }], [{ ...DEFAULT_SORT_KEY }])).toEqual([{ a: 1 }])
    })

    it("mixed types — numbers and strings in same field (auto coerce)", () => {
      const data = [{ v: "10" }, { v: 2 }, { v: "apple" }]
      const sorted = sortArray(data, [{ ...DEFAULT_SORT_KEY, field: "v", direction: "asc" }])
      // Number 2 and numeric "10" sorted logically before 'apple', string 'apple' after number
      expect(sorted).toEqual([{ v: 2 }, { v: "10" }, { v: "apple" }])
    })
  })

  describe("Other operations", () => {
    it("reverseArray", () => {
      expect(reverseArray([1, 2, 3])).toEqual([3, 2, 1])
    })

    it("shuffleArray returns same elements", () => {
      const data = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray(data)
      expect(shuffled.length).toBe(5)
      expect([...shuffled].sort()).toEqual([1, 2, 3, 4, 5])
    })

    it("sortObjectKeys", () => {
      const obj = { c: 3, a: 1, b: 2 }
      const sorted = sortObjectKeys(obj, "asc")
      expect(Object.keys(sorted)).toEqual(["a", "b", "c"])
      expect(sorted).toEqual({ a: 1, b: 2, c: 3 })
    })
  })
})
