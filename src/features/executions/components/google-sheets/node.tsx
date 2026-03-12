"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { TableIcon } from "lucide-react"
import { GoogleSheetsFormValues, GoogleSheetsDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchGoogleSheetsRealtimeToken } from "./actions"
import { GOOGLE_SHEETS_CHANNEL_NAME } from "@/inngest/channels/google-sheets"
import { useParams } from "next/navigation"

type GoogleSheetsNodeData = {
  credentialId?: string
  operation?: "APPEND_ROW" | "READ_ROWS"
  spreadsheetId?: string
  sheetName?: string
  range?: string
  rowData?: Array<{ column: string; value: string }>
}

type GoogleSheetsNodeType = Node<GoogleSheetsNodeData>
export const GoogleSheetsNode = memo(
  (props: NodeProps<GoogleSheetsNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()
    const params = useParams()
    const workflowId = params.workflowId as string

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: GOOGLE_SHEETS_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchGoogleSheetsRealtimeToken,
    })

    const handleOpenSettings = () => setDialogOpen(true)
    const handleSubmit = (values: GoogleSheetsFormValues) => {
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
    const description = nodeData?.spreadsheetId
      ? nodeData.operation === "READ_ROWS"
        ? "Read Rows"
        : "Append Row"
      : "Not configured"

    return (
      <>
        <GoogleSheetsDialog
          onSubmit={handleSubmit}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          defaultValues={nodeData}
          nodeId={props.id}
          workflowId={workflowId}
        />
        <BaseExecutionNode
          {...props}
          name="Google Sheets"
          id={props.id}
          status={nodeStatus}
          icon="/logos/googlesheets.svg"
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    )
  }
)

GoogleSheetsNode.displayName = "GoogleSheetsNode"
