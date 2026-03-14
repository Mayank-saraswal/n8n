export type OperatorCategory = "string" | "number" | "boolean" | "array" | "any"

export interface Operator {
  value: string
  label: string
  category: OperatorCategory[]
  requiresRightValue: boolean
}

export const OPERATORS: Operator[] = [
  // Equality
  { value: "equals",          label: "equals",               category: ["any"],     requiresRightValue: true },
  { value: "notEquals",       label: "not equals",           category: ["any"],     requiresRightValue: true },
  // String
  { value: "contains",        label: "contains",             category: ["string"],  requiresRightValue: true },
  { value: "notContains",     label: "not contains",         category: ["string"],  requiresRightValue: true },
  { value: "startsWith",      label: "starts with",          category: ["string"],  requiresRightValue: true },
  { value: "endsWith",        label: "ends with",            category: ["string"],  requiresRightValue: true },
  { value: "matchesRegex",    label: "matches regex",        category: ["string"],  requiresRightValue: true },
  { value: "notMatchesRegex", label: "not matches regex",    category: ["string"],  requiresRightValue: true },
  // Number
  { value: "gt",              label: "greater than",         category: ["number"],  requiresRightValue: true },
  { value: "gte",             label: "greater than or equal",category: ["number"],  requiresRightValue: true },
  { value: "lt",              label: "less than",            category: ["number"],  requiresRightValue: true },
  { value: "lte",             label: "less than or equal",   category: ["number"],  requiresRightValue: true },
  // Existence
  { value: "exists",          label: "is not empty",         category: ["any"],     requiresRightValue: false },
  { value: "notExists",       label: "is empty",             category: ["any"],     requiresRightValue: false },
  // Boolean
  { value: "isTrue",          label: "is true",              category: ["boolean"], requiresRightValue: false },
  { value: "isFalse",         label: "is false",             category: ["boolean"], requiresRightValue: false },
  // Array
  { value: "arrayContains",   label: "array contains",       category: ["array"],   requiresRightValue: true },
  { value: "arrayNotContains",label: "array not contains",   category: ["array"],   requiresRightValue: true },
  { value: "arrayLengthEq",   label: "array length equals",  category: ["array"],   requiresRightValue: true },
  { value: "arrayLengthGt",   label: "array length greater", category: ["array"],   requiresRightValue: true },
]
