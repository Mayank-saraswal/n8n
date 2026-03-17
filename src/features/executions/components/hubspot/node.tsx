"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { HubspotDialog, HubspotFormValues } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { HUBSPOT_CHANNEL_NAME } from "@/inngest/channels/hubspot"
import { fetchHubspotRealtimeToken } from "./actions"
import { HubspotOperation } from "@/generated/prisma"
import { useParams } from "next/navigation"

type HubspotNodeData = {
  credentialId?: string
  operation?: HubspotOperation
  variableName?: string
  recordId?: string
  objectType?: string
  searchQuery?: string
  [key: string]: unknown
}

type HubspotNodeType = Node<HubspotNodeData>

const OPERATION_LABELS: Partial<Record<HubspotOperation, string>> = {
  [HubspotOperation.CREATE_CONTACT]: "Create Contact",
  [HubspotOperation.GET_CONTACT]: "Get Contact",
  [HubspotOperation.UPDATE_CONTACT]: "Update Contact",
  [HubspotOperation.DELETE_CONTACT]: "Delete Contact",
  [HubspotOperation.SEARCH_CONTACTS]: "Search Contacts",
  [HubspotOperation.UPSERT_CONTACT]: "Upsert Contact",
  [HubspotOperation.CREATE_COMPANY]: "Create Company",
  [HubspotOperation.CREATE_DEAL]: "Create Deal",
  [HubspotOperation.CREATE_TICKET]: "Create Ticket",
  [HubspotOperation.SEARCH_DEALS]: "Search Deals",
  [HubspotOperation.CREATE_NOTE]: "Create Note",
  [HubspotOperation.CREATE_TASK]: "Create Task",
  [HubspotOperation.CREATE_ASSOCIATION]: "Create Association",
  [HubspotOperation.SEARCH_OBJECTS]: "Search Objects",
}

function getDescription(data: HubspotNodeData) {
  const op = data.operation
  if (!op) return "Click to configure"
  const label = OPERATION_LABELS[op] || op.replace(/_/g, " ")
  const recordOps: HubspotOperation[] = [
    HubspotOperation.GET_CONTACT,
    HubspotOperation.UPDATE_CONTACT,
    HubspotOperation.DELETE_CONTACT,
    HubspotOperation.GET_COMPANY,
    HubspotOperation.UPDATE_COMPANY,
    HubspotOperation.DELETE_COMPANY,
    HubspotOperation.GET_DEAL,
    HubspotOperation.UPDATE_DEAL,
    HubspotOperation.DELETE_DEAL,
    HubspotOperation.GET_TICKET,
    HubspotOperation.UPDATE_TICKET,
    HubspotOperation.DELETE_TICKET,
  ]
  if (data.recordId && op && recordOps.includes(op)) {
    return `${label}: ${String(data.recordId).slice(0, 24)}`
  }
  if (data.searchQuery && op && op.toString().includes("SEARCH")) {
    return `${label} – ${String(data.searchQuery).slice(0, 24)}`
  }
  return label
}

export const HubspotNode = memo((props: NodeProps<HubspotNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HUBSPOT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchHubspotRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (values: HubspotFormValues) => {
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
      <HubspotDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={nodeData}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="HubSpot"
        id={props.id}
        status={nodeStatus}
        icon="/logos/hubspot.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

HubspotNode.displayName = "HubspotNode"
