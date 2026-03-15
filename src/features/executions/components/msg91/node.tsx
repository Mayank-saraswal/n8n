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

function truncate(s: string, max: number) {
  return s && s.length > max ? s.slice(0, max) + "…" : s
}

function getDescription(data: Msg91NodeData): string {
  const op = data?.operation
  if (!op) return "Click to configure"

  switch (op) {
    case "SEND_SMS":
      return data.mobile ? `Send SMS to ${truncate(data.mobile as string, 15)}` : "Send SMS"
    case "SEND_BULK_SMS":
      return "Send Bulk SMS"
    case "SEND_TRANSACTIONAL":
      return data.mobile ? `Transactional to ${truncate(data.mobile as string, 15)}` : "Send Transactional"
    case "SCHEDULE_SMS":
      return data.mobile ? `Schedule SMS to ${truncate(data.mobile as string, 15)}` : "Schedule SMS"
    case "SEND_OTP":
      return data.mobile ? `Send OTP to ${truncate(data.mobile as string, 15)}` : "Send OTP"
    case "VERIFY_OTP":
      return "Verify OTP"
    case "RESEND_OTP":
      return "Resend OTP"
    case "INVALIDATE_OTP":
      return "Invalidate OTP"
    case "SEND_WHATSAPP":
      return data.whatsappTemplate ? `WhatsApp: ${truncate(data.whatsappTemplate as string, 20)}` : "Send WhatsApp"
    case "SEND_WHATSAPP_MEDIA":
      return "WhatsApp Media"
    case "SEND_VOICE_OTP":
      return "Voice OTP"
    case "SEND_EMAIL":
      return data.subject ? `Email: ${truncate(data.subject as string, 20)}` : "Send Email"
    case "GET_BALANCE":
      return "Check SMS Balance"
    case "GET_REPORT":
      return "Get Delivery Report"
    default:
      return op.replace(/_/g, " ")
  }
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
  const description = getDescription(nodeData)

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
