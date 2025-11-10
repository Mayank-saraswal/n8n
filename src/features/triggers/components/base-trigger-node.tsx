"use client"
import {type NodeProps , Position} from "@xyflow/react"
import type{LucideIcon} from "lucide-react"
import Image from "next/image"
import {memo , useCallback , type ReactNode} from "react"

import { BaseNode , BaseNodeContent } from "../../../components/react-flow/base-node"
import { BaseHandle} from "../../../components/react-flow/base-handle"
import { WrokflowNode } from "../../../components/workflow-node"



interface BaseTriggerNodeProps extends NodeProps{
    icon:LucideIcon | string,
    id:string
    name:string,
    description?:string,
    // status:NodeStatus,
    children?:ReactNode
    onSettings?() : void
    onDoubleClick?() :void

};

export const BaseTriggerNode = memo(function BaseTriggerNode({
    icon:Icon,
    id,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
    
}:BaseTriggerNodeProps) {
    const handleDelete = ()=>{
        console.log("delete")
    }
   
    return (
        <WrokflowNode
            
            name={name}
            description={description}
           
            onSettings={onSettings}
            onDelete={handleDelete}
        >
            <BaseNode
                onDoubleClick={onDoubleClick}
                className="rounded-l-2xl  relative group"
            >
                <BaseNodeContent>
                    {typeof Icon ==="string"?(
                        <Image
                        src={Icon}
                        alt={name}
                        width={16}
                        height={16}
                        />
                    ):(
                        <Icon className="size-4 text-muted-foreground" />
                    )}
                    {children}
                 
                      <BaseHandle
                    id="source-1"
                    type="source"
                    position={Position.Right}
                    />
                </BaseNodeContent>
            </BaseNode>
           
        </WrokflowNode>
    )
})
BaseTriggerNode.displayName = "BaseTriggerNode";