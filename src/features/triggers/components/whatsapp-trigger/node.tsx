import { BaseTriggerNode } from "../base-trigger-node"
import { memo, useState } from "react"
import { NodeProps } from "@xyflow/react"
import { WhatsAppTriggerDialog } from "./dialog"
import { useNodeStatus } from "../shared/hooks/use-node-status"
import { WHATSAPP_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/whatsapp-trigger"
import { fetchWhatsAppTriggerRealtimeToken } from "./actions"

export const WhatsAppTriggerNode = memo((props: NodeProps) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: WHATSAPP_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchWhatsAppTriggerRealtimeToken,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const handleOpenSettings = () => {
    setDialogOpen(true)
  }
  return (
    <>
      <WhatsAppTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <BaseTriggerNode
        {...props}
        icon="/logos/whatsapp.svg"
        name="WhatsApp Trigger"
        status={nodeStatus}
        description="When WhatsApp message received"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

WhatsAppTriggerNode.displayName = "WhatsAppTriggerNode"
