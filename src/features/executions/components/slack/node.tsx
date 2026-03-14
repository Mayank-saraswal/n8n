"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { SlackFormValues, SlackDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchSlackRealtimeToken } from "./actions"
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack"
import { useParams } from "next/navigation"

type SlackNodeData = SlackFormValues & {
  [key: string]: unknown
}

type SlackNodeType = Node<SlackNodeData>

function getDescription(data: SlackNodeData): string {
  if (!data?.operation) return "Click to configure"

  switch (data.operation) {
    case "MESSAGE_SEND": {
      const ch = data.channel || ""
      const display = ch.length > 20 ? ch.slice(0, 20) : ch
      return display ? `Send to ${display}` : "Send Message"
    }
    case "MESSAGE_SEND_WEBHOOK":
      return "Webhook message"
    case "MESSAGE_UPDATE":
      return "Edit message"
    case "MESSAGE_DELETE":
      return "Delete message"
    case "MESSAGE_SCHEDULE":
      return "Scheduled message"
    case "CHANNEL_CREATE": {
      const name = data.channelName || ""
      return name ? `Create #${name}` : "Create Channel"
    }
    case "CHANNEL_LIST":
      return "List channels"
    case "CHANNEL_INVITE":
      return "Invite to channel"
    case "USER_GET":
      return "Get user"
    case "USER_GET_BY_EMAIL":
      return "Get by email"
    case "FILE_UPLOAD": {
      const fn = data.filename || "file"
      return `Upload ${fn}`
    }
    case "REACTION_ADD": {
      const em = data.emoji || ""
      return em ? `React :${em}:` : "Add Reaction"
    }
    default: {
      return data.operation.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
    }
  }
}

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SLACK_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchSlackRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: SlackFormValues) => {
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

  const description = getDescription(props.data)

  return (
    <>
      <SlackDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={props.data}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Slack"
        id={props.id}
        status={nodeStatus}
        icon="/logos/slack.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

SlackNode.displayName = "SlackNode"
