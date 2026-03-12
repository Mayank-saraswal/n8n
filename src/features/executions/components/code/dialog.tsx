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

const DEFAULT_CODE = `// $input contains all data from previous nodes
// Example: $input.body.name, $input.email, $input.googleSheets.rows

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
  const [saved, setSaved] = useState(false)

  const { data: config, isLoading } = useQuery(
    trpc.code.getByNodeId.queryOptions(
      { nodeId: nodeId! },
      { enabled: open && !!nodeId }
    )
  )

  // Pre-fill from DB config when loaded
  useEffect(() => {
    if (config?.code) {
      setCode(config.code)
    }
  }, [config])

  // Reset when dialog opens with no config
  useEffect(() => {
    if (open && !config) {
      setCode(DEFAULT_CODE)
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
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Code</DialogTitle>
          <DialogDescription>
            Write JavaScript to transform your data
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <Editor
                height="300px"
                defaultLanguage="javascript"
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
                $input.body.* &nbsp; $input.headers.* &nbsp; $json (alias for $input)
              </p>
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
