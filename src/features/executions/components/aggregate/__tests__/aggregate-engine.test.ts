import { describe, expect, test } from "vitest"
import {
  extractNumericValues,
  computeSum,
  computeAverage,
  computeMin,
  computeMax,
  computeMedian,
  computeMode,
  computeStdDev,
  computePercentile,
  computeDistinct,
  computeConcatenate,
  groupBy,
  computeFrequencyDistribution,
} from "../aggregate-engine"

describe("aggregate-engine", () => {
  const sampleData = [
    { id: 1, amount: 10, category: "A", status: "active", nested: { score: 100 } },
    { id: 2, amount: 20, category: "A", status: "pending", nested: { score: null } },
    { id: 3, amount: 30, category: "B", status: "active", nested: { score: 200 } },
    { id: 4, amount: 30, category: "C", status: "inactive" },
    { id: 5, amount: null, category: "A", status: "active", nested: { score: 300 } },
  ]

  const primitives = [10, 20, 30, 30, null]

  test("extractNumericValues", () => {
    // exclude nulls
    expect(extractNumericValues(sampleData, "amount", "exclude")).toEqual([10, 20, 30, 30])
    expect(extractNumericValues(primitives, "[this]", "exclude")).toEqual([10, 20, 30, 30])
    // nulls as 0
    expect(extractNumericValues(sampleData, "amount", "include_as_zero")).toEqual([10, 20, 30, 30, 0])
    // nested
    expect(extractNumericValues(sampleData, "nested.score", "exclude")).toEqual([100, 200, 300])
  })

  test("computeSum", () => {
    expect(computeSum([10, 20, 30, 30])).toBe(90)
    expect(computeSum([])).toBe(0)
  })

  test("computeAverage", () => {
    expect(computeAverage([10, 20, 30, 30])).toBe(22.5)
    expect(computeAverage([])).toBeNull()
  })

  test("computeMin", () => {
    expect(computeMin([10, 20, 30, 30])).toBe(10)
    expect(computeMin([])).toBeNull()
  })

  test("computeMax", () => {
    expect(computeMax([10, 20, 30, 30])).toBe(30)
    expect(computeMax([])).toBeNull()
  })

  test("computeMedian", () => {
    expect(computeMedian([10, 20, 30])).toBe(20)
    expect(computeMedian([10, 20, 30, 40])).toBe(25)
    expect(computeMedian([])).toBeNull()
  })

  test("computeMode", () => {
    const res = computeMode([10, 20, 30, 30])
    expect(res.value).toBe(30)
    expect(res.count).toBe(2)
    expect(res.allModes).toEqual([30])

    const resMulti = computeMode([10, 10, 20, 20, 30])
    expect(resMulti.value).toBe(10) // first mode
    expect(resMulti.count).toBe(2)
    expect(resMulti.allModes).toEqual([10, 20])
  })

  test("computeStdDev", () => {
    const resSample = computeStdDev([10, 20, 30, 40], true)
    expect(resSample).toBeCloseTo(12.9099)
    
    const resPop = computeStdDev([10, 20, 30, 40], false)
    expect(resPop).toBeCloseTo(11.1803)
  })

  test("computePercentile", () => {
    const data = [15, 20, 35, 40, 50]
    expect(computePercentile(data, 0)).toBe(15)
    expect(computePercentile(data, 100)).toBe(50)
    expect(computePercentile(data, 50)).toBe(35)
    expect(computePercentile(data, 40)).toBe(29)
  })

  test("computeDistinct", () => {
    expect(computeDistinct(sampleData, "category")).toEqual(["A", "B", "C"])
    expect(computeDistinct(sampleData, "status")).toEqual(["active", "pending", "inactive"])
  })

  test("computeConcatenate", () => {
    expect(computeConcatenate(sampleData, "category", ", ")).toBe("A, A, B, C, A")
  })

  test("groupBy", () => {
    const groups = groupBy(sampleData, "category")
    expect(Object.keys(groups)).toEqual(["A", "B", "C"])
    expect(groups["A"]).toHaveLength(3)
    expect(groups["B"]).toHaveLength(1)
    expect(groups["C"]).toHaveLength(1)
  })

  test("computeFrequencyDistribution", () => {
    const freqDesc = computeFrequencyDistribution(sampleData, "category", true, 0)
    expect(freqDesc).toEqual([
      { value: "A", count: 3, percentage: "60%" },
      { value: "B", count: 1, percentage: "20%" },
      { value: "C", count: 1, percentage: "20%" },
    ])

    const freqTop1 = computeFrequencyDistribution(sampleData, "category", true, 1)
    expect(freqTop1).toHaveLength(1)
    expect(freqTop1[0].value).toBe("A")
  })
})
