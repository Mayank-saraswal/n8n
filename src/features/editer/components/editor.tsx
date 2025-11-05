"use client"
import { LoadingView } from "@/components/entity-components"
import { useSuspennseWorkflow } from "@/features/workflows/hooks/use-workflows"

export const EditorLoading = ()=>{
    return(
        <LoadingView message="Loading Editor" />
    )
}

export const EditorError = ()=>{
    return(
        <LoadingView message=" Error Loading editor" />
    )
}


export const Editor = ({workflowId}:{workflowId:string}) => {
    const {data:workflow} = useSuspennseWorkflow(workflowId)
    return (
        <p>
            {JSON.stringify(workflow , null , 2)}
        </p>
    )
        
    
}