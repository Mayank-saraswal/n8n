"use client"
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { WorkdayFormValues, WorkdayDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { WORKDAY_CHANNEL_NAME } from "@/inngest/channels/workday"
import { fetchWorkdayRealtimeToken } from "./actions"

type WorkdayNodeData = {
    variableName?: string,
    // Connection
    tenantUrl?: string,
    tenantId?: string,
    clientId?: string,
    clientSecret?: string,
    // Operation
    resource?: "human_resources" | "financial_management",
    operation?: "getWorker" | "getAllWorkers" | "getInvoices" | "submitExpense" | "getTimeOff" | "updateContact",
    // Inputs
    workerId?: string
    apiVersion?: string
    limit?: number
    jsonBody?: string
}

type WorkdayNodeType = Node<WorkdayNodeData>;
export const WorkdayNode = memo((props: NodeProps<WorkdayNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: WORKDAY_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchWorkdayRealtimeToken
    })
    const handleOpenSettings = () => setDialogOpen(true)
    const handleSubmit = (values: WorkdayFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values
                    }
                }
            }
            return node
        }))

    }
    const nodeData = props.data
    const description = nodeData?.operation
        ? `${nodeData.resource === 'human_resources' ? 'HR' : 'Finance'}: ${nodeData.operation}`
        : "Not configured"

    return (
        <>
            <WorkdayDialog
                onSubmit={handleSubmit}

                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                name="Workday"
                id={props.id}
                status={nodeStatus}
                icon="/logos/workday.svg"
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}

            />
        </>
    )
})

WorkdayNode.displayName = "WorkdayNode"

