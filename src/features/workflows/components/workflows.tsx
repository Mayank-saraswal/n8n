"use client"

import { EmptyView, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useCreateWorkflow, useRemoveWorkflow,  useSuspennseWorkflows } from "../hooks/use-workflows";
import { EntityContainer } from "@/components/entity-components";

import { useUpgradeModal } from "../../../hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type{ workflow } from "@/generated/prisma";
import { WorkflowIcon } from "lucide-react";
import {formatDistanceToNow} from "date-fns"

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
    return(
      <EntityList
      items={workflows.data.items}
      getKey={(workflow)=>workflow.id}
      renderItem={(workflow)=> <WorkflowItem data={workflow} />  }
      emptyView =  {<WorkflowsEmpty/>}
      />
    )
}

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


export const WorkflowsLoading = ()=>{
  return(
    <LoadingView message="Loading workflows..."/>
  )
}

export const WorkflowsError = ()=>{
  return(
    <ErrorView message="Error Loading Workflows"/>
  )
}


export const WorkflowsEmpty = ()=>{
  const router = useRouter()
  const createWorkflow = useCreateWorkflow()
  const { handleError , modal} = useUpgradeModal()

  const handleCreate = ()=>{
    createWorkflow.mutate(undefined, {
      onError: (error)=>{
        handleError(error)
      },
      onSuccess: (data)=>{
        router.push(`/workflows/${data.id}`)
      }
    })
  } 

  return(
    <>
    {modal}
    <EmptyView 
    onNew={handleCreate}
    message="You haven't created any workflows yet. Get started by creating your frist workflow"/>
    </>
  )
}

export const WorkflowItem = ({
  data ,
}:{data:workflow})=>{

 const RemoveWorkflow = useRemoveWorkflow()
 const handleRemove = ()=>{
  RemoveWorkflow.mutate( {id: data.id})
 }

  return(
    <EntityItem
    herf={`/workflows/${data.id}`}
    title={data.name}
    subtitle= {
      <>
      Updated  {formatDistanceToNow(data.updatedAt , {addSuffix:true})}{""}
      &bull; Created{""}
      {formatDistanceToNow(data.createdAt, {addSuffix:true})}
      </>
    } image = {
      <div className="size-8 flex items-center justify-center">
        <WorkflowIcon className="size-5 text-muted-foreground" />

      </div>
    }onRemove={ handleRemove}
    isRemoving={RemoveWorkflow.isPending}

    />
  )
  
}