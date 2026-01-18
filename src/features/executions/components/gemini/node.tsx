"use client"
import{useReactFlow, type Node , type NodeProps } from "@xyflow/react"
import { memo , useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"  
import { GlobeIcon } from "lucide-react"
import { GeminiFormValues, GeminiDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { fetchGeminiRealtimeToken} from "./actions"
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini"

type GeminiNodeData ={
//    model?:string;
   variableName?:string
   systemPrompt?: string;
   userPrompt?: string;
    
}

type GeminiNodeType = Node<GeminiNodeData>;
export const GeminiNode = memo((props:NodeProps<GeminiNodeType>)=>{
    const [dialogOpen , setDialogOpen] = useState(false)
    const {setNodes} = useReactFlow()

    

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel:GEMINI_CHANNEL_NAME,
        topic:"status",
        refreshToken : fetchGeminiRealtimeToken
    })
    const handleOpenSettings = ()=>setDialogOpen(true)
    const handleSubmit =(values:GeminiFormValues) =>{
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
    ?` "gemini-2.0-flash" :${nodeData.userPrompt.slice(0,50)}...`:"Not configured"
    
    return(
        <>
        <GeminiDialog
        onSubmit={handleSubmit}
        
        open =  {dialogOpen}
        onOpenChange={setDialogOpen} 
        defaultValues={nodeData}   
        />
        <BaseExecutionNode
        {...props}
        name="Gemini"
        id={props.id}
        status={nodeStatus}
        icon= "/logos/gemini.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick = {handleOpenSettings}
        
        />
        </>
    )
})

GeminiNode.displayName = "GeminiNode"