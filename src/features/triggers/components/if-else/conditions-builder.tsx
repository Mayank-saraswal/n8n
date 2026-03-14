"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { OPERATORS } from "./operators"
import type { Condition, ConditionGroup, ConditionsConfig } from "./evaluate-conditions"

/* ── helpers ── */

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11)
}

function createEmptyCondition(): Condition {
  return { id: generateId(), leftValue: "", operator: "equals", rightValue: "" }
}

function createEmptyGroup(): ConditionGroup {
  return { combinator: "AND", conditions: [createEmptyCondition()] }
}

export function createDefaultConfig(): ConditionsConfig {
  return { combinator: "AND", groups: [createEmptyGroup()] }
}

export function isCompoundConfigured(config: ConditionsConfig): boolean {
  return config.groups.some((g) =>
    g.conditions.some((c) => c.leftValue.trim() !== "")
  )
}

function cloneGroups(groups: ConditionGroup[]): ConditionGroup[] {
  return groups.map((g) => ({ ...g, conditions: [...g.conditions] }))
}

function operatorRequiresRightValue(op: string): boolean {
  const def = OPERATORS.find((o) => o.value === op)
  return !def || def.requiresRightValue
}

/* ── public interface ── */

export interface ConditionsBuilderProps {
  /** JSON string of a ConditionsConfig */
  value: string
  /** Called with updated JSON string whenever conditions change */
  onChange: (json: string) => void
}

/**
 * A reusable compound-conditions builder (AND/OR groups).
 * Accepts a serialised ConditionsConfig and calls `onChange` with the
 * updated JSON string after every mutation.
 */
export function ConditionsBuilder({ value, onChange }: ConditionsBuilderProps) {
  let config: ConditionsConfig
  try {
    const parsed = JSON.parse(value) as ConditionsConfig
    config =
      parsed && parsed.combinator && Array.isArray(parsed.groups)
        ? parsed
        : createDefaultConfig()
  } catch {
    config = createDefaultConfig()
  }

  const emit = (next: ConditionsConfig) => onChange(JSON.stringify(next))

  /* ── mutation helpers ── */

  const updateCondition = (
    groupIdx: number,
    condIdx: number,
    updates: Partial<Condition>
  ) => {
    const next = { ...config, groups: cloneGroups(config.groups) }
    next.groups[groupIdx].conditions[condIdx] = {
      ...next.groups[groupIdx].conditions[condIdx],
      ...updates,
    }
    emit(next)
  }

  const addCondition = (groupIdx: number) => {
    const next = { ...config, groups: cloneGroups(config.groups) }
    next.groups[groupIdx].conditions.push(createEmptyCondition())
    emit(next)
  }

  const removeCondition = (groupIdx: number, condIdx: number) => {
    const next = { ...config, groups: cloneGroups(config.groups) }
    if (next.groups[groupIdx].conditions.length > 1) {
      next.groups[groupIdx].conditions.splice(condIdx, 1)
    }
    emit(next)
  }

  const addGroup = () => {
    emit({ ...config, groups: [...config.groups, createEmptyGroup()] })
  }

  const removeGroup = (groupIdx: number) => {
    if (config.groups.length <= 1) return
    emit({ ...config, groups: config.groups.filter((_, i) => i !== groupIdx) })
  }

  const setGroupCombinator = (groupIdx: number, combinator: "AND" | "OR") => {
    const next = { ...config, groups: config.groups.map((g) => ({ ...g })) }
    next.groups[groupIdx].combinator = combinator
    emit(next)
  }

  const setTopCombinator = (combinator: "AND" | "OR") => {
    emit({ ...config, combinator })
  }

  /* ── render ── */

  return (
    <div className="space-y-4">
      {/* Top-level combinator */}
      {config.groups.length > 1 && (
        <div className="flex items-center gap-2">
          <Label className="text-xs">Groups combined with:</Label>
          <Select
            value={config.combinator}
            onValueChange={(val) => setTopCombinator(val as "AND" | "OR")}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Condition groups */}
      <div className="space-y-4">
        {config.groups.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className="rounded-lg border bg-muted/30 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Group {groupIdx + 1}
                </span>
                {group.conditions.length > 1 && (
                  <Select
                    value={group.combinator}
                    onValueChange={(val) =>
                      setGroupCombinator(groupIdx, val as "AND" | "OR")
                    }
                  >
                    <SelectTrigger className="w-20 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              {config.groups.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => removeGroup(groupIdx)}
                >
                  <Trash2Icon className="size-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>

            {/* Conditions in this group */}
            {group.conditions.map((condition, condIdx) => (
              <div key={condition.id} className="space-y-2">
                {condIdx > 0 && (
                  <div className="text-center">
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {group.combinator}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  {/* Left Value */}
                  <Input
                    placeholder="{{variable}}"
                    className="font-mono text-xs flex-1"
                    value={condition.leftValue}
                    onChange={(e) =>
                      updateCondition(groupIdx, condIdx, {
                        leftValue: e.target.value,
                      })
                    }
                  />
                  {/* Operator */}
                  <Select
                    value={condition.operator}
                    onValueChange={(val) =>
                      updateCondition(groupIdx, condIdx, { operator: val })
                    }
                  >
                    <SelectTrigger className="w-[180px] text-xs">
                      <SelectValue placeholder="operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Equality</SelectLabel>
                        {OPERATORS.filter(
                          (o) =>
                            o.category.includes("any") && o.requiresRightValue
                        ).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>String</SelectLabel>
                        {OPERATORS.filter((o) =>
                          o.category.includes("string")
                        ).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Number</SelectLabel>
                        {OPERATORS.filter((o) =>
                          o.category.includes("number")
                        ).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Existence</SelectLabel>
                        {OPERATORS.filter(
                          (o) =>
                            o.category.includes("any") && !o.requiresRightValue
                        ).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Boolean</SelectLabel>
                        {OPERATORS.filter((o) =>
                          o.category.includes("boolean")
                        ).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Array</SelectLabel>
                        {OPERATORS.filter((o) =>
                          o.category.includes("array")
                        ).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {/* Right Value */}
                  {operatorRequiresRightValue(condition.operator) && (
                    <Input
                      placeholder="value"
                      className="font-mono text-xs flex-1"
                      value={condition.rightValue}
                      onChange={(e) =>
                        updateCondition(groupIdx, condIdx, {
                          rightValue: e.target.value,
                        })
                      }
                    />
                  )}
                  {/* Remove condition */}
                  {group.conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 shrink-0"
                      onClick={() => removeCondition(groupIdx, condIdx)}
                    >
                      <Trash2Icon className="size-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Add condition button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => addCondition(groupIdx)}
            >
              <PlusIcon className="size-3 mr-1" />
              Add condition
            </Button>
          </div>
        ))}
      </div>

      {/* Add group button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={addGroup}
      >
        <PlusIcon className="size-3.5 mr-1" />
        Add group
      </Button>
    </div>
  )
}
