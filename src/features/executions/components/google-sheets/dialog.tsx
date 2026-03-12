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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials"
import { CredentialType } from "@/generated/prisma"
import { CheckIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export interface GoogleSheetsFormValues {
  credentialId?: string
  operation?: "APPEND_ROW" | "READ_ROWS"
  spreadsheetId?: string
  sheetName?: string
  range?: string
  rowData?: Array<{ column: string; value: string }>
}

interface GoogleSheetsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: GoogleSheetsFormValues) => void
  defaultValues?: Partial<GoogleSheetsFormValues>
  nodeId?: string
  workflowId?: string
}

export const GoogleSheetsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
  workflowId,
}: GoogleSheetsDialogProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [credentialId, setCredentialId] = useState(defaultValues.credentialId || "")
  const [operation, setOperation] = useState<"APPEND_ROW" | "READ_ROWS">(
    defaultValues.operation || "APPEND_ROW"
  )
  const [spreadsheetId, setSpreadsheetId] = useState(defaultValues.spreadsheetId || "")
  const [sheetName, setSheetName] = useState(defaultValues.sheetName || "Sheet1")
  const [range, setRange] = useState(defaultValues.range || "A:Z")
  const [rowData, setRowData] = useState<Array<{ column: string; value: string }>>(
    defaultValues.rowData || [{ column: "A", value: "" }]
  )
  const [saved, setSaved] = useState(false)

  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.GOOGLE_SHEETS)

  const { data: config, isLoading } = useQuery(
    trpc.googleSheets.getByNodeId.queryOptions(
      { nodeId: nodeId! },
      { enabled: open && !!nodeId }
    )
  )

  // Pre-fill from DB config when loaded
  useEffect(() => {
    if (config) {
      setCredentialId(config.credentialId)
      setOperation(config.operation)
      setSpreadsheetId(config.spreadsheetId)
      setSheetName(config.sheetName)
      setRange(config.range)
      const data = config.rowData as Array<{ column: string; value: string }>
      if (Array.isArray(data) && data.length > 0) {
        setRowData(data)
      }
    }
  }, [config])

  // Reset when dialog opens with defaultValues
  useEffect(() => {
    if (open && !config) {
      setCredentialId(defaultValues.credentialId || "")
      setOperation(defaultValues.operation || "APPEND_ROW")
      setSpreadsheetId(defaultValues.spreadsheetId || "")
      setSheetName(defaultValues.sheetName || "Sheet1")
      setRange(defaultValues.range || "A:Z")
      setRowData(
        defaultValues.rowData || [{ column: "A", value: "" }]
      )
    }
  }, [open, defaultValues, config])

  const upsertMutation = useMutation(
    trpc.googleSheets.upsert.mutationOptions({
      onSuccess: () => {
        if (nodeId) {
          queryClient.invalidateQueries(
            trpc.googleSheets.getByNodeId.queryOptions({ nodeId })
          )
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  )

  const isValid = credentialId.trim() && spreadsheetId.trim()

  const handleAddColumn = () => {
    setRowData((prev) => [...prev, { column: "", value: "" }])
  }

  const handleRemoveColumn = (index: number) => {
    setRowData((prev) => prev.filter((_, i) => i !== index))
  }

  const handleColumnChange = (
    index: number,
    field: "column" | "value",
    val: string
  ) => {
    setRowData((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: val } : item
      )
    )
  }

  const handleSave = () => {
    if (!isValid) return

    const values: GoogleSheetsFormValues = {
      credentialId,
      operation,
      spreadsheetId,
      sheetName,
      range,
      rowData,
    }

    // Update local node data
    onSubmit(values)

    // Persist to DB if we have a workflowId and nodeId
    if (workflowId && nodeId) {
      upsertMutation.mutate({
        workflowId,
        nodeId,
        credentialId,
        operation,
        spreadsheetId,
        sheetName,
        range,
        rowData,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Google Sheets</DialogTitle>
          <DialogDescription>
            Append or read rows in a Google Spreadsheet
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Credential Selector */}
            <div className="space-y-2">
              <Label>Google Sheets Credential</Label>
              <Select
                value={credentialId}
                onValueChange={setCredentialId}
                disabled={isLoadingCredentials || !credentials?.length}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select credential..." />
                </SelectTrigger>
                <SelectContent>
                  {credentials?.map((credential) => (
                    <SelectItem key={credential.id} value={credential.id}>
                      {credential.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link
                href="/credentials/new"
                className="text-xs text-primary hover:underline"
              >
                + Add new Google Sheets credential
              </Link>
              <p className="text-xs text-muted-foreground">
                Store a refresh token from{" "}
                <a
                  href="https://developers.google.com/oauthplayground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  OAuth Playground
                </a>
                {" "}— select &quot;Google Sheets API v4&quot; scope
              </p>
              {!credentialId && (
                <p className="text-xs text-destructive">
                  Credential is required
                </p>
              )}
            </div>

            <Separator />

            {/* Operation */}
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select
                value={operation}
                onValueChange={(val) =>
                  setOperation(val as "APPEND_ROW" | "READ_ROWS")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPEND_ROW">Append Row</SelectItem>
                  <SelectItem value="READ_ROWS">Read Rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Spreadsheet ID */}
            <div className="space-y-2">
              <Label>Spreadsheet ID</Label>
              <Input
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Found in the sheet URL: .../spreadsheets/d/&#123;ID&#125;/edit
              </p>
              {!spreadsheetId.trim() && (
                <p className="text-xs text-destructive">
                  Spreadsheet ID is required
                </p>
              )}
            </div>

            {/* Sheet Name */}
            <div className="space-y-2">
              <Label>Sheet Name</Label>
              <Input
                placeholder="Sheet1"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
            </div>

            {/* Range */}
            <div className="space-y-2">
              <Label>Range</Label>
              <Input
                placeholder="A:Z"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              />
            </div>

            {/* Row Data — only for APPEND_ROW */}
            {operation === "APPEND_ROW" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label>Columns</Label>
                  {rowData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        className="w-20"
                        placeholder="A"
                        value={item.column}
                        onChange={(e) =>
                          handleColumnChange(index, "column", e.target.value)
                        }
                      />
                      <span className="text-muted-foreground text-sm">→</span>
                      <Input
                        className="flex-1"
                        placeholder="{{body.name}}"
                        value={item.value}
                        onChange={(e) =>
                          handleColumnChange(index, "value", e.target.value)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleRemoveColumn(index)}
                        disabled={rowData.length <= 1}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddColumn}
                    className="w-full"
                  >
                    <PlusIcon className="size-4 mr-2" />
                    Add column
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Use {"{{variable}}"} to insert data from previous nodes
                  </p>
                </div>
              </>
            )}

            {/* Variable hints */}
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Available variables:
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {"{{body.*}}"} {"{{headers.*}}"} {"{{output.*}}"}
              </p>
            </div>

            {/* Save Button */}
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={!isValid || upsertMutation.isPending}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
