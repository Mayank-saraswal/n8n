import {  MousePointerIcon } from "lucide-react"
import { BaseTriggerNode } from "../base-trigger-node"
import { memo , useState } from "react"
import { NodeProps } from "@xyflow/react"
import { ManualTriggerDialog } from "./dialog"
import { useNodeStatus } from "./hooks/use-node-status"
import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-trigger"
import { fetchManualTriggerRealtimeToken } from "./actions"


export const ManualTriggerNode = memo((props:NodeProps)=>{
    const nodeStatus = useNodeStatus({
            nodeId: props.id,
            channel:MANUAL_TRIGGER_CHANNEL_NAME,
            topic:"status",
            refreshToken : fetchManualTriggerRealtimeToken
        })
    const [dialogOpen , setDialogOpen] = useState(false)
    const handleOpenSettings = ()=>{
        setDialogOpen(true)
    }
    return(
        <>
        <ManualTriggerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
        
        />
        <BaseTriggerNode
            {...props}
            icon={MousePointerIcon}
            name = "When clicking 'Execute Node'"
            status = {nodeStatus}

            onSettings={handleOpenSettings}
            onDoubleClick = {handleOpenSettings}
            />

        </>
        )
})