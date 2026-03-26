"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { CashfreeFormValues, CashfreeDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchCashfreeRealtimeToken } from "./actions"
import { CASHFREE_CHANNEL_NAME } from "@/inngest/channels/cashfree"
import { useParams } from "next/navigation"

type CashfreeNodeData = {
  credentialId?: string
  operation?: string
  variableName?: string

  [key: string]: unknown
}

type CashfreeNodeType = Node<CashfreeNodeData>

const OPERATION_LABELS: Record<string, string> = {
  CREATE_ORDER: "Create Order",
  GET_ORDER: "Get Order",
  TERMINATE_ORDER: "Terminate Order",
  PAY_ORDER: "Pay Order",
  GET_PAYMENTS_FOR_ORDER: "Get Payments",
  GET_PAYMENT_BY_ID: "Get Payment",
  CREATE_REFUND: "Create Refund",
  GET_REFUND: "Get Refund",
  GET_ALL_REFUNDS_FOR_ORDER: "Get All Refunds",
  GET_SETTLEMENTS_FOR_ORDER: "Get Settlements",
  GET_ALL_SETTLEMENTS: "All Settlements",
  GET_SETTLEMENT_RECON: "Settlement Recon",
  CREATE_PAYMENT_LINK: "Create Payment Link",
  GET_PAYMENT_LINK: "Get Payment Link",
  CANCEL_PAYMENT_LINK: "Cancel Payment Link",
  GET_ORDERS_FOR_LINK: "Orders for Link",
  CREATE_SUBSCRIPTION_PLAN: "Create Plan",
  GET_SUBSCRIPTION_PLAN: "Get Plan",
  CREATE_SUBSCRIPTION: "Create Subscription",
  GET_SUBSCRIPTION: "Get Subscription",
  MANAGE_SUBSCRIPTION: "Manage Subscription",
  GET_SUBSCRIPTION_PAYMENTS: "Subscription Payments",
  GET_PAYOUT_BALANCE: "Payout Balance",
  ADD_BENEFICIARY: "Add Beneficiary",
  GET_BENEFICIARY: "Get Beneficiary",
  REMOVE_BENEFICIARY: "Remove Beneficiary",
  TRANSFER_TO_BENEFICIARY: "Transfer",
  GET_TRANSFER_STATUS: "Transfer Status",
  BULK_TRANSFER: "Bulk Transfer",
  GET_BATCH_TRANSFER_STATUS: "Batch Status",
  VALIDATE_UPI_ID: "Validate UPI ID",
  CREATE_UPI_PAYMENT_LINK: "UPI Payment Link",
  CREATE_OFFER: "Create Offer",
  GET_OFFER: "Get Offer",
  VERIFY_WEBHOOK_SIGNATURE: "Verify Webhook",
}

export const CashfreeNode = memo((props: NodeProps<CashfreeNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: CASHFREE_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchCashfreeRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: CashfreeFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return { ...node, data: { ...node.data, ...values } }
        }
        return node
      })
    )
  }

  const nodeData = props.data
  const opLabel = nodeData?.operation
    ? OPERATION_LABELS[nodeData.operation] ?? nodeData.operation.replace(/_/g, " ")
    : ""
  const description = opLabel ? opLabel : "Click to configure"

  return (
    <>
      <CashfreeDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={nodeData as Partial<CashfreeFormValues>}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Cashfree"
        id={props.id}
        status={nodeStatus}
        icon="/logos/cashfree.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

CashfreeNode.displayName = "CashfreeNode"
