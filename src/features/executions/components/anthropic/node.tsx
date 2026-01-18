"use client"
import{useReactFlow, type Node , type NodeProps } from "@xyflow/react"
import { memo , useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"  
import { GlobeIcon } from "lucide-react"
import { AnthropicDialog, AnthropicFormValues } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { fetchAnthropicRealtimeToken} from "./actions"
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic"

type AnthropicNodeData ={
//    model?:string;
   variableName?:string
   systemPrompt?: string;
   userPrompt?: string;
    
}

type AnthropicNodeType = Node<AnthropicNodeData>;
export const AnthropicNode = memo((props:NodeProps<AnthropicNodeType>)=>{
    const [dialogOpen , setDialogOpen] = useState(false)
    const {setNodes} = useReactFlow()

    

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel:ANTHROPIC_CHANNEL_NAME,
        topic:"status",
        refreshToken : fetchAnthropicRealtimeToken
    })
    const handleOpenSettings = ()=>setDialogOpen(true)
    const handleSubmit =(values:AnthropicFormValues) =>{
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
    ?` "claude-sonnet-4-0" :${nodeData.userPrompt.slice(0,50)}...`:"Not configured"
    
    return(
        <>
        <AnthropicDialog
        onSubmit={handleSubmit}
        
        open =  {dialogOpen}
        onOpenChange={setDialogOpen} 
        defaultValues={nodeData}   
        />
        <BaseExecutionNode
        {...props}
        name="Anthropic"
        id={props.id}
        status={nodeStatus}
        icon= "/logos/anthropic.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick = {handleOpenSettings}
        
        />
        </>
    )
})

AnthropicNode.displayName = "AnthropicAiNode"