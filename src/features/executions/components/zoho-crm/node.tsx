"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { ZohoCrmDialog, ZohoCrmFormValues } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchZohoCrmRealtimeToken } from "./actions"
import { ZOHO_CRM_CHANNEL } from "./channels"
import { useParams } from "next/navigation"

type ZohoCrmNodeData = {
  credentialId?: string
  operation?: string
  variableName?: string
  [key: string]: unknown
}

type ZohoCrmNodeType = Node<ZohoCrmNodeData>

const OPERATION_LABELS: Record<string, string> = {
  CREATE_LEAD: "Create Lead", GET_LEAD: "Get Lead", UPDATE_LEAD: "Update Lead",
  DELETE_LEAD: "Delete Lead", SEARCH_LEADS: "Search Leads", CONVERT_LEAD: "Convert Lead",
  CREATE_CONTACT: "Create Contact", GET_CONTACT: "Get Contact", UPDATE_CONTACT: "Update Contact",
  DELETE_CONTACT: "Delete Contact", SEARCH_CONTACTS: "Search Contacts", GET_CONTACT_DEALS: "Get Contact Deals",
  CREATE_DEAL: "Create Deal", GET_DEAL: "Get Deal", UPDATE_DEAL: "Update Deal",
  DELETE_DEAL: "Delete Deal", SEARCH_DEALS: "Search Deals", UPDATE_DEAL_STAGE: "Update Deal Stage",
  CREATE_ACCOUNT: "Create Account", GET_ACCOUNT: "Get Account", UPDATE_ACCOUNT: "Update Account",
  DELETE_ACCOUNT: "Delete Account", SEARCH_ACCOUNTS: "Search Accounts",
  CREATE_TASK: "Create Task", CREATE_CALL_LOG: "Log Call", CREATE_MEETING: "Create Meeting",
  GET_ACTIVITIES: "Get Activities", ADD_NOTE: "Add Note", GET_NOTES: "Get Notes",
  UPSERT_RECORD: "Upsert Record", SEARCH_RECORDS: "Search Records", GET_FIELDS: "Get Fields",
}

function getDescription(data: ZohoCrmNodeData): string {
  const op = data?.operation
  if (!op) return "Click to configure"
  return OPERATION_LABELS[op] || op.replace(/_/g, " ")
}

const ZohoCrmNode = memo((props: NodeProps<ZohoCrmNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const params = useParams()
  const workflowId = params.workflowId as string

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: ZOHO_CRM_CHANNEL,
    topic: "status",
    refreshToken: fetchZohoCrmRealtimeToken,
  })

  const handleOpenSettings = () => setDialogOpen(true)
  const handleSubmit = (values: ZohoCrmFormValues) => {
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
      <ZohoCrmDialog
        onSubmit={handleSubmit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={props.data}
        nodeId={props.id}
        workflowId={workflowId}
      />
      <BaseExecutionNode
        {...props}
        name="Zoho CRM"
        id={props.id}
        status={nodeStatus}
        icon="/logos/zoho.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

ZohoCrmNode.displayName = "ZohoCrmNode"

export default ZohoCrmNode
