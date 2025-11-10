"use client"
import type {NodeProps} from "@xyflow/react"
import { PlusIcon } from "lucide-react"
import { memo  , useState, } from "react"
import { PlaceholderNode } from "./react-flow/placeholder-node"
import { WrokflowNode } from "./workflow-node"
import { NodeSelector } from "./node-selector"

export const InitialNode = memo((props:NodeProps)=>{
    const [selectorOpen , setSelectorOpen] = useState(false) 
    return(
        <NodeSelector  open={selectorOpen} onOpenChange={setSelectorOpen}>
        <WrokflowNode showToolbar = {false}>
        <PlaceholderNode
        {...props}
        onClick={()=>{setSelectorOpen(true)}}
        
        >

            <div className="cursor-pointer flex items-center justify-center">
                <PlusIcon className="size-4" />
            </div>
        </PlaceholderNode>
        </WrokflowNode>
        </NodeSelector>
    )

})