"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { GlobeIcon } from "lucide-react"
import { PerplexityFormValues, PerplexityDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { fetchPerplexityRealtimeToken } from "./actions"
import { PERPLEXITY_CHANNEL_NAME } from "@/inngest/channels/perplexity"

type PerplexityNodeData = {
    credentialId?: string
    //    model?:string;
    variableName?: string
    systemPrompt?: string;
    userPrompt?: string;

}

type PerplexityNodeType = Node<PerplexityNodeData>;
export const PerplexityNode = memo((props: NodeProps<PerplexityNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()



    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: PERPLEXITY_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchPerplexityRealtimeToken
    })
    const handleOpenSettings = () => setDialogOpen(true)
    const handleSubmit = (values: PerplexityFormValues) => {
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
    const description = nodeData?.userPrompt
        ? `sonar-pro :${nodeData.userPrompt.slice(0, 50)}...` : "Not configured"

    return (
        <>
            <PerplexityDialog
                onSubmit={handleSubmit}

                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                name="Perplexity"
                id={props.id}
                status={nodeStatus}
                icon="/logos/perplexity.svg"
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}

            />
        </>
    )
})

PerplexityNode.displayName = "PerplexityNode"