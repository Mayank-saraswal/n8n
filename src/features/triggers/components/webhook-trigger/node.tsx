import { BaseTriggerNode } from "../base-trigger-node"
import { memo , useState } from "react"
import { NodeProps } from "@xyflow/react"
import { WebhookTriggerDialog } from "./dialog"
import { useNodeStatus } from "./hooks/use-node-status"
import { fetchWebhookTriggerRealtimeToken } from "./actions"
import { WEBHOOK_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/webhook-trigger"
import { LinkIcon } from "lucide-react"

export const WebhookTriggerNode = memo((props:NodeProps)=>{
     const nodeStatus = useNodeStatus({
                nodeId: props.id,
                channel:WEBHOOK_TRIGGER_CHANNEL_NAME,
                topic:"status",
                refreshToken : fetchWebhookTriggerRealtimeToken
            })
    const [dialogOpen , setDialogOpen] = useState(false)
    const handleOpenSettings = ()=>{
        setDialogOpen(true)
    }
    return(
        <>
        <WebhookTriggerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
        />
        <BaseTriggerNode
            {...props}
            icon={LinkIcon}
            name = "Webhook"
            status = {nodeStatus}
            description="When webhook is received"
            onSettings={handleOpenSettings}
            onDoubleClick = {handleOpenSettings}
            />
        </>
        )
})
