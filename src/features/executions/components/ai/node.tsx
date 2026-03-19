"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { AIDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { useParams } from "next/navigation"
import type { AIProvider } from "@/generated/prisma"

export interface AIBaseNodeProps {
  provider: AIProvider
  displayName: string
  icon: string
  channelName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshToken: () => Promise<any>
}

type AINodeData = {
  variableName?: string
  credentialId?: string
  systemPrompt?: string
  userPrompt?: string
  imagePrompt?: string
  embeddingInput?: string
  audioUrl?: string
  classifyLabels?: string
  operation?: string
  model?: string
}

type AINodeType = Node<AINodeData>

function AIBaseNodeInner(
  props: NodeProps<AINodeType> & AIBaseNodeProps,
) {
  const {
    provider,
    displayName,
    icon,
    channelName,
    refreshToken,
    ...nodeProps
  } = props

  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: channelName,
    topic: "status",
    refreshToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (values: Record<string, unknown>) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return { ...node, data: { ...node.data, ...values } }
        }
        return node
      }),
    )
  }

  const nodeData = nodeProps.data
  const modelLabel = nodeData?.model ? ` (${nodeData.model})` : ""
  
  const activePrompt = nodeData?.userPrompt || nodeData?.imagePrompt || nodeData?.embeddingInput || nodeData?.audioUrl || nodeData?.classifyLabels

  const description = activePrompt
    ? `${nodeData.operation ?? "CHAT"}${modelLabel}: ${activePrompt.slice(0, 45)}...`
    : nodeData?.operation ? `${nodeData.operation}${modelLabel}` : "Not configured"

  return (
    <>
      <AIDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData ?? {}}
        nodeId={props.id}
        workflowId={workflowId}
        provider={provider}
        displayName={displayName}
      />
      <BaseExecutionNode
        {...nodeProps}
        name={displayName}
        id={props.id}
        status={nodeStatus}
        icon={icon}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
}

export const AIBaseNode = memo(AIBaseNodeInner)
AIBaseNode.displayName = "AIBaseNode"
