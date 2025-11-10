import {  MousePointerIcon } from "lucide-react"
import { BaseTriggerNode } from "../base-trigger-node"
import { memo , useState } from "react"
import { NodeProps } from "@xyflow/react"
import { ManualTriggerDialog } from "./dialog"


export const ManualTriggerNode = memo((props:NodeProps)=>{
    const nodeStatus = "initial"
    const [dialogOpen , setDialogOpen] = useState(false)
    const handleOpenSettings = ()=>{
        setDialogOpen(true)
    }
    return(
        <>
        <ManualTriggerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
        
        />
        <BaseTriggerNode
            {...props}
            icon={MousePointerIcon}
            name = "When clicking 'Execute Node'"
            status = {nodeStatus}

            onSettings={handleOpenSettings}
            onDoubleClick = {handleOpenSettings}
            />

        </>
        )
})