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
import { Switch } from "@/components/ui/switch"
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
import { CheckIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export interface GmailFormValues {
  credentialId?: string
  operation?: string
  variableName?: string
  to?: string
  cc?: string
  bcc?: string
  subject?: string
  body?: string
  isHtml?: boolean
  replyTo?: string
  messageId?: string
  threadId?: string
  searchQuery?: string
  maxResults?: number
  labelIds?: string
  includeBody?: boolean
  includeHeaders?: boolean
  attachmentData?: string
  attachmentName?: string
  attachmentMime?: string
}

interface GmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: GmailFormValues) => void
  defaultValues?: Partial<GmailFormValues>
  nodeId?: string
  workflowId?: string
}

type GmailOp =
  | "SEND" | "REPLY" | "FORWARD" | "CREATE_DRAFT"
  | "GET_MESSAGE" | "LIST_MESSAGES" | "SEARCH_MESSAGES"
  | "ADD_LABEL" | "REMOVE_LABEL"
  | "MARK_READ" | "MARK_UNREAD" | "MOVE_TO_TRASH"

const OUTPUT_HINTS: Record<string, string[]> = {
  SEND: ["messageId", "threadId"],
  REPLY: ["messageId", "threadId"],
  FORWARD: ["messageId", "threadId"],
  CREATE_DRAFT: ["draftId", "messageId"],
  GET_MESSAGE: ["messageId", "from", "subject", "date", "bodyText", "snippet", "isUnread", "attachmentCount"],
  LIST_MESSAGES: ["messages", "count", "messages.0.from", "messages.0.subject", "nextPageToken"],
  SEARCH_MESSAGES: ["messages", "count", "messages.0.from", "messages.0.subject", "nextPageToken"],
  ADD_LABEL: ["messageId", "currentLabels"],
  REMOVE_LABEL: ["messageId", "currentLabels"],
  MARK_READ: ["messageId"],
  MARK_UNREAD: ["messageId"],
  MOVE_TO_TRASH: ["messageId"],
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

  // State for all fields
  const [credentialId, setCredentialId] = useState(defaultValues.credentialId || "")
  const [operation, setOperation] = useState<GmailOp>((defaultValues.operation as GmailOp) || "SEND")
  const [variableName, setVariableName] = useState(defaultValues.variableName || "gmail")
  const [to, setTo] = useState(defaultValues.to || "")
  const [cc, setCc] = useState(defaultValues.cc || "")
  const [bcc, setBcc] = useState(defaultValues.bcc || "")
  const [subject, setSubject] = useState(defaultValues.subject || "")
  const [body, setBody] = useState(defaultValues.body || "")
  const [isHtml, setIsHtml] = useState(defaultValues.isHtml ?? false)
  const [replyTo, setReplyTo] = useState(defaultValues.replyTo || "")
  const [messageId, setMessageId] = useState(defaultValues.messageId || "")
  const [threadId, setThreadId] = useState(defaultValues.threadId || "")
  const [searchQuery, setSearchQuery] = useState(defaultValues.searchQuery || "")
  const [maxResults, setMaxResults] = useState(defaultValues.maxResults ?? 10)
  const [labelIds, setLabelIds] = useState(defaultValues.labelIds || "")
  const [includeBody, setIncludeBody] = useState(defaultValues.includeBody ?? true)
  const [includeHeaders, setIncludeHeaders] = useState(defaultValues.includeHeaders ?? false)
  const [attachmentData, setAttachmentData] = useState(defaultValues.attachmentData || "")
  const [attachmentName, setAttachmentName] = useState(defaultValues.attachmentName || "")
  const [attachmentMime, setAttachmentMime] = useState(defaultValues.attachmentMime || "application/octet-stream")
  const [saved, setSaved] = useState(false)

  const { data: credentials, isLoading: isLoadingCredentials } =
    useQuery(trpc.gmail.getCredentials.queryOptions())

  const { data: config, isLoading } = useQuery(
    trpc.gmail.getByNodeId.queryOptions(
      { nodeId: nodeId! },
      { enabled: open && !!nodeId }
    )
  )

  // Pre-fill from DB config when loaded
  useEffect(() => {
    if (config) {
      setCredentialId(config.credentialId || "")
      setOperation(config.operation as GmailOp)
      setVariableName(config.variableName || "gmail")
      setTo(config.to)
      setCc(config.cc)
      setBcc(config.bcc)
      setSubject(config.subject)
      setBody(config.body)
      setIsHtml(config.isHtml)
      setReplyTo(config.replyTo)
      setMessageId(config.messageId)
      setThreadId(config.threadId)
      setSearchQuery(config.searchQuery)
      setMaxResults(config.maxResults)
      setLabelIds(config.labelIds)
      setIncludeBody(config.includeBody)
      setIncludeHeaders(config.includeHeaders)
      setAttachmentData(config.attachmentData)
      setAttachmentName(config.attachmentName)
      setAttachmentMime(config.attachmentMime)
    }
  }, [config])

  // Reset when dialog opens with defaultValues
  useEffect(() => {
    if (open && !config) {
      setCredentialId(defaultValues.credentialId || "")
      setOperation((defaultValues.operation as GmailOp) || "SEND")
      setVariableName(defaultValues.variableName || "gmail")
      setTo(defaultValues.to || "")
      setCc(defaultValues.cc || "")
      setBcc(defaultValues.bcc || "")
      setSubject(defaultValues.subject || "")
      setBody(defaultValues.body || "")
      setIsHtml(defaultValues.isHtml ?? false)
      setReplyTo(defaultValues.replyTo || "")
      setMessageId(defaultValues.messageId || "")
      setThreadId(defaultValues.threadId || "")
      setSearchQuery(defaultValues.searchQuery || "")
      setMaxResults(defaultValues.maxResults ?? 10)
      setLabelIds(defaultValues.labelIds || "")
      setIncludeBody(defaultValues.includeBody ?? true)
      setIncludeHeaders(defaultValues.includeHeaders ?? false)
      setAttachmentData(defaultValues.attachmentData || "")
      setAttachmentName(defaultValues.attachmentName || "")
      setAttachmentMime(defaultValues.attachmentMime || "application/octet-stream")
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

  const isValid = !!credentialId.trim()

  const handleSave = () => {
    if (!isValid) return

    const values: GmailFormValues = {
      credentialId, operation, variableName,
      to, cc, bcc, subject, body, isHtml,
      replyTo, messageId, threadId,
      searchQuery, maxResults, labelIds,
      includeBody, includeHeaders,
      attachmentData, attachmentName, attachmentMime,
    }

    onSubmit(values)

    if (workflowId && nodeId) {
      upsertMutation.mutate({
        workflowId,
        nodeId,
        credentialId,
        operation,
        variableName,
        to, cc, bcc, subject, body, isHtml,
        replyTo, messageId, threadId,
        searchQuery, maxResults, labelIds,
        includeBody, includeHeaders,
        attachmentData, attachmentName, attachmentMime,
      })
    }
  }

  const v = variableName || "gmail"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gmail — Email Integration</DialogTitle>
          <DialogDescription>
            Send, read, search, and organize emails with Gmail
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* 1. Variable Name */}
            <div className="space-y-2">
              <Label>Variable Name</Label>
              <Input
                placeholder="gmail"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {`Reference as {{${v}.messageId}}, {{${v}.subject}}`}
              </p>
            </div>

            <Separator />

            {/* 2. Credential Selector */}
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
              {!credentials?.length && !isLoadingCredentials && (
                <p className="text-xs text-muted-foreground">
                  No Gmail credentials found.
                </p>
              )}
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

            <Separator />

            {/* 3. Operation (grouped) */}
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select
                value={operation}
                onValueChange={(val) => setOperation(val as GmailOp)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Send &amp; Draft</SelectLabel>
                    <SelectItem value="SEND">Send Email</SelectItem>
                    <SelectItem value="REPLY">Reply to Email</SelectItem>
                    <SelectItem value="FORWARD">Forward Email</SelectItem>
                    <SelectItem value="CREATE_DRAFT">Create Draft</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Read &amp; Search</SelectLabel>
                    <SelectItem value="GET_MESSAGE">Get Email</SelectItem>
                    <SelectItem value="LIST_MESSAGES">List Emails</SelectItem>
                    <SelectItem value="SEARCH_MESSAGES">Search Emails</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Organize</SelectLabel>
                    <SelectItem value="ADD_LABEL">Add Label</SelectItem>
                    <SelectItem value="REMOVE_LABEL">Remove Label</SelectItem>
                    <SelectItem value="MARK_READ">Mark as Read</SelectItem>
                    <SelectItem value="MARK_UNREAD">Mark as Unread</SelectItem>
                    <SelectItem value="MOVE_TO_TRASH">Move to Trash</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* 4. Dynamic fields based on operation */}

            {/* ── SEND ── */}
            {operation === "SEND" && (
              <>
                <div className="space-y-2">
                  <Label>To *</Label>
                  <Input
                    placeholder="customer@example.com or {{sheet.email}}"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CC</Label>
                  <Input
                    placeholder="cc@example.com"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>BCC</Label>
                  <Input
                    placeholder="bcc@example.com"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    placeholder="Your subject here"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {"Supports {{variables}}"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Body *</Label>
                  <Textarea
                    className="min-h-[150px]"
                    placeholder="Write your email body here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isHtml} onCheckedChange={setIsHtml} />
                  <Label>HTML Mode</Label>
                </div>
                <p className="text-xs text-muted-foreground -mt-3">
                  Enable to send HTML email
                </p>
                <div className="space-y-2">
                  <Label>Attachment Filename</Label>
                  <Input
                    placeholder="invoice.pdf"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no attachment
                  </p>
                </div>
                {attachmentName && (
                  <>
                    <div className="space-y-2">
                      <Label>Attachment Content</Label>
                      <Textarea
                        className="min-h-[80px] font-mono"
                        placeholder="Base64 encoded content or plain text"
                        value={attachmentData}
                        onChange={(e) => setAttachmentData(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>MIME Type</Label>
                      <Input
                        placeholder="application/pdf"
                        value={attachmentMime}
                        onChange={(e) => setAttachmentMime(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── REPLY ── */}
            {operation === "REPLY" && (
              <>
                <div className="space-y-2">
                  <Label>Message ID *</Label>
                  <Input
                    placeholder="{{gmail.messageId}}"
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    ID of the email you want to reply to
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Reply Body *</Label>
                  <Textarea
                    className="min-h-[150px]"
                    placeholder="Write your reply..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isHtml} onCheckedChange={setIsHtml} />
                  <Label>HTML Mode</Label>
                </div>
                <div className="space-y-2">
                  <Label>Override Reply-To</Label>
                  <Input
                    placeholder="reply@example.com"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to reply to original sender
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>CC</Label>
                  <Input
                    placeholder="cc@example.com"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ── FORWARD ── */}
            {operation === "FORWARD" && (
              <>
                <div className="space-y-2">
                  <Label>Message ID *</Label>
                  <Input
                    placeholder="{{gmail.messageId}}"
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Forward To *</Label>
                  <Input
                    placeholder="forward-to@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Note</Label>
                  <Textarea
                    className="min-h-[100px]"
                    placeholder="Optional note prepended before the forwarded message"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Prepended before the forwarded message
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isHtml} onCheckedChange={setIsHtml} />
                  <Label>HTML Mode</Label>
                </div>
              </>
            )}

            {/* ── GET_MESSAGE ── */}
            {operation === "GET_MESSAGE" && (
              <>
                <div className="space-y-2">
                  <Label>Message ID *</Label>
                  <Input
                    placeholder="{{gmail.messageId}}"
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={includeBody} onCheckedChange={setIncludeBody} />
                  <Label>Include Full Body</Label>
                </div>
                {!includeBody && (
                  <p className="text-xs text-muted-foreground -mt-3">
                    Only subject, from, date returned (faster)
                  </p>
                )}
              </>
            )}

            {/* ── LIST_MESSAGES ── */}
            {operation === "LIST_MESSAGES" && (
              <>
                <div className="space-y-2">
                  <Label>Max Results</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={maxResults}
                    onChange={(e) => setMaxResults(Math.min(50, Math.max(1, parseInt(e.target.value) || 10)))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Filter Labels</Label>
                  <Input
                    placeholder="INBOX,UNREAD"
                    value={labelIds}
                    onChange={(e) => setLabelIds(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated label IDs. Leave empty for all mail
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Search Filter</Label>
                  <Input
                    placeholder="from:boss@company.com"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional Gmail query to filter list
                  </p>
                </div>
              </>
            )}

            {/* ── SEARCH_MESSAGES ── */}
            {operation === "SEARCH_MESSAGES" && (
              <>
                <div className="space-y-2">
                  <Label>Search Query *</Label>
                  <Input
                    placeholder="from:vendor@example.com has:attachment"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 space-y-1 dark:border-blue-900 dark:bg-blue-950/30">
                  <p className="text-xs font-medium text-muted-foreground">Gmail query examples:</p>
                  <div className="text-xs text-muted-foreground font-mono space-y-0.5">
                    <p>from:user@example.com — from specific sender</p>
                    <p>to:me — sent to you</p>
                    <p>subject:Invoice — subject contains</p>
                    <p>is:unread — unread only</p>
                    <p>has:attachment — has files</p>
                    <p>after:2024/01/01 — after date</p>
                    <p>label:important — has label</p>
                    <p>newer_than:7d — last 7 days</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Max Results</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={maxResults}
                    onChange={(e) => setMaxResults(Math.min(50, Math.max(1, parseInt(e.target.value) || 10)))}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={includeBody} onCheckedChange={setIncludeBody} />
                  <Label>Include Full Body</Label>
                </div>
              </>
            )}

            {/* ── ADD_LABEL ── */}
            {operation === "ADD_LABEL" && (
              <>
                <div className="space-y-2">
                  <Label>Message ID *</Label>
                  <Input
                    placeholder="{{gmail.messageId}}"
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label IDs *</Label>
                  <Input
                    placeholder="STARRED,IMPORTANT or custom_label_id"
                    value={labelIds}
                    onChange={(e) => setLabelIds(e.target.value)}
                  />
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 space-y-1 dark:border-blue-900 dark:bg-blue-950/30">
                  <p className="text-xs font-medium text-muted-foreground">Label info:</p>
                  <p className="text-xs text-muted-foreground">
                    Built-in labels: STARRED, IMPORTANT, INBOX, SPAM, TRASH, UNREAD
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Custom label IDs can be found in Gmail Settings → Labels
                  </p>
                </div>
              </>
            )}

            {/* ── REMOVE_LABEL ── */}
            {operation === "REMOVE_LABEL" && (
              <>
                <div className="space-y-2">
                  <Label>Message ID *</Label>
                  <Input
                    placeholder="{{gmail.messageId}}"
                    value={messageId}
                    onChange={(e) => setMessageId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label IDs *</Label>
                  <Input
                    placeholder="UNREAD,SPAM"
                    value={labelIds}
                    onChange={(e) => setLabelIds(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ── MARK_READ / MARK_UNREAD / MOVE_TO_TRASH ── */}
            {(operation === "MARK_READ" || operation === "MARK_UNREAD" || operation === "MOVE_TO_TRASH") && (
              <div className="space-y-2">
                <Label>Message ID *</Label>
                <Input
                  placeholder="{{gmail.messageId}}"
                  value={messageId}
                  onChange={(e) => setMessageId(e.target.value)}
                />
              </div>
            )}

            {/* ── CREATE_DRAFT ── */}
            {operation === "CREATE_DRAFT" && (
              <>
                <div className="space-y-2">
                  <Label>To *</Label>
                  <Input
                    placeholder="customer@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CC</Label>
                  <Input
                    placeholder="cc@example.com"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>BCC</Label>
                  <Input
                    placeholder="bcc@example.com"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Draft subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea
                    className="min-h-[150px]"
                    placeholder="Write your draft body here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isHtml} onCheckedChange={setIsHtml} />
                  <Label>HTML Mode</Label>
                </div>
              </>
            )}

            {/* 5. Output variables */}
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Output variables:
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {OUTPUT_HINTS[operation]?.map((f) => `{{${v}.${f}}}`).join("  ") ?? ""}
              </p>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
