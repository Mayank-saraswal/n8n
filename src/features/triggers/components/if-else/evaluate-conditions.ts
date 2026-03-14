import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { OPERATORS } from "./operators"

export interface Condition {
  id: string
  leftValue: string
  operator: string
  rightValue: string
}

export interface ConditionGroup {
  combinator: "AND" | "OR"
  conditions: Condition[]
}

export interface ConditionsConfig {
  combinator: "AND" | "OR"
  groups: ConditionGroup[]
}

function resolveValue(
  template: string,
  context: Record<string, unknown>
): unknown {
  if (!template) return ""
  const resolved = resolveTemplate(template, context)
  // Try to parse as number (strict: reject whitespace-only or empty strings)
  if (resolved !== "" && resolved.trim() !== "") {
    const num = Number(resolved)
    if (!isNaN(num)) return num
  }
  // Try to parse as boolean
  if (resolved === "true") return true
  if (resolved === "false") return false
  // Try to parse as JSON (for arrays/objects)
  try {
    const parsed = JSON.parse(resolved)
    if (typeof parsed === "object") return parsed
  } catch {
    // not JSON, return as string
  }
  return resolved
}

function toNumber(val: unknown): number {
  if (typeof val === "number") return val
  if (typeof val === "string") return parseFloat(val)
  return NaN
}

function toString(val: unknown): string {
  if (val === null || val === undefined) return ""
  return String(val)
}

export function evaluateSingleCondition(
  condition: Condition,
  context: Record<string, unknown>
): boolean {
  const left = resolveValue(condition.leftValue, context)
  const leftStr = toString(left)
  const op = condition.operator

  const operatorDef = OPERATORS.find((o) => o.value === op)
  let right: unknown = ""
  let rightStr = ""
  if (!operatorDef || operatorDef.requiresRightValue) {
    right = resolveValue(condition.rightValue, context)
    rightStr = toString(right)
  }

  switch (op) {
    // Equality
    case "equals":
      return leftStr === rightStr
    case "notEquals":
      return leftStr !== rightStr

    // String
    case "contains":
      return leftStr.toLowerCase().includes(rightStr.toLowerCase())
    case "notContains":
      return !leftStr.toLowerCase().includes(rightStr.toLowerCase())
    case "startsWith":
      return leftStr.toLowerCase().startsWith(rightStr.toLowerCase())
    case "endsWith":
      return leftStr.toLowerCase().endsWith(rightStr.toLowerCase())
    case "matchesRegex": {
      try {
        return new RegExp(rightStr).test(leftStr)
      } catch {
        return false
      }
    }
    case "notMatchesRegex": {
      try {
        return !new RegExp(rightStr).test(leftStr)
      } catch {
        return false
      }
    }

    // Number
    case "gt": {
      const a = toNumber(left), b = toNumber(right)
      return !isNaN(a) && !isNaN(b) && a > b
    }
    case "gte": {
      const a = toNumber(left), b = toNumber(right)
      return !isNaN(a) && !isNaN(b) && a >= b
    }
    case "lt": {
      const a = toNumber(left), b = toNumber(right)
      return !isNaN(a) && !isNaN(b) && a < b
    }
    case "lte": {
      const a = toNumber(left), b = toNumber(right)
      return !isNaN(a) && !isNaN(b) && a <= b
    }

    // Existence
    case "exists":
      return left !== null && left !== undefined && leftStr !== ""
    case "notExists":
      return left === null || left === undefined || leftStr === ""

    // Boolean
    case "isTrue":
      return left === true || leftStr === "true" || leftStr === "1"
    case "isFalse":
      return left === false || leftStr === "false" || leftStr === "0"

    // Array
    case "arrayContains": {
      if (!Array.isArray(left)) return false
      return left.some((item) => toString(item) === rightStr)
    }
    case "arrayNotContains": {
      if (!Array.isArray(left)) return false
      return !left.some((item) => toString(item) === rightStr)
    }
    case "arrayLengthEq": {
      if (!Array.isArray(left)) return false
      return left.length === toNumber(right)
    }
    case "arrayLengthGt": {
      if (!Array.isArray(left)) return false
      return left.length > toNumber(right)
    }

    default:
      return false
  }
}

function evaluateGroup(
  group: ConditionGroup,
  context: Record<string, unknown>
): boolean {
  if (group.conditions.length === 0) return true

  if (group.combinator === "AND") {
    return group.conditions.every((c) => evaluateSingleCondition(c, context))
  }
  return group.conditions.some((c) => evaluateSingleCondition(c, context))
}

export function evaluateConditions(
  config: ConditionsConfig,
  context: Record<string, unknown>
): boolean {
  if (config.groups.length === 0) return true

  if (config.combinator === "AND") {
    return config.groups.every((g) => evaluateGroup(g, context))
  }
  return config.groups.some((g) => evaluateGroup(g, context))
}

export function parseConditionsJson(json: string): ConditionsConfig | null {
  if (!json || json.trim() === "") return null
  try {
    const parsed = JSON.parse(json) as ConditionsConfig
    if (!parsed.combinator || !Array.isArray(parsed.groups)) return null
    return parsed
  } catch {
    return null
  }
}
