"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { SlidersHorizontal } from "lucide-react"
import { SetVariableDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchSetVariableRealtimeToken } from "./actions"
import { SET_VARIABLE_CHANNEL_NAME } from "@/inngest/channels/set-variable"
import { useParams } from "next/navigation"

type SetVariableNodeData = {
  pairs?: Array<{ key: string; value: string }>
}

type SetVariableNodeType = Node<SetVariableNodeData>

export const SetVariableNode = memo((props: NodeProps<SetVariableNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SET_VARIABLE_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchSetVariableRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (pairs: Array<{ key: string; value: string }>) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              pairs,
            },
          }
        }
        return node
      })
    )
  }

  const nodeData = props.data
  const pairCount = nodeData?.pairs?.length ?? 0
  const description =
    pairCount > 0
      ? `${pairCount} variable${pairCount > 1 ? "s" : ""}`
      : "Not configured"

  return (
    <>
      <SetVariableDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Set Variable"
        id={props.id}
        status={nodeStatus}
        icon={SlidersHorizontal}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

SetVariableNode.displayName = "SetVariableNode"
