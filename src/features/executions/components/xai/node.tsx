"use client"
import{useReactFlow, type Node , type NodeProps } from "@xyflow/react"
import { memo , useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"  
import { GlobeIcon } from "lucide-react"
import { XaiDialog , XaiFormValues } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import {  fetchXaiRealtimeToken} from "./actions"
import { XAI_CHANNEL_NAME } from "@/inngest/channels/xai"

type XaiNodeData ={
//    model?:string;
   variableName?:string
   systemPrompt?: string;
   userPrompt?: string;
    
}

type XaiNodeType = Node<XaiNodeData>;
export const XaiNode = memo((props:NodeProps<XaiNodeType>)=>{
    const [dialogOpen , setDialogOpen] = useState(false)
    const {setNodes} = useReactFlow()

    

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel:    XAI_CHANNEL_NAME,
        topic:"status",
        refreshToken : fetchXaiRealtimeToken
    })
    const handleOpenSettings = ()=>setDialogOpen(true)
    const handleSubmit =(values:XaiFormValues) =>{
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
    const description = nodeData?.userPrompt
    ?` "grok-2" :${nodeData.userPrompt.slice(0,50)}...`:"Not configured"
    
    return(
        <>
        <XaiDialog
        onSubmit={handleSubmit}
        
        open =  {dialogOpen}
        onOpenChange={setDialogOpen} 
        defaultValues={nodeData}   
        />
        <BaseExecutionNode
        {...props}
        name="Xai"
        id={props.id}
        status={nodeStatus}
        icon= "/logos/xai.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick = {handleOpenSettings}
        
        />
        </>
    )
})

XaiNode.displayName = "XaiNode"