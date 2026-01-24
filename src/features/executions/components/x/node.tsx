"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { XFormValues, XDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { fetchXRealtimeToken } from "./actions"
import { X_CHANNEL_NAME } from "@/inngest/channels/x"

type XNodeData = {
    apiKey?: string
    apiSecretKey?: string
    accessToken?: string
    accessTokenSecret?: string
    content?: string
}


type XNodeType = Node<XNodeData>;
export const XNode = memo((props: NodeProps<XNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()



    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: X_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchXRealtimeToken
    })
    const handleOpenSettings = () => setDialogOpen(true)
    const handleSubmit = (values: XFormValues) => {
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
    const description = nodeData?.content
        ? ` Tweet: ${nodeData.content.slice(0, 50)}...` : "Not configured"

    return (
        <>
            <XDialog
                onSubmit={handleSubmit}

                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                name="X (Twitter)"
                id={props.id}
                status={nodeStatus}
                icon="/logos/x.svg"
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}

            />
        </>
    )
})

XNode.displayName = "XNode"
