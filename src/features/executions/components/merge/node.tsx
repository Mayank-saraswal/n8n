"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { Merge } from "lucide-react"
import { MergeDialog, type MergeConfig } from "./dialog"
import { useNodeStatusWithPayload } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchMergeRealtimeToken } from "./actions"
import { MERGE_CHANNEL_NAME } from "@/inngest/channels/merge"
import { useParams } from "next/navigation"

type MergeNodeData = {
  mergeMode?: string
  inputCount?: number
}

type MergeNodeType = Node<MergeNodeData>

export const MergeNode = memo((props: NodeProps<MergeNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const { status: nodeStatus } = useNodeStatusWithPayload({
    nodeId: props.id,
    channel: MERGE_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchMergeRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (data: MergeConfig) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              mergeMode: data.mergeMode,
              inputCount: data.inputCount,
            },
          }
        }
        return node
      })
    )
  }

  const nodeData = props.data
  let description = "Not configured"
  switch (nodeData?.mergeMode) {
    case "combine":
      description = "Combine all branches"
      break
    case "position":
      description = "Merge by position"
      break
    case "crossJoin":
      description = "Cross join (cartesian)"
      break
    case "keyMatch":
      description = "Keep key matches"
      break
    case "keyDiff":
      description = "Keep non-matches"
      break
  }

  if (nodeData?.inputCount && nodeData.inputCount > 2) {
    description += ` (${nodeData.inputCount} branches)`
  }

  return (
    <>
      <MergeDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Merge"
        id={props.id}
        status={nodeStatus}
        icon={Merge}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

MergeNode.displayName = "MergeNode"
