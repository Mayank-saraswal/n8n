"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { MessageCircle } from "lucide-react"
import { WhatsAppFormValues, WhatsAppDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchWhatsAppRealtimeToken } from "./actions"
import { WHATSAPP_CHANNEL_NAME } from "@/inngest/channels/whatsapp"
import { useParams } from "next/navigation"

type WhatsAppNodeData = {
  credentialId?: string
  operation?: string
  to?: string
  body?: string
  templateName?: string
  templateLang?: string
  templateParams?: string
  mediaUrl?: string
  mediaCaption?: string
  reactionEmoji?: string
  reactionMsgId?: string
}

type WhatsAppNodeType = Node<WhatsAppNodeData>

const operationLabels: Record<string, string> = {
  SEND_TEXT: "Send Text",
  SEND_TEMPLATE: "Send Template",
  SEND_IMAGE: "Send Image",
  SEND_DOCUMENT: "Send Document",
  SEND_REACTION: "Send Reaction",
}

export const WhatsAppNode = memo((props: NodeProps<WhatsAppNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: WHATSAPP_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchWhatsAppRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: WhatsAppFormValues) => {
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
  const toSuffix = nodeData?.to ? ` to ${nodeData.to}` : ""
  const templateSuffix = nodeData?.templateName
    ? `: ${nodeData.templateName}`
    : ""
  const description =
    opLabel
      ? `${opLabel}${templateSuffix}${toSuffix}`
      : "Click to configure"

  return (
    <>
      <WhatsAppDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={nodeData}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="WhatsApp"
        id={props.id}
        status={nodeStatus}
        icon={MessageCircle}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

WhatsAppNode.displayName = "WhatsAppNode"
