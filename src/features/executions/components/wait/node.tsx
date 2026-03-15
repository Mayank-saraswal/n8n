"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { Timer } from "lucide-react"
import { WaitDialog, type WaitConfig } from "./dialog"
import { useNodeStatusWithPayload } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchWaitRealtimeToken } from "./actions"
import { WAIT_CHANNEL_NAME } from "@/inngest/channels/wait"
import { useParams } from "next/navigation"

type WaitNodeData = {
  waitMode?: string
  duration?: number
  durationUnit?: string
}

type WaitNodeType = Node<WaitNodeData>

export const WaitNode = memo((props: NodeProps<WaitNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const { status: nodeStatus, payload } = useNodeStatusWithPayload({
    nodeId: props.id,
    channel: WAIT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchWaitRealtimeToken,
  })

  const resumeUrl = payload?.resumeUrl as string | undefined

  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (data: WaitConfig) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              waitMode: data.waitMode,
              duration: data.duration,
              durationUnit: data.durationUnit,
            },
          }
        }
        return node
      })
    )
  }

  const nodeData = props.data
  let description = "Not configured"
  if (nodeData?.waitMode === "duration") {
    description = `Wait ${nodeData.duration ?? 30} ${nodeData.durationUnit ?? "minutes"}`
  } else if (nodeData?.waitMode === "until") {
    description = "Wait until date/time"
  } else if (nodeData?.waitMode === "webhook") {
    description = "Wait for webhook"
  }

  return (
    <>
      <WaitDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Wait / Delay"
        id={props.id}
        status={nodeStatus}
        icon={Timer}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      >
        {resumeUrl && (
          <div className="mt-1 max-w-[180px]">
            <p className="text-[9px] text-muted-foreground truncate">
              Resume URL:
            </p>
            <code className="text-[10px] text-blue-600 dark:text-blue-400 break-all select-all leading-tight block">
              {resumeUrl}
            </code>
          </div>
        )}
      </BaseExecutionNode>
    </>
  )
})

WaitNode.displayName = "WaitNode"
