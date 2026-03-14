"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { RazorpayFormValues, RazorpayDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchRazorpayRealtimeToken } from "./actions"
import { RAZORPAY_CHANNEL_NAME } from "@/inngest/channels/razorpay"
import { useParams } from "next/navigation"
import { CreditCardIcon } from "lucide-react"

type RazorpayNodeData = {
  credentialId?: string
  operation?: string
  variableName?: string
  [key: string]: unknown
}

type RazorpayNodeType = Node<RazorpayNodeData>

const operationLabels: Record<string, string> = {
  ORDER_CREATE: "Create Order",
  ORDER_FETCH: "Fetch Order",
  ORDER_FETCH_PAYMENTS: "Fetch Order Payments",
  ORDER_LIST: "List Orders",
  PAYMENT_FETCH: "Fetch Payment",
  PAYMENT_CAPTURE: "Capture Payment",
  PAYMENT_LIST: "List Payments",
  PAYMENT_UPDATE: "Update Payment",
  REFUND_CREATE: "Create Refund",
  REFUND_FETCH: "Fetch Refund",
  REFUND_LIST: "List Refunds",
  CUSTOMER_CREATE: "Create Customer",
  CUSTOMER_FETCH: "Fetch Customer",
  CUSTOMER_UPDATE: "Update Customer",
  SUBSCRIPTION_CREATE: "Create Subscription",
  SUBSCRIPTION_FETCH: "Fetch Subscription",
  SUBSCRIPTION_CANCEL: "Cancel Subscription",
  INVOICE_CREATE: "Create Invoice",
  INVOICE_FETCH: "Fetch Invoice",
  INVOICE_SEND: "Send Invoice",
  INVOICE_CANCEL: "Cancel Invoice",
  PAYMENT_LINK_CREATE: "Create Payment Link",
  PAYMENT_LINK_FETCH: "Fetch Payment Link",
  PAYMENT_LINK_UPDATE: "Update Payment Link",
  PAYMENT_LINK_CANCEL: "Cancel Payment Link",
  PAYOUT_CREATE: "Create Payout",
  PAYOUT_FETCH: "Fetch Payout",
  VERIFY_PAYMENT_SIGNATURE: "Verify Signature",
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
    ? operationLabels[nodeData.operation] ?? nodeData.operation.replace(/_/g, " ")
    : ""
  const description = opLabel ? opLabel : "Click to configure"

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
        icon={CreditCardIcon}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

RazorpayNode.displayName = "RazorpayNode"
