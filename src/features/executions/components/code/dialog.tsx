"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckIcon, Loader2Icon } from "lucide-react"
import Editor from "@monaco-editor/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const DEFAULT_CODE = `// $input contains all data from previous nodes
// Example: $input.body.name, $input.email, $input.googleSheets.rows
// You can use await and fetch() for async operations

return {
  // your output here
}`

interface CodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (code: string) => void
  nodeId?: string
  workflowId?: string
}

export const CodeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  nodeId,
  workflowId,
}: CodeDialogProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState("javascript")
  const [outputMode, setOutputMode] = useState<"append" | "replace" | "raw">("append")
  const [timeout, setTimeout_] = useState(5000)
  const [continueOnFail, setContinueOnFail] = useState(false)
  const [allowedDomains, setAllowedDomains] = useState("")
  const [saved, setSaved] = useState(false)

  const { data: config, isLoading } = useQuery(
    trpc.code.getByNodeId.queryOptions(
      { nodeId: nodeId! },
      { enabled: open && !!nodeId }
    )
  )

  // Pre-fill from DB config when loaded
  useEffect(() => {
    if (config) {
      if (config.code) setCode(config.code)
      if (config.language) setLanguage(config.language)
      if (config.outputMode) setOutputMode(config.outputMode as "append" | "replace" | "raw")
      if (config.timeout) setTimeout_(config.timeout)
      setContinueOnFail(config.continueOnFail ?? false)
      if (config.allowedDomains !== undefined) setAllowedDomains(config.allowedDomains)
    }
  }, [config])

  // Reset when dialog opens with no config
  useEffect(() => {
    if (open && !config) {
      setCode(DEFAULT_CODE)
      setLanguage("javascript")
      setOutputMode("append")
      setTimeout_(5000)
      setContinueOnFail(false)
      setAllowedDomains("")
    }
  }, [open, config])

  const upsertMutation = useMutation(
    trpc.code.upsert.mutationOptions({
      onSuccess: () => {
        if (nodeId) {
          queryClient.invalidateQueries(
            trpc.code.getByNodeId.queryOptions({ nodeId })
          )
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  )

  const handleSave = () => {
    onSubmit(code)

    if (workflowId && nodeId) {
      upsertMutation.mutate({
        workflowId,
        nodeId,
        code,
        language,
        outputMode,
        timeout,
        continueOnFail,
        allowedDomains,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Code</DialogTitle>
          <DialogDescription>
            Write JavaScript to transform your data. Supports async/await and
            fetch().
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Settings row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Output Mode</Label>
                <Select value={outputMode} onValueChange={(v) => setOutputMode(v as "append" | "replace" | "raw")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="append">Append to context</SelectItem>
                    <SelectItem value="replace">Replace context</SelectItem>
                    <SelectItem value="raw">Raw output</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Timeout (ms)</Label>
                <Input
                  type="number"
                  min={100}
                  max={30000}
                  step={100}
                  value={timeout}
                  onChange={(e) => setTimeout_(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Code editor */}
            <div className="rounded-md border overflow-hidden">
              <Editor
                height="300px"
                defaultLanguage={language === "typescript" ? "typescript" : "javascript"}
                language={language === "typescript" ? "typescript" : "javascript"}
                value={code}
                onChange={(val) => setCode(val ?? "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>

            {/* Variable hints */}
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Available variables:
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                $input.body.* &nbsp; $input.headers.* &nbsp; $json (alias for
                $input) &nbsp; fetch(url)
              </p>
            </div>

            {/* Advanced settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Allowed Domains (comma-separated)</Label>
                <Input
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  placeholder="e.g. api.example.com, cdn.example.com"
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-end gap-2 pb-0.5">
                <Switch
                  id="continueOnFail"
                  checked={continueOnFail}
                  onCheckedChange={setContinueOnFail}
                />
                <Label htmlFor="continueOnFail" className="text-xs">
                  Continue on fail
                </Label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckIcon className="size-4 mr-2" />
                    Saved ✓
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
