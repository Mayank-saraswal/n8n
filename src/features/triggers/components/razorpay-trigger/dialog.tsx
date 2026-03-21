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

const RAZORPAY_EVENTS = [
  "payment.authorized",
  "payment.captured",
  "payment.failed",
  "payment.pending",
  "payment.dispute.created",
  "payment.dispute.won",
  "payment.dispute.lost",
  "payment.dispute.closed",
  "payment.dispute.action_required",
  "payment.dispute.under_review",
  "order.paid",
  "invoice.paid",
  "invoice.partially_paid",
  "invoice.expired",
  "subscription.activated",
  "subscription.charged",
  "subscription.completed",
  "subscription.pending",
  "subscription.halted",
  "subscription.cancelled",
  "subscription.paused",
  "subscription.resumed",
  "refund.created",
  "refund.processed",
  "refund.failed",
  "settlement.processed",
  "virtual_account.credited",
  "virtual_account.closed",
  "qr_code.credited",
  "qr_code.closed",
  "transfer.processed",
  "transfer.settled",
  "transfer.reversed",
  "transfer.failed",
  "fund_account.validation.completed",
  "payout.processed",
  "payout.reversed",
  "payout.failed",
]

export const RazorpayTriggerDialog = ({
  open,
  onOpenChange,
}: Props) => {
  const params = useParams()
  const workflowId = params.workflowId as string
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { getNodes } = useReactFlow()

  const nodeId = getNodes().find(
    (n) => n.type === NodeType.RAZORPAY_TRIGGER
  )?.id

  const { data: triggerConfig, isLoading } = useQuery(
    trpc.razorpayTrigger.getByNodeId.queryOptions(
      { nodeId: nodeId ?? "" },
      { enabled: open && !!nodeId }
    )
  )

  const upsertTrigger = useMutation(
    trpc.razorpayTrigger.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.razorpayTrigger.getByNodeId.queryOptions({
            nodeId: nodeId ?? "",
          })
        )
        toast.success("Razorpay trigger saved")
      },
    })
  )

  const [webhookSecret, setWebhookSecret] = useState("")
  const [changingSecret, setChangingSecret] = useState(false)

  useEffect(() => {
    // Reset the change-secret form when the dialog opens/closes or data changes
    if (!open) {
      setChangingSecret(false)
      setWebhookSecret("")
    }
  }, [open])

  useEffect(() => {
    if (open && !isLoading && !triggerConfig && nodeId) {
      upsertTrigger.mutate({
        nodeId,
        workflowId,
        webhookSecret: "",
        activeEvents: [],
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLoading, triggerConfig, nodeId, workflowId])

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const webhookUrl = triggerConfig
    ? `${baseUrl}/api/webhooks/razorpay/${triggerConfig.webhookId}`
    : "Loading..."

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      toast.success("Webhook URL copied to clipboard")
    } catch {
      toast.error("Failed to copy URL")
    }
  }

  const handleSaveSecret = () => {
    if (!nodeId) return
    upsertTrigger.mutate({
      nodeId,
      workflowId,
      webhookSecret,
      activeEvents: [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Razorpay Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Razorpay Dashboard to trigger
            this workflow on payment events
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="razorpay-webhook-url">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="razorpay-webhook-url"
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="razorpay-webhook-secret">
                Webhook Secret (from Razorpay Dashboard)
              </Label>
              {!changingSecret && triggerConfig?.isSecretConfigured ? (
                <div className="flex gap-2 items-center">
                  <Input
                    id="razorpay-webhook-secret"
                    value="••••••••"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setChangingSecret(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="razorpay-webhook-secret"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder="Enter your Razorpay webhook secret"
                    className="font-mono text-sm"
                    type="password"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveSecret}
                    disabled={!webhookSecret.trim()}
                  >
                    Save
                  </Button>
                  {changingSecret && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setChangingSecret(false); setWebhookSecret("") }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Found in Razorpay Dashboard → Settings → Webhooks → Secret
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Setup instructions:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open your Razorpay Dashboard</li>
                <li>Go to Settings → Webhooks</li>
                <li>Click &quot;+ Add New Webhook&quot;</li>
                <li>Paste the Webhook URL above</li>
                <li>Enter a secret and paste it here too</li>
                <li>Select events to listen for (e.g., payment.captured)</li>
                <li>Save the webhook</li>
              </ol>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Available Variables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{razorpayTrigger.event}}"}
                  </code>
                  - Event type (e.g., payment.captured)
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{razorpayTrigger.payload}}"}
                  </code>
                  - Event payload data
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{razorpayTrigger.accountId}}"}
                  </code>
                  - Razorpay account ID
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{json razorpayTrigger}}"}
                  </code>
                  - Full event data as JSON
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Supported Events</h4>
              <div className="flex flex-wrap gap-1">
                {RAZORPAY_EVENTS.slice(0, 12).map((evt) => (
                  <code
                    key={evt}
                    className="bg-background px-1.5 py-0.5 rounded text-xs"
                  >
                    {evt}
                  </code>
                ))}
                <span className="text-xs text-muted-foreground self-center">
                  +{RAZORPAY_EVENTS.length - 12} more
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
