"use client"

import { EmptyView, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import {  useRemoveCredential,   useSuspennseCredentials } from "../hooks/use-credentials";
import { EntityContainer } from "@/components/entity-components";

import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type{ Credenial, } from "@/generated/prisma";
import  { CredentialType  } from "@/generated/prisma";
import { KeyIcon } from "lucide-react";
import {formatDistanceToNow} from "date-fns"
import Image from "next/image";

export  const CredentialsSearch= ()=>{
  const [ params , setParams ] =  useCredentialsParams()
  const { searchValue , onSearchChange } = useEntitySearch({
    params,
    setParams,
    
  })


  return (
    <EntitySearch
    value={searchValue}
    onChange={onSearchChange }
    placeholder="Search credentials"
    
    />
  )
}








export const CredentialsList = () => {
    const credentials = useSuspennseCredentials()
    return(
      <EntityList
      items={credentials.data.items}
      getKey={(credential)=>credential.id}
      renderItem={(credential)=> <CredentialsItem data={credential} />  }
      emptyView =  {<CredentialsEmpty/>}
      />
    )
}

export const CredentialsHeader = ({disabled}:{disabled?:boolean}) => {




  
    return (
        
        <EntityHeader title="Credentials"
        description="Create and manage credentials"
        newButtonHerf="credentials/new"
        newButtonLabel="New credentials"
        disabled={disabled}

        />
        
    )
}

export const CredentialsPagination = ()=>{
  const credentials = useSuspennseCredentials()
  const [ params , setParams ] = useCredentialsParams()

  return(
    <EntityPagination
    disabled = {credentials.isFetching}
    totalPages={credentials.data.totalPages }
    page={credentials.data.page}
    onPageChange={(page)=>{
      setParams({
        ...params,
        page
      })
    }}
    
    />
  )
}


export const CredentialsContainer = ({children}:{children:React.ReactNode})=>{
  return(
    <EntityContainer
    header={<CredentialsHeader/>}
    search={<CredentialsSearch/>}
    pagination={<CredentialsPagination/>}

    >
        {children}
    </EntityContainer>
  )
}


export const CredentialsLoading = ()=>{
  return(
    <LoadingView message="Loading Credentials..."/>
  )
}

export const CredentialsError = ()=>{
  return(
    <ErrorView message="Error Loading Credentials"/>
  )
}


export const CredentialsEmpty = ()=>{
  const router = useRouter()

  const handleCreate = ()=>{
    router.push(`/credentials/new`)
  } 

  return(
    <EmptyView 
    onNew={handleCreate}
    message="You haven't created any credentials yet. Get started by creating your first credentials"/>
  )
}

const credentialsLogos:Record<CredentialType , string> = {
  [CredentialType.OPENAI]:"/logos/openai.svg",
  [CredentialType.ANTHROPIC]:"/logos/anthropic.svg",
  [CredentialType.GEMINI]:"/logos/gemini.svg",
}

export const CredentialsItem = ({
  data ,
}:{data:Credenial})=>{

 const RemoveCredentials = useRemoveCredential()
 const handleRemove = ()=>{
  RemoveCredentials.mutate( {id: data.id})
 }

 const logo= credentialsLogos[data.type] || "/logos/openai.svg";

  return(
    <EntityItem
    herf={`/credentials/${data.id}`}
    title={data.name}
    subtitle= {
      <>
      Updated  {formatDistanceToNow(data.updatedAt , {addSuffix:true})}{""}
      &bull; Created{""}
      {formatDistanceToNow(data.createdAt, {addSuffix:true})}
      </>
    } image = {
      <div className="size-8 flex items-center justify-center">
        <Image src={logo} alt={data.type} width={20} height={20}/>

      </div>
    }onRemove={ handleRemove}
    isRemoving={RemoveCredentials.isPending}

    />
  )
  
}