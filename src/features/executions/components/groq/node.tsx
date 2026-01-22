"use client"
import{useReactFlow, type Node , type NodeProps } from "@xyflow/react"
import { memo , useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"  
import { GlobeIcon } from "lucide-react"
import { GroqFormValues, GroqDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { fetchGroqRealtimeToken} from "./actions"
import { GROQ_CHANNEL_NAME } from "@/inngest/channels/groq"

type GroqNodeData ={
    credentialId?:string
//    model?:string;
   variableName?:string
   systemPrompt?: string;
   userPrompt?: string;
    
}

type GroqNodeType = Node<GroqNodeData>;
export const GroqNode = memo((props:NodeProps<GroqNodeType>)=>{
    const [dialogOpen , setDialogOpen] = useState(false)
    const {setNodes} = useReactFlow()

    

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel:GROQ_CHANNEL_NAME,
        topic:"status",
        refreshToken : fetchGroqRealtimeToken
    })
    const handleOpenSettings = ()=>setDialogOpen(true)
    const handleSubmit =(values:GroqFormValues) =>{
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
    ?` "qwen/qwen3-32b" :${nodeData.userPrompt.slice(0,50)}...`:"Not configured"
    
    return(
        <>
        <GroqDialog
        onSubmit={handleSubmit}
        
        open =  {dialogOpen}
        onOpenChange={setDialogOpen} 
        defaultValues={nodeData}   
        />
        <BaseExecutionNode
        {...props}
        name="Groq"
        id={props.id}
        status={nodeStatus}
        icon= "/logos/groq.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick = {handleOpenSettings}
        
        />
        </>
    )
})

GroqNode.displayName = "GroqNode"