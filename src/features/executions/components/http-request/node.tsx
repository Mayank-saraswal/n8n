"use client"
import{useReactFlow, type Node , type NodeProps } from "@xyflow/react"
import { memo , useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"  
import { GlobeIcon } from "lucide-react"
import { HttpRequestFormValues, HttpRequestDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { HTTP_REQUEST_CHANNEL_NAME, httpRequestChannel } from "@/inngest/channels/http-request"
import { fetchHttpRequestRealtimeToken } from "./actions"

type HttpRequestNodeData ={
    variableName?:string,
    endpoint?:string,
    method?:"GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    body?:string
    
}

type HttpRequestNodeType = Node<HttpRequestNodeData>;
export const HttpRequestNode = memo((props:NodeProps<HttpRequestNodeType>)=>{
    const [dialogOpen , setDialogOpen] = useState(false)
    const {setNodes} = useReactFlow()

    

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel:HTTP_REQUEST_CHANNEL_NAME,
        topic:"status",
        refreshToken : fetchHttpRequestRealtimeToken
    })
    const handleOpenSettings = ()=>setDialogOpen(true)
    const handleSubmit =(values:HttpRequestFormValues) =>{
    setNodes((nodes)=>nodes.map((node)=>{
        if(node.id === props.id) {
            return {
                ...node,
                data:{
                    ...node.data,
                    ...values
                }
            }
        }
        return node
    }))
            
    }
    const nodeData = props.data 
    const description = nodeData?.endpoint
    ?`${nodeData.method || "GET"} :${nodeData.endpoint}`:"Not configured"
    
    return(
        <>
        <HttpRequestDialog 
        onSubmit={handleSubmit}
        
        open =  {dialogOpen}
        onOpenChange={setDialogOpen} 
        defaultValues={nodeData}   
        />
        <BaseExecutionNode
        {...props}
        name="HTTP Request"
        id={props.id}
        status={nodeStatus}
        icon={GlobeIcon}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick = {handleOpenSettings}
        
        />
        </>
    )
})

HttpRequestNode.displayName = "HttpRequestNode"