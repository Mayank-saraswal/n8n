"use client"
import{useReactFlow, type Node , type NodeProps } from "@xyflow/react"
import { memo , useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"  
import { GlobeIcon } from "lucide-react"
import { SlackFormValues , SlackDialog } from "./dialog"
import { useNodeStatus } from "@/features/triggers/components/manual-trigger/hooks/use-node-status"
import { fetchSlackRealtimeToken} from "./actions"
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack"

type SlackNodeData ={
    webhookUrl?:string
    content?:string
}


type SlackNodeType = Node<SlackNodeData>;
export const SlackNode = memo((props:NodeProps<SlackNodeType>)=>{
    const [dialogOpen , setDialogOpen] = useState(false)
    const {setNodes} = useReactFlow()

    

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel:SLACK_CHANNEL_NAME,
        topic:"status",
        refreshToken : fetchSlackRealtimeToken
    })
    const handleOpenSettings = ()=>setDialogOpen(true)
    const handleSubmit =(values:SlackFormValues) =>{
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
    const description = nodeData?.content
    ?` Send: ${nodeData.content.slice(0,50)}...`:"Not configured"
    
    return(
        <>
        <SlackDialog
        onSubmit={handleSubmit}
        
        open =  {dialogOpen}
        onOpenChange={setDialogOpen} 
        defaultValues={nodeData}   
        />
        <BaseExecutionNode
        {...props}
        name="Slack"
        id={props.id}
        status={nodeStatus}
        icon= "/logos/slack.svg"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick = {handleOpenSettings}
        
        />
        </>
    )
})

SlackNode.displayName = "SlackNode"