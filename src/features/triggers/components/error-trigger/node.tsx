import { AlertTriangleIcon } from "lucide-react"
import { BaseTriggerNode } from "../base-trigger-node"
import { memo, useState } from "react"
import { NodeProps } from "@xyflow/react"
import { ErrorTriggerDialog } from "./dialog"
import { useNodeStatus } from "../shared/hooks/use-node-status"
import { ERROR_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/error-trigger"
import { fetchErrorTriggerRealtimeToken } from "./actions"

export const ErrorTriggerNode = memo((props: NodeProps) => {
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: ERROR_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchErrorTriggerRealtimeToken
    })
    const [dialogOpen, setDialogOpen] = useState(false)
    const handleOpenSettings = () => {
        setDialogOpen(true)
    }
    return (
        <>
            <ErrorTriggerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
            <BaseTriggerNode
                {...props}
                icon={AlertTriangleIcon}
                name="When error occurs"
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

ErrorTriggerNode.displayName = "ErrorTriggerNode"
