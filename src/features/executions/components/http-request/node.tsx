"use client"
import{useReactFlow, type Node , type NodeProps } from "@xyflow/react"
import { memo , useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"  
import { GlobeIcon } from "lucide-react"
import { FormType, HttpRequestDialog } from "./dialog"


type HttpRequestNodeData ={
    endpoint?:string,
    method?:"GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    body?:string
    [key:string]:unknown
}

type HttpRequestNodeType = Node<HttpRequestNodeData>;
export const HttpRequestNode = memo((props:NodeProps<HttpRequestNodeType>)=>{
    const [dialogOpen , setDialogOpen] = useState(false)
    const {setNodes} = useReactFlow()
    const nodeStatus = "initial"
    const handleOpenSettings = ()=>setDialogOpen(true)
    const handleSubmit =(values:FormType) =>{
    setNodes((nodes)=>nodes.map((node)=>{
        if(node.id !== props.id) {
            return {
                ...node,
                data:{
                    ...node.data,
                    endpoint:values.endpoint,
                    method:values.method,
                    body:values.body
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
        defaultEndpoints={nodeData?.endpoint} //TODO
        defaultMethod={nodeData?.method}
        defaultBody={nodeData?.body}
        open =  {dialogOpen}
        onOpenChange={setDialogOpen}    
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