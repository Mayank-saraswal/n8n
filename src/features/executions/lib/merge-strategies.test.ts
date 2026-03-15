import { describe, it, expect } from "vitest"
import {
  combineAll,
  mergeByPosition,
  crossJoin,
  keyMatch,
  keyDiff,
  getNestedValue,
} from "./merge-strategies"

describe("merge-strategies", () => {
  describe("combineAll", () => {
    it("merges multiple branch objects into one flat object", () => {
      const result = combineAll([{ a: 1, b: 2 }, { c: 3, d: 4 }])
      expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 })
    })

    it("handles key collision by last-write-wins", () => {
      const result = combineAll([
        { id: 1, name: "Alice" },
        { id: 2, email: "b@b.com" },
      ])
      // combineAll uses Object.assign — last branch wins on collision
      expect(result).toEqual({ id: 2, name: "Alice", email: "b@b.com" })
    })

    it("ignores non-object values (arrays, null, primitives)", () => {
      const result = combineAll([{ a: 1 }, null, [1, 2, 3], "string", { b: 2 }])
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it("returns empty object for empty input", () => {
      expect(combineAll([])).toEqual({})
    })
  })

  describe("mergeByPosition", () => {
    it("zips to shortest branch with fill=shortest", () => {
      const branch1 = [{ val: 1 }, { val: 2 }, { val: 3 }]
      const branch2 = [{ label: "a" }, { label: "b" }]
      const result = mergeByPosition([branch1, branch2], "shortest")
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ val: 1, label: "a" })
      expect(result[1]).toEqual({ val: 2, label: "b" })
    })

    it("pads shorter branches with longest fill", () => {
      const branch1 = [{ val: 1 }, { val: 2 }, { val: 3 }]
      const branch2 = [{ label: "a" }, { label: "b" }]
      const result = mergeByPosition([branch1, branch2], "longest")
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ val: 1, label: "a" })
      expect(result[1]).toEqual({ val: 2, label: "b" })
      // Third item only has branch1 data since branch2 is exhausted
      expect(result[2]).toEqual({ val: 3 })
    })

    it("returns empty array for empty input", () => {
      expect(mergeByPosition([])).toEqual([])
    })

    it("wraps plain objects into single-element arrays", () => {
      const result = mergeByPosition([{ x: 1 }, { y: 2 }], "shortest")
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ x: 1, y: 2 })
    })
  })

  describe("crossJoin", () => {
    it("produces cartesian product of two branches", () => {
      const branch1 = [{ name: "Alice" }, { name: "Bob" }]
      const branch2 = [{ product: "A" }, { product: "B" }]
      const result = crossJoin([branch1, branch2])

      expect(result).toHaveLength(4) // 2 × 2
      expect(result).toContainEqual({ name: "Alice", product: "A" })
      expect(result).toContainEqual({ name: "Alice", product: "B" })
      expect(result).toContainEqual({ name: "Bob", product: "A" })
      expect(result).toContainEqual({ name: "Bob", product: "B" })
    })

    it("returns empty array when any branch is empty", () => {
      const result = crossJoin([[{ a: 1 }], []])
      expect(result).toEqual([])
    })

    it("handles three-way cross join", () => {
      const result = crossJoin([
        [{ a: 1 }],
        [{ b: 2 }],
        [{ c: 3 }, { c: 4 }],
      ])
      expect(result).toHaveLength(2) // 1 × 1 × 2
      expect(result[0]).toEqual({ a: 1, b: 2, c: 3 })
      expect(result[1]).toEqual({ a: 1, b: 2, c: 4 })
    })
  })

  describe("keyMatch (inner join)", () => {
    it("joins items matching by key field", () => {
      const branch1 = [
        { orderId: "1", amount: 100 },
        { orderId: "2", amount: 200 },
      ]
      const branch2 = [
        { id: "1", customer: "Alice" },
        { id: "3", customer: "Bob" },
      ]
      const result = keyMatch(branch1, branch2, "orderId", "id")

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        orderId: "1",
        amount: 100,
        id: "1",
        customer: "Alice",
      })
    })

    it("returns empty array when no keys match", () => {
      const branch1 = [{ key: "x" }]
      const branch2 = [{ key: "y" }]
      const result = keyMatch(branch1, branch2, "key", "key")
      expect(result).toEqual([])
    })

    it("returns empty array when key fields are empty", () => {
      const result = keyMatch([{ a: 1 }], [{ b: 2 }], "", "")
      expect(result).toEqual([])
    })

    it("handles multiple matches for the same key", () => {
      const branch1 = [{ type: "A", val: 1 }]
      const branch2 = [
        { type: "A", label: "first" },
        { type: "A", label: "second" },
      ]
      const result = keyMatch(branch1, branch2, "type", "type")
      expect(result).toHaveLength(2)
    })
  })

  describe("keyDiff (outer difference)", () => {
    it("returns items from branch1 with no match in branch2", () => {
      const branch1 = [
        { orderId: "1", amount: 100 },
        { orderId: "2", amount: 200 },
      ]
      const branch2 = [
        { id: "1", customer: "Alice" },
        { id: "3", customer: "Bob" },
      ]
      const result = keyDiff(branch1, branch2, "orderId", "id")

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ orderId: "2", amount: 200 })
    })

    it("returns all items when none match", () => {
      const branch1 = [{ key: "a" }, { key: "b" }]
      const branch2 = [{ key: "c" }]
      const result = keyDiff(branch1, branch2, "key", "key")
      expect(result).toHaveLength(2)
    })

    it("returns empty when all items match", () => {
      const branch1 = [{ key: "a" }]
      const branch2 = [{ key: "a" }]
      const result = keyDiff(branch1, branch2, "key", "key")
      expect(result).toEqual([])
    })

    it("returns all branch1 items when keys are empty", () => {
      const branch1 = [{ a: 1 }, { b: 2 }]
      const result = keyDiff(branch1, [{ c: 3 }], "", "")
      expect(result).toHaveLength(2)
    })
  })

  describe("getNestedValue", () => {
    it("resolves deep dot-notation paths", () => {
      const obj = { order: { customer: { email: "a@a.com" } } }
      expect(getNestedValue(obj, "order.customer.email")).toBe("a@a.com")
    })

    it("returns undefined for non-existent paths", () => {
      const obj = { a: { b: 1 } }
      expect(getNestedValue(obj, "a.c.d")).toBeUndefined()
    })

    it("returns the whole object for empty path", () => {
      const obj = { x: 1 }
      expect(getNestedValue(obj, "")).toEqual({ x: 1 })
    })

    it("handles top-level keys", () => {
      expect(getNestedValue({ name: "Alice" }, "name")).toBe("Alice")
    })
  })
})
