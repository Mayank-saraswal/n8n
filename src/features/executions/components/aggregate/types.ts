export type AggregateOperation =
  | "COUNT"
  | "SUM"
  | "AVERAGE"
  | "MIN"
  | "MAX"
  | "MEDIAN"
  | "MODE"
  | "STANDARD_DEVIATION"
  | "CONCATENATE"
  | "FIRST"
  | "LAST"
  | "DISTINCT"
  | "GROUP_BY"
  | "PIVOT"
  | "PERCENTILE"
  | "FREQUENCY_DISTRIBUTION"
  | "MULTI"

export type NullHandling = "exclude" | "include_as_zero" | "include_as_null"

// A single operation within MULTI or GROUP_BY nested aggregation
export interface AggregateOp {
  id: string
  operation: Exclude<AggregateOperation, "MULTI" | "GROUP_BY" | "PIVOT">
  field: string          // dot-notation field to aggregate
  label: string          // output key name for this result
  separator?: string     // for CONCATENATE
  percentile?: number    // for PERCENTILE
}

export interface PivotConfig {
  rowField: string
  colField: string
  valueField: string
  valueOp: "SUM" | "COUNT" | "AVERAGE" | "MIN" | "MAX"
}

export type AggregateNodeData = {
  operation?: string
  inputPath?: string
  field?: string
  groupByField?: string
  pivotRowField?: string
  pivotColField?: string
  pivotValueField?: string
  pivotValueOp?: string
  separator?: string
  percentile?: number
  countFilter?: string
  multiOps?: string
  groupAggOps?: string
  variableName?: string
  includeInput?: boolean
  sortOutput?: boolean
  topN?: number
  nullHandling?: string
  roundDecimals?: number
  continueOnFail?: boolean
} & Record<string, unknown>

export const OPERATION_LABELS: Record<AggregateOperation, string> = {
  COUNT: "Count",
  SUM: "Sum",
  AVERAGE: "Average (Mean)",
  MIN: "Minimum",
  MAX: "Maximum",
  MEDIAN: "Median",
  MODE: "Mode (Most Common)",
  STANDARD_DEVIATION: "Standard Deviation",
  CONCATENATE: "Concatenate (Join)",
  FIRST: "First Item",
  LAST: "Last Item",
  DISTINCT: "Distinct Values",
  GROUP_BY: "Group By",
  PIVOT: "Pivot Table",
  PERCENTILE: "Percentile (P50/P90/P99)",
  FREQUENCY_DISTRIBUTION: "Frequency Distribution",
  MULTI: "Multiple Operations",
}

// Operations that don't need a field (operate on whole items)
export const NO_FIELD_OPERATIONS: AggregateOperation[] = [
  "COUNT", "FIRST", "LAST", "MULTI",
]

// Operations that need a numeric field
export const NUMERIC_OPERATIONS: AggregateOperation[] = [
  "SUM", "AVERAGE", "MIN", "MAX", "MEDIAN", "MODE",
  "STANDARD_DEVIATION", "PERCENTILE",
]
