"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { Code } from "lucide-react"
import { CodeDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchCodeRealtimeToken } from "./actions"
import { CODE_CHANNEL_NAME } from "@/inngest/channels/code"
import { useParams } from "next/navigation"

type CodeNodeData = {
  code?: string
}

type CodeNodeType = Node<CodeNodeData>

export const CodeNode = memo((props: NodeProps<CodeNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: CODE_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchCodeRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (code: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              code,
            },
          }
        }
        return node
      })
    )
  }

  const nodeData = props.data
  const firstLine = nodeData?.code?.split("\n").find((l) => {
    const trimmed = l.trim()
    return trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("/*")
  })
  const description = firstLine
    ? firstLine.length > 30
      ? `${firstLine.slice(0, 30)}…`
      : firstLine
    : "Click to add code"

  return (
    <>
      <CodeDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Code"
        id={props.id}
        status={nodeStatus}
        icon={Code}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

CodeNode.displayName = "CodeNode"
