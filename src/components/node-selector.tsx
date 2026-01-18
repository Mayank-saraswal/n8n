"use client"
import { createId} from "@paralleldrive/cuid2"
import { useReactFlow } from "@xyflow/react"
import {  GlobeIcon , MousePointerIcon } from "lucide-react"
import { useCallback } from "react"
import { toast } from "sonner"
import { 
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  
 } from "@/components/ui/sheet"

 import { NodeType } from "@/generated/prisma"
import { Separator } from "./ui/separator"
 
export type NodeTypeOptions ={
    type:NodeType,
    label:string,
    description:string,
    icon:React.ComponentType<{className?:string}> | string

}
const triggerNodes: NodeTypeOptions[] = [
    {
        type:NodeType.MANUAL_TRIGGER,
        label:" Trigger Manually",
        description:" Runs the flow on clicking a button , Good for getting started quickly",
        icon:MousePointerIcon
    },

     {
        type:NodeType.GOOGLE_FORM_TRIGGER,
        label:" Google Form",
        description:" Runs the flow when a Google Form is submitted",
        icon:"/logos/googleform.svg"
    },
    
     {
        type:NodeType.STRIPE_TRIGGER,
        label:" Stripe",
        description:" when stripe event is captured",
        icon:"/logos/stripe.svg"
    },
]

const executionNodes: NodeTypeOptions[] = [
    {
        type:NodeType.HTTP_REQUEST,
        label:"HTTP Request",
        description:"Runs the flow on receiving a HTTP request",
        icon:GlobeIcon
    },

     {
        type:NodeType.GEMINI,
        label:"Gemini",
        description:"Use google gemini to generate text",
        icon:"/logos/gemini.svg"
    },
    
     {
        type:NodeType.OPENAI,
        label:"OpenAi",
        description:"Use OpenAi to generate text",
        icon:"/logos/openai.svg"
    }
]

interface NodeSelectorProps{
    children:React.ReactNode
    open:boolean,
    onOpenChange:(open:boolean)=>void
}

export function NodeSelector ({
    open,
    onOpenChange,
    children
}:NodeSelectorProps){
    const {setNodes , getNodes, screenToFlowPosition} = useReactFlow()
const handleNodeSelect = useCallback((selection:NodeTypeOptions)=>{
    if (selection.type=== NodeType.MANUAL_TRIGGER){
        const nodes = getNodes()
        const hasManualTrigger = nodes.some((node)=>node.type===NodeType.MANUAL_TRIGGER)
        if (hasManualTrigger){
            toast.error("Only one Manual trigger is allowed per workflow")
            return
        }
    }
        
    setNodes((nodes)=>{
        const hasInitialTrigger = nodes.some((node)=>node.type===NodeType.INITIAL);
        const centreX = window.innerWidth / 2;
        const centreY = window.innerHeight / 2;
        const flowPosition = screenToFlowPosition({x:centreX +(Math.random()-0.5)*200, y:centreY+(Math.random()-0.5)*200})
         const newNode = {
        id:createId(),
        data:{},
        position:flowPosition,
        type:selection.type
        
    };
    if (hasInitialTrigger) {
        return[newNode]
    }
    return[...nodes,newNode]
    });
    onOpenChange(false)
   
    

} ,[setNodes , getNodes , onOpenChange , screenToFlowPosition] )
    return(
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-auto">
                <SheetHeader>
                    <SheetTitle>What triggers this Workflow?</SheetTitle>
                    <SheetDescription>
                      A trigger is a step that start your workflow.
                    </SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNodes.map((nodeType)=>{
                        const Icon = nodeType.icon;
                        return(
                            <div key={nodeType.type}
                            className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                            onClick={()=>handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center gap-6 w-full overrflow-hidden">
                                {typeof Icon ==="string"?(
                                    <img
                                    src={Icon}
                                    alt={nodeType.label}
                                    className="size-5 object-contain rounded-sm"
                                    />
                                ):(
                                    <Icon className="size-5" />
                                )}
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium text-sm">
                                        {nodeType.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {nodeType.description}
                                    

                                    </span>
                                </div>
                                </div>

                            </div>
                        )
                    })}
                </div>
                <Separator />
                

                 <div>
                    {executionNodes.map((nodeType)=>{
                        const Icon = nodeType.icon;
                        return(
                            <div key={nodeType.type}
                            className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                            onClick={()=>handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center gap-6 w-full overrflow-hidden">
                                {typeof Icon ==="string"?(
                                    <img
                                    src={Icon}
                                    alt={nodeType.label}
                                    className="size-5 object-contain rounded-sm"
                                    />
                                ):(
                                    <Icon className="size-5" />
                                )}
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium text-sm">
                                        {nodeType.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {nodeType.description}
                                    

                                    </span>
                                </div>
                                </div>

                            </div>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
    
}