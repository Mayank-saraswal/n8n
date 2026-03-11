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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { CheckIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"

export interface GmailFormValues {
  credentialId?: string
  to?: string
  subject?: string
  body?: string
  isHtml?: boolean
}

interface GmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: GmailFormValues) => void
  defaultValues?: Partial<GmailFormValues>
  nodeId?: string
  workflowId?: string
}

export const GmailDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
  workflowId,
}: GmailDialogProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [credentialId, setCredentialId] = useState(defaultValues.credentialId || "")
  const [to, setTo] = useState(defaultValues.to || "")
  const [subject, setSubject] = useState(defaultValues.subject || "")
  const [body, setBody] = useState(defaultValues.body || "")
  const [isHtml, setIsHtml] = useState(defaultValues.isHtml || false)
  const [saved, setSaved] = useState(false)

  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.GMAIL)

  const { data: config, isLoading } = useQuery(
    trpc.gmail.getByNodeId.queryOptions(
      { nodeId: nodeId! },
      { enabled: open && !!nodeId }
    )
  )

  // Pre-fill from DB config when loaded
  useEffect(() => {
    if (config) {
      setCredentialId(config.credentialId)
      setTo(config.to)
      setSubject(config.subject)
      setBody(config.body)
      setIsHtml(config.isHtml)
    }
  }, [config])

  // Reset when dialog opens with defaultValues
  useEffect(() => {
    if (open && !config) {
      setCredentialId(defaultValues.credentialId || "")
      setTo(defaultValues.to || "")
      setSubject(defaultValues.subject || "")
      setBody(defaultValues.body || "")
      setIsHtml(defaultValues.isHtml || false)
    }
  }, [open, defaultValues, config])

  const upsertMutation = useMutation(
    trpc.gmail.upsert.mutationOptions({
      onSuccess: () => {
        if (nodeId) {
          queryClient.invalidateQueries(
            trpc.gmail.getByNodeId.queryOptions({ nodeId })
          )
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  )

  const isValid = credentialId.trim() && to.trim() && subject.trim()

  const handleSave = () => {
    if (!isValid) return

    // Update local node data
    onSubmit({ credentialId, to, subject, body, isHtml })

    // Persist to DB if we have a workflowId and nodeId
    if (workflowId && nodeId) {
      upsertMutation.mutate({
        workflowId,
        nodeId,
        credentialId,
        to,
        subject,
        body,
        isHtml,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gmail — Send Email</DialogTitle>
          <DialogDescription>
            Send an email using your Gmail account
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
              <Label>Gmail Credential</Label>
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
                + Add new Gmail credential
              </Link>
              {!credentialId && (
                <p className="text-xs text-destructive">
                  Credential is required
                </p>
              )}
            </div>

            {/* To */}
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use {"{{body.email}}"} to reference incoming data
              </p>
              {!to.trim() && (
                <p className="text-xs text-destructive">
                  To field is required
                </p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Your subject here"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use {"{{body.subject}}"} to reference incoming data
              </p>
              {!subject.trim() && (
                <p className="text-xs text-destructive">
                  Subject is required
                </p>
              )}
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                className="min-h-[120px] font-mono text-sm"
                placeholder="Write your email body here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supports: {"{{variables}}"} for simple values or{" "}
                {"{{json variable}}"} to stringify objects
              </p>
            </div>

            {/* Send as HTML */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gmail-is-html"
                checked={isHtml}
                onCheckedChange={(checked) => setIsHtml(checked === true)}
              />
              <Label htmlFor="gmail-is-html" className="text-sm font-normal">
                Send as HTML
              </Label>
            </div>

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
