"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { HardDriveIcon } from "lucide-react"
import { GoogleDriveFormValues, GoogleDriveDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/shared/hooks/use-node-status"
import { fetchGoogleDriveRealtimeToken } from "./actions"
import { GOOGLE_DRIVE_CHANNEL_NAME } from "@/inngest/channels/google-drive"
import { useParams } from "next/navigation"

type GoogleDriveNodeData = {
  credentialId?: string
  operation?: "UPLOAD_FILE" | "DOWNLOAD_FILE" | "LIST_FILES" | "CREATE_FOLDER"
  folderId?: string
  fileId?: string
  fileName?: string
  mimeType?: string
  query?: string
  maxResults?: number
}

type GoogleDriveNodeType = Node<GoogleDriveNodeData>
export const GoogleDriveNode = memo(
  (props: NodeProps<GoogleDriveNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()
    const params = useParams()
    const workflowId = params.workflowId as string

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: GOOGLE_DRIVE_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchGoogleDriveRealtimeToken,
    })

    const handleOpenSettings = () => setDialogOpen(true)
    const handleSubmit = (values: GoogleDriveFormValues) => {
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
    const operationLabels: Record<string, string> = {
      UPLOAD_FILE: "Upload File",
      DOWNLOAD_FILE: "Download File",
      LIST_FILES: "List Files",
      CREATE_FOLDER: "Create Folder",
    }
    const description = nodeData?.operation
      ? operationLabels[nodeData.operation] ?? "Click to configure"
      : "Click to configure"

    return (
      <>
        <GoogleDriveDialog
          onSubmit={handleSubmit}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          defaultValues={nodeData}
          nodeId={props.id}
          workflowId={workflowId}
        />
        <BaseExecutionNode
          {...props}
          name="Google Drive"
          id={props.id}
          status={nodeStatus}
          icon={HardDriveIcon}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    )
  }
)

GoogleDriveNode.displayName = "GoogleDriveNode"
