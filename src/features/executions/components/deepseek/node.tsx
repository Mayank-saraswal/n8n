"use client"
import{useReactFlow, type Node , type NodeProps } from "@xyflow/react"
import { memo , useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"  
import { GlobeIcon } from "lucide-react"
import { DeepseekFormValues, DeepseekDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { fetchDeepseekRealtimeToken} from "./actions"
import { DEEPSEEK_CHANNEL_NAME } from "@/inngest/channels/deepseek"

type DeepseekNodeData ={
    credentialId?:string
//    model?:string;
   variableName?:string
   systemPrompt?: string;
   userPrompt?: string;
    
}

type DeepseekNodeType = Node<DeepseekNodeData>;
export const DeepseekNode = memo((props:NodeProps<DeepseekNodeType>)=>{
    const [dialogOpen , setDialogOpen] = useState(false)
    const {setNodes} = useReactFlow()

    

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel:DEEPSEEK_CHANNEL_NAME,
        topic:"status",
        refreshToken : fetchDeepseekRealtimeToken
    })
    const handleOpenSettings = ()=>setDialogOpen(true)
    const handleSubmit =(values:DeepseekFormValues) =>{
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
    ?` "deepseek-chat" :${nodeData.userPrompt.slice(0,50)}...`:"Not configured"
    
    return(
        <>
        <DeepseekDialog
        onSubmit={handleSubmit}
        
        open =  {dialogOpen}
        onOpenChange={setDialogOpen} 
        defaultValues={nodeData}   
        />
        <BaseExecutionNode
        {...props}
        name="Deepseek"
        id={props.id}
        status={nodeStatus}
        icon= "/logos/deepseek.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick = {handleOpenSettings}
        
        />
        </>
    )
})

DeepseekNode.displayName = "DeepseekNode"