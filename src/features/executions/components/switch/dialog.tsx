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
import { OPERATORS } from "@/features/triggers/components/if-else/operators"
import type { Condition, ConditionGroup, ConditionsConfig } from "@/features/triggers/components/if-else/evaluate-conditions"

interface SwitchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeId: string
  workflowId: string
}

interface SwitchCase {
  id: string
  name: string
  conditionsJson: string
}

function createEmptyCondition(): Condition {
  return { id: crypto.randomUUID(), leftValue: "", operator: "equals", rightValue: "" }
}

function createEmptyGroup(): ConditionGroup {
  return { combinator: "AND", conditions: [createEmptyCondition()] }
}

function createDefaultConfig(): ConditionsConfig {
  return { combinator: "AND", groups: [createEmptyGroup()] }
}

function createEmptyCase(index: number): SwitchCase {
  return {
    id: `case_${index}`,
    name: `Case ${index + 1}`,
    conditionsJson: JSON.stringify(createDefaultConfig()),
  }
}

export function SwitchDialog({ open, onOpenChange, nodeId, workflowId }: SwitchDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [cases, setCases] = useState<SwitchCase[]>([createEmptyCase(0)])
  const [variableName, setVariableName] = useState("switch")
  const [saved, setSaved] = useState(false)
  const [activeCaseIndex, setActiveCaseIndex] = useState(0)

  const { data: config } = useQuery(
    trpc.switch.getByNodeId.queryOptions(
      { nodeId },
      { enabled: !!nodeId && open }
    )
  )

  useEffect(() => {
    if (config) {
      setVariableName(config.variableName || "switch")
      try {
        const parsed = JSON.parse(config.casesJson || "[]") as SwitchCase[]
        if (parsed.length > 0) {
          setCases(parsed)
        }
      } catch {
        // keep defaults
      }
    }
  }, [config])

  const upsertMutation = useMutation(
    trpc.switch.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.switch.getByNodeId.queryKey({ nodeId }) })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  )

  const handleSave = useCallback(() => {
    upsertMutation.mutate({
      workflowId,
      nodeId,
      variableName,
      casesJson: JSON.stringify(cases),
    })
  }, [workflowId, nodeId, variableName, cases, upsertMutation])

  // Case management
  const addCase = () => {
    setCases((prev) => [...prev, createEmptyCase(prev.length)])
  }

  const removeCase = (index: number) => {
    setCases((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (activeCaseIndex >= next.length) {
        setActiveCaseIndex(Math.max(0, next.length - 1))
      }
      return next
    })
  }

  const updateCaseName = (index: number, name: string) => {
    setCases((prev) => prev.map((c, i) => (i === index ? { ...c, name } : c)))
  }

  // Condition management within a case
  const getConditionsConfig = (caseIndex: number): ConditionsConfig => {
    try {
      return JSON.parse(cases[caseIndex].conditionsJson || "{}") as ConditionsConfig
    } catch {
      return createDefaultConfig()
    }
  }

  const setConditionsConfig = (caseIndex: number, config: ConditionsConfig) => {
    setCases((prev) =>
      prev.map((c, i) =>
        i === caseIndex ? { ...c, conditionsJson: JSON.stringify(config) } : c
      )
    )
  }

  const addCondition = (caseIndex: number, groupIndex: number) => {
    const config = getConditionsConfig(caseIndex)
    config.groups[groupIndex].conditions.push(createEmptyCondition())
    setConditionsConfig(caseIndex, { ...config })
  }

  const removeCondition = (caseIndex: number, groupIndex: number, condIndex: number) => {
    const config = getConditionsConfig(caseIndex)
    config.groups[groupIndex].conditions = config.groups[groupIndex].conditions.filter(
      (_, i) => i !== condIndex
    )
    if (config.groups[groupIndex].conditions.length === 0) {
      config.groups = config.groups.filter((_, i) => i !== groupIndex)
    }
    if (config.groups.length === 0) {
      config.groups = [createEmptyGroup()]
    }
    setConditionsConfig(caseIndex, { ...config })
  }

  const updateCondition = (
    caseIndex: number,
    groupIndex: number,
    condIndex: number,
    field: keyof Condition,
    value: string
  ) => {
    const config = getConditionsConfig(caseIndex)
    config.groups[groupIndex].conditions[condIndex] = {
      ...config.groups[groupIndex].conditions[condIndex],
      [field]: value,
    }
    setConditionsConfig(caseIndex, { ...config })
  }

  const addGroup = (caseIndex: number) => {
    const config = getConditionsConfig(caseIndex)
    config.groups.push(createEmptyGroup())
    setConditionsConfig(caseIndex, { ...config })
  }

  const setGroupCombinator = (caseIndex: number, groupIndex: number, combinator: "AND" | "OR") => {
    const config = getConditionsConfig(caseIndex)
    config.groups[groupIndex].combinator = combinator
    setConditionsConfig(caseIndex, { ...config })
  }

  const setRootCombinator = (caseIndex: number, combinator: "AND" | "OR") => {
    const config = getConditionsConfig(caseIndex)
    config.combinator = combinator
    setConditionsConfig(caseIndex, { ...config })
  }

  const activeConfig = cases[activeCaseIndex]
    ? getConditionsConfig(activeCaseIndex)
    : createDefaultConfig()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Switch Node</DialogTitle>
          <DialogDescription>
            Route execution to one of N branches based on conditions. First matching case wins. Unmatched items go to Fallback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Variable name */}
          <div className="space-y-1">
            <Label className="text-xs">Output Variable Name</Label>
            <Input
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              placeholder="switch"
              className="h-8 text-sm"
            />
          </div>

          {/* Case tabs */}
          <div className="space-y-2">
            <Label className="text-xs">Cases</Label>
            <div className="flex flex-wrap gap-1">
              {cases.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCaseIndex(i)}
                  className={`
                    px-3 py-1 text-xs rounded-md border transition-colors
                    ${activeCaseIndex === i
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted hover:bg-muted/80 border-border"
                    }
                  `}
                >
                  {c.name || `Case ${i + 1}`}
                </button>
              ))}
              <button
                onClick={() => {
                  const fallbackInfo = "Fallback"
                  return undefined
                }}
                className="px-3 py-1 text-xs rounded-md bg-muted/50 text-muted-foreground border border-dashed border-border cursor-default"
              >
                Fallback ↓
              </button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addCase}>
                <PlusIcon size={12} className="mr-1" />
                Add Case
              </Button>
            </div>
          </div>

          {/* Active case config */}
          {cases[activeCaseIndex] && (
            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <Input
                  value={cases[activeCaseIndex].name}
                  onChange={(e) => updateCaseName(activeCaseIndex, e.target.value)}
                  placeholder={`Case ${activeCaseIndex + 1}`}
                  className="h-8 text-sm flex-1"
                />
                {cases.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive"
                    onClick={() => removeCase(activeCaseIndex)}
                  >
                    <Trash2Icon size={14} />
                  </Button>
                )}
              </div>

              {/* Root combinator */}
              {activeConfig.groups.length > 1 && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Between groups:</Label>
                  <Select
                    value={activeConfig.combinator}
                    onValueChange={(v) => setRootCombinator(activeCaseIndex, v as "AND" | "OR")}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
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
              {activeConfig.groups.map((group, gi) => (
                <div key={gi} className="border rounded-md p-2 space-y-2 bg-background">
                  {gi > 0 && (
                    <div className="text-center text-xs text-muted-foreground font-medium uppercase">
                      {activeConfig.combinator}
                    </div>
                  )}

                  {group.conditions.length > 1 && (
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[10px]">Within group:</Label>
                      <Select
                        value={group.combinator}
                        onValueChange={(v) => setGroupCombinator(activeCaseIndex, gi, v as "AND" | "OR")}
                      >
                        <SelectTrigger className="w-20 h-6 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {group.conditions.map((cond, ci) => {
                    const opDef = OPERATORS.find((o) => o.value === cond.operator)
                    return (
                      <div key={cond.id} className="flex items-center gap-1.5">
                        {ci > 0 && (
                          <span className="text-[10px] text-muted-foreground w-8 text-center">
                            {group.combinator}
                          </span>
                        )}
                        <Input
                          value={cond.leftValue}
                          onChange={(e) => updateCondition(activeCaseIndex, gi, ci, "leftValue", e.target.value)}
                          placeholder="{{variable}}"
                          className="h-7 text-xs flex-1"
                        />
                        <Select
                          value={cond.operator}
                          onValueChange={(v) => updateCondition(activeCaseIndex, gi, ci, "operator", v)}
                        >
                          <SelectTrigger className="w-32 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Operators</SelectLabel>
                              {OPERATORS.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {(!opDef || opDef.requiresRightValue) && (
                          <Input
                            value={cond.rightValue}
                            onChange={(e) => updateCondition(activeCaseIndex, gi, ci, "rightValue", e.target.value)}
                            placeholder="value"
                            className="h-7 text-xs flex-1"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => removeCondition(activeCaseIndex, gi, ci)}
                        >
                          <Trash2Icon size={12} />
                        </Button>
                      </div>
                    )
                  })}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => addCondition(activeCaseIndex, gi)}
                  >
                    <PlusIcon size={12} className="mr-1" />
                    Add Condition
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addGroup(activeCaseIndex)}
              >
                <PlusIcon size={12} className="mr-1" />
                Add Group
              </Button>
            </div>
          )}

          {/* Fallback info */}
          <div className="rounded-lg border border-dashed p-3 bg-muted/10">
            <p className="text-xs text-muted-foreground">
              <strong>Fallback:</strong> If no case matches, execution flows through the Fallback branch.
              No configuration needed.
            </p>
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            className="w-full"
            disabled={upsertMutation.isPending}
          >
            {upsertMutation.isPending ? (
              <>
                <Loader2Icon size={14} className="mr-2 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <CheckIcon size={14} className="mr-2" />
                Saved
              </>
            ) : (
              "Save Switch Configuration"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
