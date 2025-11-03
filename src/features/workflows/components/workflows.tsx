"use client"

import { EntityHeader, EntityPagination, EntitySearch } from "@/components/entity-components";
import { useCreateWorkflow, useSuspennseWorkflows } from "../hooks/use-workflows";
import { EntityContainer } from "@/components/entity-components";

import { useUpgradeModal } from "../../../hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

export  const WorkflowsSearch= ()=>{
  const [ params , setParams ] =  useWorkflowParams()
  const { searchValue , onSearchChange } = useEntitySearch({
    params,
    setParams,
    
  })


  return (
    <EntitySearch
    value={searchValue}
    onChange={onSearchChange }
    placeholder="Search Workflows"
    
    />
  )
}








export const WorkflowsList = () => {

    const workflows = useSuspennseWorkflows()
  return (
    <div className="flex-1 flex justify-center items-center">
    <p>
        {JSON.stringify(workflows.data, null, 2)}
    </p>
    </div>
  )
};

export const WorkflowsHeader = ({disabled}:{disabled?:boolean}) => {

  const createWorkflow = useCreateWorkflow()
  const { handleError , modal} = useUpgradeModal()
  const router = useRouter()



  const handleCreate = ()=>{
    createWorkflow.mutate(undefined, {
      onSuccess: (data)=>{
        router.push(`/workflows/${data.id}`)
      },
      onError: (error)=>{
        handleError(error)
      }
    })
  }
    return (
        <>
        {modal}
        <EntityHeader title="Workflows"
        description="Create and manage workflows"
        onNew={ handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}

        isCreating = {createWorkflow.isPending}
        />
        </>
    )
}

export const WorkflowsPagination = ()=>{
  const workflows = useSuspennseWorkflows()
  const [ params , setParams ] = useWorkflowParams()

  return(
    <EntityPagination
    disabled = {workflows.isFetching}
    totalPages={workflows.data.totalPages }
    page={workflows.data.page}
    onPageChange={(page)=>{
      setParams({
        ...params,
        page
      })
    }}
    
    />
  )
}


export const WorkflowsContainer = ({children}:{children:React.ReactNode})=>{
  return(
    <EntityContainer
    header={<WorkflowsHeader/>}
    search={<WorkflowsSearch/>}
    pagination={<WorkflowsPagination/>}

    >
        {children}
    </EntityContainer>
  )
}

