"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { RazorpayFormValues, RazorpayDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchRazorpayRealtimeToken } from "./actions"
import { RAZORPAY_CHANNEL_NAME } from "@/inngest/channels/razorpay"
import { useParams } from "next/navigation"

type RazorpayNodeData = {
  credentialId?: string
  operation?: string
  amount?: string
  currency?: string
  description?: string
  receipt?: string
  customerId?: string
  paymentId?: string
  orderId?: string
  refundAmount?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

type RazorpayNodeType = Node<RazorpayNodeData>

const operationLabels: Record<string, string> = {
  CREATE_ORDER: "Create Order",
  FETCH_ORDER: "Fetch Order",
  CREATE_REFUND: "Create Refund",
  FETCH_PAYMENT: "Fetch Payment",
  FETCH_REFUND: "Fetch Refund",
  CREATE_CUSTOMER: "Create Customer",
  FETCH_CUSTOMER: "Fetch Customer",
}

export const RazorpayNode = memo((props: NodeProps<RazorpayNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: RAZORPAY_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchRazorpayRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: RazorpayFormValues) => {
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
  const amountSuffix = nodeData?.amount
    ? ` ₹${(Number(nodeData.amount) / 100).toFixed(2)}`
    : ""
  const description =
    opLabel
      ? `${opLabel}${amountSuffix}`
      : "Click to configure"

  return (
    <>
      <RazorpayDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={nodeData}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Razorpay"
        id={props.id}
        status={nodeStatus}
        icon={"/logos/razorpay.svg"}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

RazorpayNode.displayName = "RazorpayNode"
