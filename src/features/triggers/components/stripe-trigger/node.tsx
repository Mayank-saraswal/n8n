import { BaseTriggerNode } from "../base-trigger-node"
import { memo , useState } from "react"
import { NodeProps } from "@xyflow/react"
import { StripeTriggerDialog } from "./dialog"
import { useNodeStatus } from "./hooks/use-node-status"
import { fetchStripeTriggerRealtimeToken } from "./actions"
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger"


export const StripeTriggerNode = memo((props:NodeProps)=>{
     const nodeStatus = useNodeStatus({
                nodeId: props.id,
                channel:STRIPE_TRIGGER_CHANNEL_NAME,
                topic:"status",
                refreshToken : fetchStripeTriggerRealtimeToken
            })
    const [dialogOpen , setDialogOpen] = useState(false)
    const handleOpenSettings = ()=>{
        setDialogOpen(true)
    }
    return(
        <>
        <StripeTriggerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
        
        />
        <BaseTriggerNode
            {...props}
            icon="/logos/stripe.svg"
            name = "Stripe"
            status = {nodeStatus}
            description="When stripe event is captured"

            onSettings={handleOpenSettings}
            onDoubleClick = {handleOpenSettings}
            />

        </>
        )
})