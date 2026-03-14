"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react"
import { IfElseOperator } from "@/generated/prisma"
import { OPERATORS } from "./operators"
import type { Condition, ConditionGroup, ConditionsConfig } from "./evaluate-conditions"

interface IfElseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeId: string
  workflowId: string
}

const OPERATORS_WITHOUT_VALUE: IfElseOperator[] = [
  IfElseOperator.IS_EMPTY,
  IfElseOperator.IS_NOT_EMPTY,
  IfElseOperator.IS_TRUE,
  IfElseOperator.IS_FALSE,
]

const operatorLabel: Record<IfElseOperator, string> = {
  [IfElseOperator.EQUALS]: "equals",
  [IfElseOperator.NOT_EQUALS]: "not equals",
  [IfElseOperator.CONTAINS]: "contains",
  [IfElseOperator.NOT_CONTAINS]: "does not contain",
  [IfElseOperator.STARTS_WITH]: "starts with",
  [IfElseOperator.ENDS_WITH]: "ends with",
  [IfElseOperator.GREATER_THAN]: "greater than",
  [IfElseOperator.LESS_THAN]: "less than",
  [IfElseOperator.GREATER_THAN_OR_EQUAL]: "greater than or equal",
  [IfElseOperator.LESS_THAN_OR_EQUAL]: "less than or equal",
  [IfElseOperator.IS_EMPTY]: "is empty",
  [IfElseOperator.IS_NOT_EMPTY]: "is not empty",
  [IfElseOperator.IS_TRUE]: "is true",
  [IfElseOperator.IS_FALSE]: "is false",
  [IfElseOperator.REGEX_MATCH]: "matches regex",
}

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

function createDefaultConfig(): ConditionsConfig {
  return { combinator: "AND", groups: [createEmptyGroup()] }
}

// Check if compound config has at least one condition with leftValue set
function isCompoundConfigured(config: ConditionsConfig): boolean {
  return config.groups.some((g) =>
    g.conditions.some((c) => c.leftValue.trim() !== "")
  )
}

function cloneGroups(groups: ConditionGroup[]): ConditionGroup[] {
  return groups.map((g) => ({ ...g, conditions: [...g.conditions] }))
}

export const IfElseDialog = ({
  open,
  onOpenChange,
  nodeId,
  workflowId,
}: IfElseDialogProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // Legacy single-condition state
  const [field, setField] = useState("")
  const [operator, setOperator] = useState<IfElseOperator>(
    IfElseOperator.EQUALS
  )
  const [value, setValue] = useState("")
  const [saved, setSaved] = useState(false)
  const [regexError, setRegexError] = useState<string | null>(null)

  // Compound conditions state
  const [useCompound, setUseCompound] = useState(false)
  const [conditionsConfig, setConditionsConfig] = useState<ConditionsConfig>(createDefaultConfig)

  const { data: config, isLoading } = useQuery(
    trpc.ifElse.getByNodeId.queryOptions(
      { nodeId },
      { enabled: open && !!nodeId }
    )
  )

  // Pre-fill form when config loads
  useEffect(() => {
    if (config) {
      setField(config.field)
      setOperator(config.operator)
      setValue(config.value)

      if (config.conditionsJson && config.conditionsJson.trim() !== "") {
        try {
          const parsed = JSON.parse(config.conditionsJson) as ConditionsConfig
          if (parsed.combinator && Array.isArray(parsed.groups)) {
            setConditionsConfig(parsed)
            setUseCompound(true)
          } else {
            setConditionsConfig(createDefaultConfig())
            setUseCompound(false)
          }
        } catch {
          // Invalid JSON, stay in legacy mode
          setConditionsConfig(createDefaultConfig())
          setUseCompound(false)
        }
      } else {
        // No compound config — reset to legacy mode
        setConditionsConfig(createDefaultConfig())
        setUseCompound(false)
      }
    } else {
      // No config at all — reset everything
      setField("")
      setOperator(IfElseOperator.EQUALS)
      setValue("")
      setConditionsConfig(createDefaultConfig())
      setUseCompound(false)
    }
  }, [config])

  const upsertMutation = useMutation(
    trpc.ifElse.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.ifElse.getByNodeId.queryOptions({ nodeId })
        )
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  )

  const handleSave = () => {
    if (useCompound) {
      upsertMutation.mutate({
        workflowId,
        nodeId,
        field: "",
        operator: IfElseOperator.EQUALS,
        value: "",
        conditionsJson: JSON.stringify(conditionsConfig),
      })
    } else {
      // Validate regex pattern before saving
      if (operator === IfElseOperator.REGEX_MATCH && value) {
        try {
          new RegExp(value)
          setRegexError(null)
        } catch {
          setRegexError("Invalid regex pattern")
          return
        }
      }
      upsertMutation.mutate({
        workflowId,
        nodeId,
        field,
        operator,
        value: OPERATORS_WITHOUT_VALUE.includes(operator) ? "" : value,
        conditionsJson: "",
      })
    }
  }

  // Compound conditions helpers
  const updateCondition = useCallback(
    (groupIdx: number, condIdx: number, updates: Partial<Condition>) => {
      setConditionsConfig((prev) => {
        const next = { ...prev, groups: cloneGroups(prev.groups) }
        next.groups[groupIdx].conditions[condIdx] = {
          ...next.groups[groupIdx].conditions[condIdx],
          ...updates,
        }
        return next
      })
    },
    []
  )

  const addCondition = useCallback((groupIdx: number) => {
    setConditionsConfig((prev) => {
      const next = { ...prev, groups: cloneGroups(prev.groups) }
      next.groups[groupIdx].conditions.push(createEmptyCondition())
      return next
    })
  }, [])

  const removeCondition = useCallback((groupIdx: number, condIdx: number) => {
    setConditionsConfig((prev) => {
      const next = { ...prev, groups: cloneGroups(prev.groups) }
      if (next.groups[groupIdx].conditions.length > 1) {
        next.groups[groupIdx].conditions.splice(condIdx, 1)
      }
      return next
    })
  }, [])

  const addGroup = useCallback(() => {
    setConditionsConfig((prev) => ({
      ...prev,
      groups: [...prev.groups, createEmptyGroup()],
    }))
  }, [])

  const removeGroup = useCallback((groupIdx: number) => {
    setConditionsConfig((prev) => {
      if (prev.groups.length <= 1) return prev
      return { ...prev, groups: prev.groups.filter((_, i) => i !== groupIdx) }
    })
  }, [])

  const setGroupCombinator = useCallback((groupIdx: number, combinator: "AND" | "OR") => {
    setConditionsConfig((prev) => {
      const next = { ...prev, groups: prev.groups.map((g) => ({ ...g })) }
      next.groups[groupIdx].combinator = combinator
      return next
    })
  }, [])

  const setTopCombinator = useCallback((combinator: "AND" | "OR") => {
    setConditionsConfig((prev) => ({ ...prev, combinator }))
  }, [])

  const showValue = !OPERATORS_WITHOUT_VALUE.includes(operator)

  const NUMERIC_OPERATORS: IfElseOperator[] = [
    IfElseOperator.GREATER_THAN,
    IfElseOperator.LESS_THAN,
    IfElseOperator.GREATER_THAN_OR_EQUAL,
    IfElseOperator.LESS_THAN_OR_EQUAL,
  ]

  const operatorRequiresRightValue = (op: string) => {
    const def = OPERATORS.find((o) => o.value === op)
    return !def || def.requiresRightValue
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>If / Else Condition</DialogTitle>
          <DialogDescription>
            Configure conditions to branch workflow execution
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={useCompound ? "outline" : "default"}
                size="sm"
                onClick={() => setUseCompound(false)}
              >
                Simple
              </Button>
              <Button
                variant={useCompound ? "default" : "outline"}
                size="sm"
                onClick={() => setUseCompound(true)}
              >
                Advanced (AND/OR Groups)
              </Button>
            </div>

            {!useCompound ? (
              /* ──────── LEGACY SINGLE-CONDITION UI ──────── */
              <>
                {/* Section 1 — Field Input */}
                <div className="space-y-2">
                  <Label htmlFor="if-else-field">Field</Label>
                  <p className="text-xs text-muted-foreground">
                    Use dot notation to access nested data. e.g.{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      body.user.email
                    </code>{" "}
                    or{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      output.score
                    </code>
                  </p>
                  <Input
                    id="if-else-field"
                    placeholder="body.status"
                    className="font-mono"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground/60">
                    Available: body.* headers.* queryParams.* output.*
                  </p>
                </div>

                {/* Section 2 — Operator Select */}
                <div className="space-y-2">
                  <Label htmlFor="if-else-operator">Operator</Label>
                  <Select
                    value={operator}
                    onValueChange={(val) => setOperator(val as IfElseOperator)}
                  >
                    <SelectTrigger id="if-else-operator">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>String</SelectLabel>
                        <SelectItem value={IfElseOperator.EQUALS}>
                          equals
                        </SelectItem>
                        <SelectItem value={IfElseOperator.NOT_EQUALS}>
                          not equals
                        </SelectItem>
                        <SelectItem value={IfElseOperator.CONTAINS}>
                          contains
                        </SelectItem>
                        <SelectItem value={IfElseOperator.NOT_CONTAINS}>
                          does not contain
                        </SelectItem>
                        <SelectItem value={IfElseOperator.STARTS_WITH}>
                          starts with
                        </SelectItem>
                        <SelectItem value={IfElseOperator.ENDS_WITH}>
                          ends with
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Number</SelectLabel>
                        <SelectItem value={IfElseOperator.GREATER_THAN}>
                          greater than
                        </SelectItem>
                        <SelectItem value={IfElseOperator.LESS_THAN}>
                          less than
                        </SelectItem>
                        <SelectItem value={IfElseOperator.GREATER_THAN_OR_EQUAL}>
                          greater than or equal
                        </SelectItem>
                        <SelectItem value={IfElseOperator.LESS_THAN_OR_EQUAL}>
                          less than or equal
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Boolean</SelectLabel>
                        <SelectItem value={IfElseOperator.IS_TRUE}>
                          is true
                        </SelectItem>
                        <SelectItem value={IfElseOperator.IS_FALSE}>
                          is false
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Empty check</SelectLabel>
                        <SelectItem value={IfElseOperator.IS_EMPTY}>
                          is empty
                        </SelectItem>
                        <SelectItem value={IfElseOperator.IS_NOT_EMPTY}>
                          is not empty
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Advanced</SelectLabel>
                        <SelectItem value={IfElseOperator.REGEX_MATCH}>
                          matches regex
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Section 3 — Value Input */}
                {showValue && (
                  <div className="space-y-2">
                    <Label htmlFor="if-else-value">Value</Label>
                    {operator === IfElseOperator.REGEX_MATCH && (
                      <p className="text-xs text-muted-foreground">
                        Enter a valid JavaScript regex pattern e.g.{" "}
                        <code className="bg-muted px-1 py-0.5 rounded">
                          {"^[A-Z]+"}
                        </code>
                      </p>
                    )}
                    {NUMERIC_OPERATORS.includes(operator) && (
                      <p className="text-xs text-muted-foreground">
                        Enter a number
                      </p>
                    )}
                    <Input
                      id="if-else-value"
                      placeholder="Enter value..."
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value)
                        if (regexError) setRegexError(null)
                      }}
                    />
                    {regexError && (
                      <p className="text-xs text-destructive">{regexError}</p>
                    )}
                  </div>
                )}

                {/* Section 4 — Live Preview Panel */}
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <h4 className="text-sm font-medium">Preview</h4>
                  <p className="text-sm font-mono">
                    <span className="text-muted-foreground">IF </span>
                    <span className="text-foreground font-semibold">
                      {field || "field"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {operatorLabel[operator]}
                    </span>{" "}
                    {showValue && (
                      <span className="text-foreground">
                        &quot;{value}&quot;
                      </span>
                    )}
                  </p>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-xs">
                      →{" "}
                      <span className="font-medium text-emerald-500">TRUE</span>{" "}
                      path will execute
                    </p>
                    <p className="text-xs">
                      →{" "}
                      <span className="font-medium text-red-500">FALSE</span> path
                      will execute
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* ──────── COMPOUND CONDITIONS UI ──────── */
              <>
                {/* Top-level combinator */}
                {conditionsConfig.groups.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Groups combined with:</Label>
                    <Select
                      value={conditionsConfig.combinator}
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
                  {conditionsConfig.groups.map((group, groupIdx) => (
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
                              onValueChange={(val) => setGroupCombinator(groupIdx, val as "AND" | "OR")}
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
                        {conditionsConfig.groups.length > 1 && (
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
                                  {OPERATORS.filter((o) => o.category.includes("any") && o.requiresRightValue).map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                  ))}
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel>String</SelectLabel>
                                  {OPERATORS.filter((o) => o.category.includes("string")).map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                  ))}
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel>Number</SelectLabel>
                                  {OPERATORS.filter((o) => o.category.includes("number")).map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                  ))}
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel>Existence</SelectLabel>
                                  {OPERATORS.filter((o) => o.category.includes("any") && !o.requiresRightValue).map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                  ))}
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel>Boolean</SelectLabel>
                                  {OPERATORS.filter((o) => o.category.includes("boolean")).map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                  ))}
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel>Array</SelectLabel>
                                  {OPERATORS.filter((o) => o.category.includes("array")).map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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

                {/* Preview for compound */}
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <h4 className="text-sm font-medium">Preview</h4>
                  <div className="text-xs font-mono space-y-1">
                    {conditionsConfig.groups.map((group, gi) => (
                      <div key={gi}>
                        {gi > 0 && (
                          <span className="text-amber-500 font-semibold">
                            {conditionsConfig.combinator}{" "}
                          </span>
                        )}
                        <span className="text-muted-foreground">(</span>
                        {group.conditions.map((c, ci) => (
                          <span key={c.id}>
                            {ci > 0 && (
                              <span className="text-blue-500 font-semibold">
                                {" "}{group.combinator}{" "}
                              </span>
                            )}
                            <span className="text-foreground">
                              {c.leftValue || "?"} {OPERATORS.find((o) => o.value === c.operator)?.label ?? c.operator}
                              {operatorRequiresRightValue(c.operator) ? ` "${c.rightValue}"` : ""}
                            </span>
                          </span>
                        ))}
                        <span className="text-muted-foreground">)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Save Button */}
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={
                (!useCompound && !field.trim()) ||
                (useCompound && !isCompoundConfigured(conditionsConfig)) ||
                upsertMutation.isPending
              }
            >
              {upsertMutation.isPending ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckIcon className="size-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save Condition"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
