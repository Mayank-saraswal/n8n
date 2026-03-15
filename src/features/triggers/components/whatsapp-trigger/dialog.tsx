"use client"
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
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CopyIcon, Loader2Icon } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useReactFlow } from "@xyflow/react"
import { NodeType } from "@/generated/prisma"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WHATSAPP_MESSAGE_TYPES = [
  "text",
  "image",
  "audio",
  "video",
  "document",
  "location",
  "contacts",
  "sticker",
  "reaction",
  "interactive",
  "button",
]

export const WhatsAppTriggerDialog = ({
  open,
  onOpenChange,
}: Props) => {
  const params = useParams()
  const workflowId = params.workflowId as string
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { getNodes } = useReactFlow()

  const nodeId = getNodes().find(
    (n) => n.type === NodeType.WHATSAPP_TRIGGER
  )?.id

  const { data: triggerConfig, isLoading } = useQuery(
    trpc.whatsappTrigger.getByNodeId.queryOptions(
      { nodeId: nodeId ?? "" },
      { enabled: open && !!nodeId }
    )
  )

  const upsertTrigger = useMutation(
    trpc.whatsappTrigger.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.whatsappTrigger.getByNodeId.queryOptions({
            nodeId: nodeId ?? "",
          })
        )
        toast.success("WhatsApp trigger saved")
      },
    })
  )

  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [variableName, setVariableName] = useState("whatsappTrigger")

  useEffect(() => {
    if (triggerConfig) {
      setPhoneNumberId(triggerConfig.phoneNumberId)
      setVariableName(triggerConfig.variableName || "whatsappTrigger")
    }
  }, [triggerConfig])

  useEffect(() => {
    if (open && !isLoading && !triggerConfig && nodeId) {
      upsertTrigger.mutate({
        nodeId,
        workflowId,
        phoneNumberId: "",
        activeEvents: [],
        messageTypes: [],
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLoading, triggerConfig, nodeId, workflowId])

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const webhookUrl = triggerConfig
    ? `${baseUrl}/api/webhooks/whatsapp/${triggerConfig.webhookId}`
    : "Loading..."

  const verifyToken = triggerConfig?.verifyToken ?? "Loading..."

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch {
      toast.error(`Failed to copy ${label}`)
    }
  }

  const handleSave = () => {
    if (!nodeId) return
    upsertTrigger.mutate({
      nodeId,
      workflowId,
      phoneNumberId,
      activeEvents: [],
      messageTypes: [],
      variableName,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>WhatsApp Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook in your Meta Developer App to trigger this
            workflow on WhatsApp events
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-webhook-url">Callback URL</Label>
              <div className="flex gap-2">
                <Input
                  id="whatsapp-webhook-url"
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(webhookUrl, "Callback URL")}
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-verify-token">Verify Token</Label>
              <div className="flex gap-2">
                <Input
                  id="whatsapp-verify-token"
                  value={verifyToken}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(verifyToken, "Verify Token")}
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this token when configuring the webhook in Meta Developer
                Dashboard
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone-number-id">
                Phone Number ID (optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="whatsapp-phone-number-id"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="Leave empty to receive from all numbers"
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Filter to a specific phone number. Leave empty for all numbers.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-variable-name">
                Variable Name
              </Label>
              <div className="flex gap-2">
                <Input
                  id="whatsapp-variable-name"
                  value={variableName}
                  onChange={(e) => setVariableName(e.target.value)}
                  placeholder="whatsappTrigger"
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Name used to reference trigger data in downstream nodes.
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Setup instructions:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open Meta Developer Dashboard</li>
                <li>Go to your App → WhatsApp → Configuration</li>
                <li>Click &quot;Edit&quot; on Webhook</li>
                <li>Paste the Callback URL above</li>
                <li>Paste the Verify Token above</li>
                <li>Click &quot;Verify and Save&quot;</li>
                <li>Subscribe to &quot;messages&quot; webhook field</li>
              </ol>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Available Variables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {`{{${variableName}.from}}`}
                  </code>
                  - Sender phone number
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {`{{${variableName}.senderName}}`}
                  </code>
                  - Sender profile name
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {`{{${variableName}.type}}`}
                  </code>
                  - Message type (text, image, audio, etc.)
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {`{{${variableName}.text}}`}
                  </code>
                  - Text body (for text messages)
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {`{{${variableName}.mediaId}}`}
                  </code>
                  - Media ID (for image/audio/video/document)
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {`{{json ${variableName}.raw}}`}
                  </code>
                  - Full raw message as JSON
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Supported Message Types</h4>
              <div className="flex flex-wrap gap-1">
                {WHATSAPP_MESSAGE_TYPES.map((type) => (
                  <code
                    key={type}
                    className="bg-background px-1.5 py-0.5 rounded text-xs"
                  >
                    {type}
                  </code>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
