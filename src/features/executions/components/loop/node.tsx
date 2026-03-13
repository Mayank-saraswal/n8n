"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { RepeatIcon } from "lucide-react"
import { LoopDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchLoopRealtimeToken } from "./actions"
import { LOOP_CHANNEL_NAME } from "@/inngest/channels/loop"
import { useParams } from "next/navigation"

type LoopNodeData = {
  inputPath?: string
  itemVariable?: string
  maxIterations?: number
}

type LoopNodeType = Node<LoopNodeData>

export const LoopNode = memo((props: NodeProps<LoopNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: LOOP_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchLoopRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (values: { inputPath: string; itemVariable: string; maxIterations: number }) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          }
        }
        return node
      })
    )
  }

  const nodeData = props.data
  const description = nodeData?.inputPath
    ? `Over ${nodeData.inputPath}`
    : "Click to configure"

  return (
    <>
      <LoopDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Loop"
        id={props.id}
        status={nodeStatus}
        icon={RepeatIcon}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

LoopNode.displayName = "LoopNode"
