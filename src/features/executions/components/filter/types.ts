export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "between"
  | "is_empty"
  | "is_not_empty"
  | "is_truthy"
  | "is_falsy"
  | "regex_match"
  | "in_array"
  | "not_in_array"
  | "typeof"
  | "exists"
  | "not_exists"

export type FilterOperation = "FILTER_ARRAY" | "FILTER_OBJECT_KEYS"

export type RootLogic = "AND" | "OR"

export type OutputMode = "filtered" | "rejected" | "both" | "stats_only"

export type KeyFilterMode = "key_name" | "key_value" | "both"

export interface FilterCondition {
  id: string
  field: string        // dot-notation path: "user.address.city", "[this]" for primitives
  operator: FilterOperator
  value: string        // primary comparison value (supports {{template}})
  value2: string       // secondary value for "between"
  caseSensitive: boolean
  trimWhitespace: boolean
  typeCoerce: boolean
}

export interface ConditionGroup {
  id: string
  logic: "AND" | "OR"
  conditions: (FilterCondition | ConditionGroup)[]
}

export function isConditionGroup(
  item: FilterCondition | ConditionGroup
): item is ConditionGroup {
  return "logic" in item && "conditions" in item
}

export interface FilterOptions {
  includeMetadata: boolean
  caseSensitive?: boolean
  trimWhitespace?: boolean
  typeCoerce?: boolean
}

export interface ConditionOptions {
  caseSensitive: boolean
  trimWhitespace: boolean
  typeCoerce: boolean
}

export interface FilterArrayResult {
  passed: unknown[]
  rejected: unknown[]
}

export interface FilterObjectResult {
  result: Record<string, unknown>
  removedKeys: string[]
}

export interface FilterNodeData extends Record<string, unknown> {
  operation?: string
  inputArray?: string
  inputObject?: string
  conditionGroups?: string
  rootLogic?: string
  outputMode?: string
  variableName?: string
  stopOnEmpty?: boolean
  includeMetadata?: boolean
  continueOnFail?: boolean
  keyFilterMode?: string
  keepMatching?: boolean
}

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: "is equal to",
  not_equals: "is not equal to",
  contains: "contains",
  not_contains: "does not contain",
  starts_with: "starts with",
  ends_with: "ends with",
  greater_than: "is greater than",
  greater_than_or_equal: "is greater than or equal to",
  less_than: "is less than",
  less_than_or_equal: "is less than or equal to",
  between: "is between",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  is_truthy: "is truthy",
  is_falsy: "is falsy",
  regex_match: "matches regex",
  in_array: "is one of",
  not_in_array: "is not one of",
  typeof: "type is",
  exists: "exists",
  not_exists: "does not exist",
}

// Operators that take no value input
export const NO_VALUE_OPERATORS: FilterOperator[] = [
  "is_empty", "is_not_empty", "is_truthy", "is_falsy", "exists", "not_exists",
]

// Operators that take two value inputs
export const DUAL_VALUE_OPERATORS: FilterOperator[] = ["between"]

// Operators with special value input
export const SPECIAL_VALUE_OPERATORS: FilterOperator[] = ["typeof", "in_array", "not_in_array", "regex_match"]

export const ALL_OPERATORS: FilterOperator[] = [
  "equals", "not_equals", "contains", "not_contains",
  "starts_with", "ends_with",
  "greater_than", "greater_than_or_equal", "less_than", "less_than_or_equal",
  "between",
  "is_empty", "is_not_empty", "is_truthy", "is_falsy",
  "regex_match", "in_array", "not_in_array",
  "typeof", "exists", "not_exists",
]
