import { BaseTriggerNode } from "../base-trigger-node"
import { memo , useState } from "react"
import { NodeProps } from "@xyflow/react"
import { ScheduleTriggerDialog } from "./dialog"
import { useNodeStatus } from "../shared/hooks/use-node-status"
import { fetchScheduleTriggerRealtimeToken } from "./actions"
import { SCHEDULE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/schedule-trigger"
import { ClockIcon } from "lucide-react"

export const ScheduleTriggerNode = memo((props:NodeProps)=>{
     const nodeStatus = useNodeStatus({
                nodeId: props.id,
                channel:SCHEDULE_TRIGGER_CHANNEL_NAME,
                topic:"status",
                refreshToken : fetchScheduleTriggerRealtimeToken
            })
    const [dialogOpen , setDialogOpen] = useState(false)
    const handleOpenSettings = ()=>{
        setDialogOpen(true)
    }
    return(
        <>
        <ScheduleTriggerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
        />
        <BaseTriggerNode
            {...props}
            icon={ClockIcon}
            name = "Schedule"
            status = {nodeStatus}
            description="Run on a time-based schedule"
            onSettings={handleOpenSettings}
            onDoubleClick = {handleOpenSettings}
            />
        </>
        )
})

ScheduleTriggerNode.displayName = "ScheduleTriggerNode"
