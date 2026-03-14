"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { SlackFormValues, SlackDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchSlackRealtimeToken } from "./actions"
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack"
import { useParams } from "next/navigation"

type SlackNodeData = {
  credentialId?: string
  operation?: string
  variableName?: string
  channel?: string
  message?: string
  threadTs?: string
  messageTs?: string
  searchQuery?: string
  channelName?: string
  channelTopic?: string
  channelPurpose?: string
  userId?: string
  emoji?: string
  fileComment?: string
  webhookUrl?: string
}

type SlackNodeType = Node<SlackNodeData>

const operationLabels: Record<string, string> = {
  MESSAGE_SEND_WEBHOOK: "Send Message (Webhook)",
  MESSAGE_SEND: "Send Message",
  MESSAGE_UPDATE: "Update Message",
  MESSAGE_DELETE: "Delete Message",
  MESSAGE_GET_PERMALINK: "Get Permalink",
  MESSAGE_SEARCH: "Search Messages",
  CHANNEL_CREATE: "Create Channel",
  CHANNEL_ARCHIVE: "Archive Channel",
  CHANNEL_UNARCHIVE: "Unarchive Channel",
  CHANNEL_INVITE: "Invite to Channel",
  CHANNEL_KICK: "Remove from Channel",
  CHANNEL_SET_TOPIC: "Set Topic",
  CHANNEL_SET_PURPOSE: "Set Purpose",
  CHANNEL_HISTORY: "Channel History",
  CHANNEL_INFO: "Channel Info",
  CHANNEL_LIST: "List Channels",
  CHANNEL_RENAME: "Rename Channel",
  USER_INFO: "User Info",
  USER_LIST: "List Users",
  USER_GET_PRESENCE: "User Presence",
  REACTION_ADD: "Add Reaction",
  REACTION_REMOVE: "Remove Reaction",
  REACTION_GET: "Get Reactions",
  FILE_UPLOAD: "Upload File",
  FILE_LIST: "List Files",
  FILE_INFO: "File Info",
  FILE_DELETE: "Delete File",
  CONVERSATION_OPEN: "Open Conversation",
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

  const nodeData = props.data
  const opLabel = nodeData?.operation
    ? operationLabels[nodeData.operation] ?? nodeData.operation
    : ""
  const channelSuffix = nodeData?.channel ? ` #${nodeData.channel}` : ""
  const description = opLabel
    ? `${opLabel}${channelSuffix}`
    : "Click to configure"

  return (
    <>
      <SlackDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={nodeData}
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