import { BaseTriggerNode } from "../base-trigger-node"
import { memo , useState } from "react"
import { NodeProps } from "@xyflow/react"
import { GoogleFormTriggerDialog } from "./dialog"
import { useNodeStatus } from "./hooks/use-node-status"
import { fetchGoogleFormTriggerRealtimeToken } from "./actions"
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger"


export const GoogleFormTrigger = memo((props:NodeProps)=>{
     const nodeStatus = useNodeStatus({
                nodeId: props.id,
                channel:GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
                topic:"status",
                refreshToken : fetchGoogleFormTriggerRealtimeToken
            })
    const [dialogOpen , setDialogOpen] = useState(false)
    const handleOpenSettings = ()=>{
        setDialogOpen(true)
    }
    return(
        <>
        <GoogleFormTriggerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
        
        />
        <BaseTriggerNode
            {...props}
            icon="/logos/googleform.svg"
            name = "Google Form"
            status = {nodeStatus}
            description="When form is submitted"

            onSettings={handleOpenSettings}
            onDoubleClick = {handleOpenSettings}
            />

        </>
        )
})