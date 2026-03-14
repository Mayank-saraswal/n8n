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
import { CredentialType, SlackOperation } from "@/generated/prisma"
import { CheckIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export interface SlackFormValues {
  credentialId?: string
  operation?: string
  variableName?: string
  channel?: string
  message?: string
  threadTs?: string
  messageTs?: string
  searchQuery?: string
  channelName?: string
  channelTopic?: string
  channelPurpose?: string
  userId?: string
  emoji?: string
  fileComment?: string
  webhookUrl?: string
}

interface SlackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SlackFormValues) => void
  defaultValues?: Partial<SlackFormValues>
  nodeId?: string
  workflowId?: string
}

type SlackOp = `${SlackOperation}`

const DEFAULT_OPERATION: SlackOp = "MESSAGE_SEND_WEBHOOK"

const OPERATION_LABELS: Record<SlackOp, string> = {
  MESSAGE_SEND_WEBHOOK: "Send Message (Webhook)",
  MESSAGE_SEND: "Send Message",
  MESSAGE_UPDATE: "Update Message",
  MESSAGE_DELETE: "Delete Message",
  MESSAGE_GET_PERMALINK: "Get Message Permalink",
  MESSAGE_SEARCH: "Search Messages",
  CHANNEL_CREATE: "Create Channel",
  CHANNEL_ARCHIVE: "Archive Channel",
  CHANNEL_UNARCHIVE: "Unarchive Channel",
  CHANNEL_INVITE: "Invite to Channel",
  CHANNEL_KICK: "Remove from Channel",
  CHANNEL_SET_TOPIC: "Set Channel Topic",
  CHANNEL_SET_PURPOSE: "Set Channel Purpose",
  CHANNEL_HISTORY: "Get Channel History",
  CHANNEL_INFO: "Get Channel Info",
  CHANNEL_LIST: "List Channels",
  CHANNEL_RENAME: "Rename Channel",
  USER_INFO: "Get User Info",
  USER_LIST: "List Users",
  USER_GET_PRESENCE: "Get User Presence",
  REACTION_ADD: "Add Reaction",
  REACTION_REMOVE: "Remove Reaction",
  REACTION_GET: "Get Reactions",
  FILE_UPLOAD: "Upload File",
  FILE_LIST: "List Files",
  FILE_INFO: "Get File Info",
  FILE_DELETE: "Delete File",
  CONVERSATION_OPEN: "Open Conversation",
}

const OPERATION_GROUPS: { label: string; ops: SlackOp[] }[] = [
  {
    label: "Messages",
    ops: [
      "MESSAGE_SEND_WEBHOOK",
      "MESSAGE_SEND",
      "MESSAGE_UPDATE",
      "MESSAGE_DELETE",
      "MESSAGE_GET_PERMALINK",
      "MESSAGE_SEARCH",
    ],
  },
  {
    label: "Channels",
    ops: [
      "CHANNEL_CREATE",
      "CHANNEL_ARCHIVE",
      "CHANNEL_UNARCHIVE",
      "CHANNEL_INVITE",
      "CHANNEL_KICK",
      "CHANNEL_SET_TOPIC",
      "CHANNEL_SET_PURPOSE",
      "CHANNEL_HISTORY",
      "CHANNEL_INFO",
      "CHANNEL_LIST",
      "CHANNEL_RENAME",
    ],
  },
  {
    label: "Users",
    ops: ["USER_INFO", "USER_LIST", "USER_GET_PRESENCE"],
  },
  {
    label: "Reactions",
    ops: ["REACTION_ADD", "REACTION_REMOVE", "REACTION_GET"],
  },
  {
    label: "Files",
    ops: ["FILE_UPLOAD", "FILE_LIST", "FILE_INFO", "FILE_DELETE"],
  },
  {
    label: "Conversations",
    ops: ["CONVERSATION_OPEN"],
  },
]

// Which fields each operation needs
const needsChannel = (op: SlackOp) =>
  [
    "MESSAGE_SEND",
    "MESSAGE_UPDATE",
    "MESSAGE_DELETE",
    "MESSAGE_GET_PERMALINK",
    "CHANNEL_ARCHIVE",
    "CHANNEL_UNARCHIVE",
    "CHANNEL_INVITE",
    "CHANNEL_KICK",
    "CHANNEL_SET_TOPIC",
    "CHANNEL_SET_PURPOSE",
    "CHANNEL_HISTORY",
    "CHANNEL_INFO",
    "CHANNEL_RENAME",
    "REACTION_ADD",
    "REACTION_REMOVE",
    "REACTION_GET",
    "FILE_UPLOAD",
    "FILE_LIST",
  ].includes(op)

const needsMessage = (op: SlackOp) =>
  [
    "MESSAGE_SEND_WEBHOOK",
    "MESSAGE_SEND",
    "MESSAGE_UPDATE",
    "FILE_UPLOAD",
  ].includes(op)

const needsMessageTs = (op: SlackOp) =>
  [
    "MESSAGE_UPDATE",
    "MESSAGE_DELETE",
    "MESSAGE_GET_PERMALINK",
    "REACTION_ADD",
    "REACTION_REMOVE",
    "REACTION_GET",
    "FILE_INFO",
    "FILE_DELETE",
  ].includes(op)

const needsUserId = (op: SlackOp) =>
  [
    "CHANNEL_INVITE",
    "CHANNEL_KICK",
    "USER_INFO",
    "USER_GET_PRESENCE",
    "CONVERSATION_OPEN",
  ].includes(op)

const needsEmoji = (op: SlackOp) =>
  ["REACTION_ADD", "REACTION_REMOVE"].includes(op)

const needsWebhookUrl = (op: SlackOp) => op === "MESSAGE_SEND_WEBHOOK"

const needsChannelName = (op: SlackOp) =>
  ["CHANNEL_CREATE", "CHANNEL_RENAME"].includes(op)

const needsCredential = (op: SlackOp) => op !== "MESSAGE_SEND_WEBHOOK"

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
  workflowId,
}: SlackDialogProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [credentialId, setCredentialId] = useState(
    defaultValues.credentialId || ""
  )
  const [operation, setOperation] = useState<SlackOp>(
    (defaultValues.operation as SlackOp) || DEFAULT_OPERATION
  )
  const [variableName, setVariableName] = useState(
    defaultValues.variableName || "slack"
  )
  const [channel, setChannel] = useState(defaultValues.channel || "")
  const [message, setMessage] = useState(defaultValues.message || "")
  const [threadTs, setThreadTs] = useState(defaultValues.threadTs || "")
  const [messageTs, setMessageTs] = useState(defaultValues.messageTs || "")
  const [searchQuery, setSearchQuery] = useState(
    defaultValues.searchQuery || ""
  )
  const [channelName, setChannelName] = useState(
    defaultValues.channelName || ""
  )
  const [channelTopic, setChannelTopic] = useState(
    defaultValues.channelTopic || ""
  )
  const [channelPurpose, setChannelPurpose] = useState(
    defaultValues.channelPurpose || ""
  )
  const [slackUserId, setSlackUserId] = useState(defaultValues.userId || "")
  const [emoji, setEmoji] = useState(defaultValues.emoji || "")
  const [fileComment, setFileComment] = useState(
    defaultValues.fileComment || ""
  )
  const [webhookUrl, setWebhookUrl] = useState(defaultValues.webhookUrl || "")
  const [saved, setSaved] = useState(false)

  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.SLACK)

  const { data: config, isLoading } = useQuery(
    trpc.slack.getByNodeId.queryOptions(
      { nodeId: nodeId! },
      { enabled: open && !!nodeId }
    )
  )

  // Pre-fill from DB config when loaded
  useEffect(() => {
    if (config) {
      setCredentialId(config.credentialId || "")
      setOperation(config.operation as SlackOp)
      setVariableName(config.variableName)
      setChannel(config.channel)
      setMessage(config.message)
      setThreadTs(config.threadTs)
      setMessageTs(config.messageTs)
      setSearchQuery(config.searchQuery)
      setChannelName(config.channelName)
      setChannelTopic(config.channelTopic)
      setChannelPurpose(config.channelPurpose)
      setSlackUserId(config.userId)
      setEmoji(config.emoji)
      setFileComment(config.fileComment)
      setWebhookUrl(config.webhookUrl)
    }
  }, [config])

  // Reset when dialog opens with defaultValues
  useEffect(() => {
    if (open && !config) {
      setCredentialId(defaultValues.credentialId || "")
      setOperation((defaultValues.operation as SlackOp) || DEFAULT_OPERATION)
      setVariableName(defaultValues.variableName || "slack")
      setChannel(defaultValues.channel || "")
      setMessage(defaultValues.message || "")
      setThreadTs(defaultValues.threadTs || "")
      setMessageTs(defaultValues.messageTs || "")
      setSearchQuery(defaultValues.searchQuery || "")
      setChannelName(defaultValues.channelName || "")
      setChannelTopic(defaultValues.channelTopic || "")
      setChannelPurpose(defaultValues.channelPurpose || "")
      setSlackUserId(defaultValues.userId || "")
      setEmoji(defaultValues.emoji || "")
      setFileComment(defaultValues.fileComment || "")
      setWebhookUrl(defaultValues.webhookUrl || "")
    }
  }, [open, defaultValues, config])

  const upsertMutation = useMutation(
    trpc.slack.upsert.mutationOptions({
      onSuccess: () => {
        if (nodeId) {
          queryClient.invalidateQueries(
            trpc.slack.getByNodeId.queryOptions({ nodeId })
          )
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  )

  const isValid = needsCredential(operation)
    ? !!credentialId.trim()
    : !!webhookUrl.trim() || !!credentialId.trim()

  const handleSave = () => {
    if (!isValid) return

    const values: SlackFormValues = {
      credentialId,
      operation,
      variableName,
      channel,
      message,
      threadTs,
      messageTs,
      searchQuery,
      channelName,
      channelTopic,
      channelPurpose,
      userId: slackUserId,
      emoji,
      fileComment,
      webhookUrl,
    }

    onSubmit(values)

    if (workflowId && nodeId) {
      upsertMutation.mutate({
        workflowId,
        nodeId,
        credentialId: credentialId || undefined,
        operation,
        variableName,
        channel,
        message,
        threadTs,
        messageTs,
        searchQuery,
        channelName,
        channelTopic,
        channelPurpose,
        userId: slackUserId,
        emoji,
        fileComment,
        webhookUrl,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Slack Configuration</DialogTitle>
          <DialogDescription>
            Configure Slack API operations for this node
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Operation Selector */}
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select
                value={operation}
                onValueChange={(val) => setOperation(val as SlackOp)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATION_GROUPS.map((group) => (
                    <div key={group.label}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {group.label}
                      </div>
                      {group.ops.map((op) => (
                        <SelectItem key={op} value={op}>
                          {OPERATION_LABELS[op]}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Credential Selector — shown for API operations */}
            {needsCredential(operation) && (
              <div className="space-y-2">
                <Label>Slack Credential (Bot Token)</Label>
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
                    No Slack credentials found.
                  </p>
                )}
                <Link
                  href="/credentials/new"
                  className="text-xs text-primary hover:underline"
                >
                  + Add new Slack credential
                </Link>
                {!credentialId && (
                  <p className="text-xs text-destructive">
                    Credential is required for API operations
                  </p>
                )}
              </div>
            )}

            {/* Webhook URL — shown for webhook operation */}
            {needsWebhookUrl(operation) && (
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://hooks.slack.com/services/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get this from Slack → Apps → Incoming Webhooks. Or use a Slack
                  credential with type &quot;webhook&quot;.
                </p>
              </div>
            )}

            {/* Variable Name */}
            <div className="space-y-2">
              <Label>Variable Name</Label>
              <Input
                placeholder="slack"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Access results via{" "}
                {`{{${variableName || "slack"}.operation}}`}
              </p>
            </div>

            <Separator />

            {/* Channel ID */}
            {needsChannel(operation) && (
              <div className="space-y-2">
                <Label>Channel ID</Label>
                <Input
                  placeholder="C01234567 or {{body.channelId}}"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Slack channel ID (starts with C). Use {"{{variables}}"} for
                  dynamic values.
                </p>
              </div>
            )}

            {/* Channel Name */}
            {needsChannelName(operation) && (
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input
                  placeholder="general"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                />
              </div>
            )}

            {/* Message / Content */}
            {needsMessage(operation) && (
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  className="min-h-[120px] font-mono text-sm"
                  placeholder="Hello {{body.name}}! Your order is confirmed."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Supports {"{{variables}}"} for dynamic content
                </p>
              </div>
            )}

            {/* Thread TS */}
            {operation === "MESSAGE_SEND" && (
              <div className="space-y-2">
                <Label>Thread TS (optional)</Label>
                <Input
                  placeholder="1234567890.123456"
                  value={threadTs}
                  onChange={(e) => setThreadTs(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Reply in thread. Use {"{{slack.ts}}"} from a previous message.
                </p>
              </div>
            )}

            {/* Message TS */}
            {needsMessageTs(operation) && (
              <div className="space-y-2">
                <Label>
                  {["FILE_INFO", "FILE_DELETE"].includes(operation)
                    ? "File ID"
                    : "Message TS"}
                </Label>
                <Input
                  placeholder={
                    ["FILE_INFO", "FILE_DELETE"].includes(operation)
                      ? "F01234567"
                      : "1234567890.123456"
                  }
                  value={messageTs}
                  onChange={(e) => setMessageTs(e.target.value)}
                />
              </div>
            )}

            {/* Search Query */}
            {operation === "MESSAGE_SEARCH" && (
              <div className="space-y-2">
                <Label>Search Query</Label>
                <Input
                  placeholder="from:@user in:#channel hello"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Channel Topic */}
            {operation === "CHANNEL_SET_TOPIC" && (
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  placeholder="Team discussions"
                  value={channelTopic}
                  onChange={(e) => setChannelTopic(e.target.value)}
                />
              </div>
            )}

            {/* Channel Purpose */}
            {operation === "CHANNEL_SET_PURPOSE" && (
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input
                  placeholder="A channel for team discussions"
                  value={channelPurpose}
                  onChange={(e) => setChannelPurpose(e.target.value)}
                />
              </div>
            )}

            {/* User ID */}
            {needsUserId(operation) && (
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  placeholder="U01234567 or {{body.userId}}"
                  value={slackUserId}
                  onChange={(e) => setSlackUserId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Slack user ID (starts with U). For invite, comma-separate
                  multiple IDs.
                </p>
              </div>
            )}

            {/* Emoji */}
            {needsEmoji(operation) && (
              <div className="space-y-2">
                <Label>Emoji Name</Label>
                <Input
                  placeholder="thumbsup"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Emoji name without colons (e.g. thumbsup, heart, rocket)
                </p>
              </div>
            )}

            {/* File Comment / Title */}
            {operation === "FILE_UPLOAD" && (
              <div className="space-y-2">
                <Label>File Title</Label>
                <Input
                  placeholder="report.txt"
                  value={fileComment}
                  onChange={(e) => setFileComment(e.target.value)}
                />
              </div>
            )}

            {/* Output hints */}
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Output variables:
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {`{{${variableName || "slack"}.operation}}`}
                {"  "}
                {`{{${variableName || "slack"}.ok}}`}
                {"  "}
                {`{{${variableName || "slack"}.timestamp}}`}
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
