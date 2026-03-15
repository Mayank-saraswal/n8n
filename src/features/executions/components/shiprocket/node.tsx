"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { ShiprocketFormValues, ShiprocketDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchShiprocketRealtimeToken } from "./actions"
import { SHIPROCKET_CHANNEL_NAME } from "@/inngest/channels/shiprocket"
import { useParams } from "next/navigation"

type ShiprocketNodeData = {
  credentialId?: string
  operation?: string
  variableName?: string
  [key: string]: unknown
}

type ShiprocketNodeType = Node<ShiprocketNodeData>

function truncate(s: string, max: number) {
  return s && s.length > max ? s.slice(0, max) + "…" : s
}

function getDescription(data: ShiprocketNodeData): string {
  const op = data?.operation
  if (!op) return "Click to configure"

  switch (op) {
    case "CREATE_ORDER":
      return data.orderId ? `Create Order ${truncate(data.orderId as string, 15)}` : "Create Order"
    case "GET_ORDER":
      return "Get Order Details"
    case "CANCEL_ORDER":
      return "Cancel Order"
    case "UPDATE_ORDER":
      return "Update Order"
    case "GET_ORDER_TRACKING":
      return "Track Order"
    case "CLONE_ORDER":
      return "Clone Order"
    case "GENERATE_AWB":
      return "Generate AWB"
    case "GET_ORDERS_LIST":
      return "List Orders"
    case "TRACK_SHIPMENT":
      return data.awbCode ? `Track ${truncate(data.awbCode as string, 15)}` : "Track Shipment"
    case "ASSIGN_COURIER":
      return "Assign Courier"
    case "GENERATE_LABEL":
      return "Generate Label"
    case "GENERATE_MANIFEST":
      return "Generate Manifest"
    case "REQUEST_PICKUP":
      return "Request Pickup"
    case "GET_COURIER_LIST":
      return "Get Couriers"
    case "GET_RATE":
      return "Get Rates"
    case "CHECK_SERVICEABILITY":
      return "Check Serviceability"
    case "CREATE_RETURN":
      return "Create Return"
    case "GET_RETURN_REASONS":
      return "Return Reasons"
    case "TRACK_RETURN":
      return "Track Return"
    case "CREATE_PRODUCT":
      return data.productName ? `Product: ${truncate(data.productName as string, 15)}` : "Create Product"
    case "GET_PRODUCTS":
      return "List Products"
    case "GET_PICKUP_LOCATIONS":
      return "Pickup Locations"
    case "CREATE_PICKUP_LOCATION":
      return "Add Pickup Location"
    default:
      return op.replace(/_/g, " ")
  }
}

export const ShiprocketNode = memo((props: NodeProps<ShiprocketNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SHIPROCKET_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchShiprocketRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: ShiprocketFormValues) => {
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
      <ShiprocketDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={nodeData}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Shiprocket"
        id={props.id}
        status={nodeStatus}
        icon="/logos/shiprocket.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

ShiprocketNode.displayName = "ShiprocketNode"
