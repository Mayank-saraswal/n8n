"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { Mail } from "lucide-react"
import { GmailFormValues, GmailDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchGmailRealtimeToken } from "./actions"
import { GMAIL_CHANNEL_NAME } from "@/inngest/channels/gmail"
import { useParams } from "next/navigation"

type GmailNodeData = {
    credentialId?: string
    to?: string
    subject?: string
    body?: string
    isHtml?: boolean
}

type GmailNodeType = Node<GmailNodeData>;
export const GmailNode = memo((props: NodeProps<GmailNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()
    const params = useParams()
    const workflowId = params.workflowId as string

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GMAIL_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGmailRealtimeToken
    })
    const handleOpenSettings = () => setDialogOpen(true)
    const handleSubmit = (values: GmailFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values
                    }
                }
            }
            return node
        }))
    }
    const nodeData = props.data
    const description = nodeData?.to
        ? `To: ${nodeData.to.slice(0, 30)}${nodeData.to.length > 30 ? "..." : ""}` : "Not configured"

    return (
        <>
            <GmailDialog
                onSubmit={handleSubmit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
                nodeId={props.id}
                workflowId={workflowId}
            />
            <BaseExecutionNode
                {...props}
                name="Gmail"
                id={props.id}
                status={nodeStatus}
                icon={Mail}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

GmailNode.displayName = "GmailNode"
