import { BaseTriggerNode } from "../base-trigger-node"
import { memo, useState } from "react"
import { NodeProps } from "@xyflow/react"
import { RazorpayTriggerDialog } from "./dialog"
import { useNodeStatus } from "../shared/hooks/use-node-status"
import { RAZORPAY_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/razorpay-trigger"
import { fetchRazorpayTriggerRealtimeToken } from "./actions"

export const RazorpayTriggerNode = memo((props: NodeProps) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: RAZORPAY_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchRazorpayTriggerRealtimeToken,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const handleOpenSettings = () => {
    setDialogOpen(true)
  }
  return (
    <>
      <RazorpayTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <BaseTriggerNode
        {...props}
        icon="/logos/razorpay.svg"
        name="Razorpay Trigger"
        status={nodeStatus}
        description="When Razorpay event occurs"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

RazorpayTriggerNode.displayName = "RazorpayTriggerNode"
