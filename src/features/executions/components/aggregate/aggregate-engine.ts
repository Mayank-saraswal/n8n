import type { AggregateOp, NullHandling, PivotConfig } from "./types"

// ── Value extraction ──────────────────────────────────────────────────────────

export function getNestedValue(obj: unknown, path: string): unknown {
  if (path === "[this]") return obj
  if (obj === null || obj === undefined) return undefined

  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)

  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

// ── Numeric value resolution ──────────────────────────────────────────────────

export function extractNumericValues(
  items: unknown[],
  field: string,
  nullHandling: NullHandling
): number[] {
  const results: number[] = []
  for (const item of items) {
    const raw = getNestedValue(item, field)
    if (raw === null || raw === undefined) {
      if (nullHandling === "include_as_zero") {
        results.push(0)
      }
      // "exclude" → skip; "include_as_null" → skip (NaN not useful in arrays)
      continue
    }
    const num = Number(raw)
    if (isNaN(num)) {
      if (nullHandling === "include_as_zero") {
        results.push(0)
      }
      continue
    }
    results.push(num)
  }
  return results
}

// ── Statistical functions ─────────────────────────────────────────────────────

export function computeSum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}

export function computeAverage(values: number[]): number | null {
  if (values.length === 0) return null
  return computeSum(values) / values.length
}

export function computeMin(values: number[]): number | null {
  if (values.length === 0) return null
  let min = values[0]!
  for (let i = 1; i < values.length; i++) {
    if (values[i]! < min) min = values[i]!
  }
  return min
}

export function computeMax(values: number[]): number | null {
  if (values.length === 0) return null
  let max = values[0]!
  for (let i = 1; i < values.length; i++) {
    if (values[i]! > max) max = values[i]!
  }
  return max
}

export function computeMedian(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) {
    return sorted[mid]!
  }
  return (sorted[mid - 1]! + sorted[mid]!) / 2
}

export function computeMode(values: number[]): {
  value: number | null
  count: number
  allModes: number[]
} {
  if (values.length === 0) return { value: null, count: 0, allModes: [] }

  const freq = new Map<number, number>()
  for (const v of values) {
    freq.set(v, (freq.get(v) ?? 0) + 1)
  }

  let maxCount = 0
  for (const count of freq.values()) {
    if (count > maxCount) maxCount = count
  }

  const allModes: number[] = []
  for (const [v, count] of freq.entries()) {
    if (count === maxCount) allModes.push(v)
  }
  allModes.sort((a, b) => a - b)

  return {
    value: allModes[0] ?? null,
    count: maxCount,
    allModes,
  }
}

export function computeStdDev(values: number[], sample: boolean): number | null {
  const n = values.length
  if (n === 0) return null
  if (sample && n === 1) return null

  const mean = computeAverage(values)!
  const squaredDiffs = values.map(v => (v - mean) ** 2)
  const variance = computeSum(squaredDiffs) / (sample ? n - 1 : n)
  return Math.sqrt(variance)
}

export function computePercentile(values: number[], p: number): number | null {
  if (values.length === 0) return null
  if (p < 0 || p > 100) return null

  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length

  // Excel PERCENTILE.INC formula
  const rank = (p / 100) * (n - 1)
  const lower = Math.floor(rank)
  const upper = Math.ceil(rank)
  const fraction = rank - lower

  if (lower === upper) {
    return sorted[lower]!
  }
  return sorted[lower]! + fraction * (sorted[upper]! - sorted[lower]!)
}

// ── Rounding helper ───────────────────────────────────────────────────────────

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

// ── String operations ─────────────────────────────────────────────────────────

export function computeDistinct(items: unknown[], field: string): unknown[] {
  const seen = new Set<string>()
  const result: unknown[] = []
  for (const item of items) {
    const val = getNestedValue(item, field)
    const key = JSON.stringify(val)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(val)
    }
  }
  return result
}

export function computeConcatenate(
  items: unknown[],
  field: string,
  separator: string
): string {
  const parts: string[] = []
  for (const item of items) {
    const val = getNestedValue(item, field)
    if (val !== null && val !== undefined) {
      parts.push(String(val))
    }
  }
  return parts.join(separator)
}

// ── Group operations ──────────────────────────────────────────────────────────

export function groupBy(
  items: unknown[],
  groupField: string
): Record<string, unknown[]> {
  const groups: Record<string, unknown[]> = {}
  for (const item of items) {
    const val = getNestedValue(item, groupField)
    const key = val === null || val === undefined ? "_null_" : String(val)
    if (!groups[key]) groups[key] = []
    groups[key]!.push(item)
  }
  return groups
}

function runSingleOp(
  items: unknown[],
  op: AggregateOp,
  nullHandling: NullHandling,
  roundDecimals: number
): unknown {
  switch (op.operation) {
    case "COUNT":
      return items.length
    case "SUM": {
      const vals = extractNumericValues(items, op.field, nullHandling)
      return roundTo(computeSum(vals), roundDecimals)
    }
    case "AVERAGE": {
      const vals = extractNumericValues(items, op.field, nullHandling)
      const avg = computeAverage(vals)
      return avg !== null ? roundTo(avg, roundDecimals) : null
    }
    case "MIN": {
      const vals = extractNumericValues(items, op.field, nullHandling)
      return computeMin(vals)
    }
    case "MAX": {
      const vals = extractNumericValues(items, op.field, nullHandling)
      return computeMax(vals)
    }
    case "MEDIAN": {
      const vals = extractNumericValues(items, op.field, nullHandling)
      const med = computeMedian(vals)
      return med !== null ? roundTo(med, roundDecimals) : null
    }
    case "MODE": {
      const vals = extractNumericValues(items, op.field, nullHandling)
      return computeMode(vals).value
    }
    case "STANDARD_DEVIATION": {
      const vals = extractNumericValues(items, op.field, nullHandling)
      const std = computeStdDev(vals, true)
      return std !== null ? roundTo(std, roundDecimals) : null
    }
    case "PERCENTILE": {
      const vals = extractNumericValues(items, op.field, nullHandling)
      const p = op.percentile ?? 90
      const pval = computePercentile(vals, p)
      return pval !== null ? roundTo(pval, roundDecimals) : null
    }
    case "CONCATENATE": {
      const sep = op.separator ?? ", "
      return computeConcatenate(items, op.field, sep)
    }
    case "FIRST":
      return items[0] ?? null
    case "LAST":
      return items[items.length - 1] ?? null
    case "DISTINCT":
      return computeDistinct(items, op.field)
    default:
      return null
  }
}

export function runNestedAggregates(
  groups: Record<string, unknown[]>,
  ops: AggregateOp[],
  nullHandling: NullHandling,
  roundDecimals: number
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {}
  for (const [groupKey, items] of Object.entries(groups)) {
    result[groupKey] = {}
    for (const op of ops) {
      result[groupKey]![op.label] = runSingleOp(items, op, nullHandling, roundDecimals)
    }
  }
  return result
}

// ── Pivot table ───────────────────────────────────────────────────────────────

export function computePivot(
  items: unknown[],
  config: PivotConfig,
  nullHandling: NullHandling,
  roundDecimals: number
): {
  rows: string[]
  columns: string[]
  data: Record<string, Record<string, number | null>>
} {
  // Collect all unique row and column values
  const rowSet = new Set<string>()
  const colSet = new Set<string>()

  for (const item of items) {
    const rowVal = getNestedValue(item, config.rowField)
    const colVal = getNestedValue(item, config.colField)
    rowSet.add(rowVal === null || rowVal === undefined ? "_null_" : String(rowVal))
    colSet.add(colVal === null || colVal === undefined ? "_null_" : String(colVal))
  }

  const rows = Array.from(rowSet).sort()
  const columns = Array.from(colSet).sort()

  // Group items by row × col
  const cellItems: Record<string, Record<string, unknown[]>> = {}
  for (const row of rows) {
    cellItems[row] = {}
    for (const col of columns) {
      cellItems[row]![col] = []
    }
  }

  for (const item of items) {
    const rowVal = getNestedValue(item, config.rowField)
    const colVal = getNestedValue(item, config.colField)
    const rowKey = rowVal === null || rowVal === undefined ? "_null_" : String(rowVal)
    const colKey = colVal === null || colVal === undefined ? "_null_" : String(colVal)
    if (cellItems[rowKey] && cellItems[rowKey]![colKey]) {
      cellItems[rowKey]![colKey]!.push(item)
    }
  }

  // Compute aggregate per cell
  const data: Record<string, Record<string, number | null>> = {}
  for (const row of rows) {
    data[row] = {}
    for (const col of columns) {
      const cellData = cellItems[row]?.[col] ?? []
      if (cellData.length === 0) {
        data[row]![col] = null
        continue
      }
      if (config.valueOp === "COUNT") {
        data[row]![col] = cellData.length
      } else {
        const vals = extractNumericValues(cellData, config.valueField, nullHandling)
        let val: number | null = null
        switch (config.valueOp) {
          case "SUM":
            val = roundTo(computeSum(vals), roundDecimals)
            break
          case "AVERAGE": {
            const avg = computeAverage(vals)
            val = avg !== null ? roundTo(avg, roundDecimals) : null
            break
          }
          case "MIN":
            val = computeMin(vals)
            break
          case "MAX":
            val = computeMax(vals)
            break
        }
        data[row]![col] = val
      }
    }
  }

  return { rows, columns, data }
}

// ── Frequency distribution ────────────────────────────────────────────────────

export function computeFrequencyDistribution(
  items: unknown[],
  field: string,
  sortDesc: boolean,
  topN: number
): Array<{ value: unknown; count: number; percentage: string }> {
  const freq = new Map<string, { value: unknown; count: number }>()
  const total = items.length

  for (const item of items) {
    const val = getNestedValue(item, field)
    const key = JSON.stringify(val)
    if (!freq.has(key)) {
      freq.set(key, { value: val, count: 0 })
    }
    freq.get(key)!.count++
  }

  let result = Array.from(freq.values())

  if (sortDesc) {
    result.sort((a, b) => b.count - a.count)
  }

  if (topN > 0) {
    result = result.slice(0, topN)
  }

  return result.map(({ value, count }) => ({
    value,
    count,
    percentage: total > 0 ? `${roundTo((count / total) * 100, 1)}%` : "0%",
  }))
}

// ── Multi-operation runner ────────────────────────────────────────────────────

export function runMultiOps(
  items: unknown[],
  ops: AggregateOp[],
  nullHandling: NullHandling,
  roundDecimals: number
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const op of ops) {
    result[op.label] = runSingleOp(items, op, nullHandling, roundDecimals)
  }
  return result
}
