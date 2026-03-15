"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { Msg91FormValues, Msg91Dialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchMsg91RealtimeToken } from "./actions"
import { MSG91_CHANNEL_NAME } from "@/inngest/channels/msg91"
import { useParams } from "next/navigation"

type Msg91NodeData = {
  credentialId?: string
  operation?: string
  variableName?: string
  [key: string]: unknown
}

type Msg91NodeType = Node<Msg91NodeData>

const operationLabels: Record<string, string> = {
  SEND_SMS: "Send SMS",
  SEND_BULK_SMS: "Send Bulk SMS",
  SEND_TRANSACTIONAL: "Send Transactional",
  SCHEDULE_SMS: "Schedule SMS",
  SEND_OTP: "Send OTP",
  VERIFY_OTP: "Verify OTP",
  RESEND_OTP: "Resend OTP",
  INVALIDATE_OTP: "Invalidate OTP",
  SEND_WHATSAPP: "Send WhatsApp",
  SEND_WHATSAPP_MEDIA: "WhatsApp Media",
  SEND_VOICE_OTP: "Voice OTP",
  SEND_EMAIL: "Send Email",
  GET_BALANCE: "Get Balance",
  GET_REPORT: "Get Report",
}

export const Msg91Node = memo((props: NodeProps<Msg91NodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: MSG91_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchMsg91RealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: Msg91FormValues) => {
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
    ? operationLabels[nodeData.operation] ?? nodeData.operation.replace(/_/g, " ")
    : ""
  const description = opLabel ? opLabel : "Click to configure"

  return (
    <>
      <Msg91Dialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={nodeData}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="MSG91"
        id={props.id}
        status={nodeStatus}
        icon="/logos/msg91.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

Msg91Node.displayName = "Msg91Node"
