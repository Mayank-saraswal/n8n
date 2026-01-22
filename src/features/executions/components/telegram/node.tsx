"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { TelegramFormValues, TelegramDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { fetchTelegramRealtimeToken } from "./actions"
import { TELEGRAM_CHANNEL_NAME } from "@/inngest/channels/telegram"

type TelegramNodeData = {
    botToken?: string
    chatId?: string
    content?: string
}


type TelegramNodeType = Node<TelegramNodeData>;
export const TelegramNode = memo((props: NodeProps<TelegramNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()



    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: TELEGRAM_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchTelegramRealtimeToken
    })
    const handleOpenSettings = () => setDialogOpen(true)
    const handleSubmit = (values: TelegramFormValues) => {
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
        ? ` Send: ${nodeData.content.slice(0, 50)}...` : "Not configured"

    return (
        <>
            <TelegramDialog
                onSubmit={handleSubmit}

                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                name="Telegram"
                id={props.id}
                status={nodeStatus}
                icon="/logos/telegram.svg"
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}

            />
        </>
    )
})

TelegramNode.displayName = "TelegramNode"