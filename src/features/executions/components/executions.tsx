"use client"

import { EmptyView, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspennseExecutions } from "../hooks/use-executions";
import { EntityContainer } from "@/components/entity-components";

import { useRouter } from "next/navigation";
import { useExecutionsParams } from "../hooks/use-executions.params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Credenial, Execution, } from "@/generated/prisma";
import { CredentialType, ExecutionStatus } from "@/generated/prisma";
import { CheckCircle2Icon, ClockIcon, KeyIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns"
import Image from "next/image";











export const ExecutionsList = () => {
  const executions = useSuspennseExecutions()
  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionsItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  )
}

export const ExecutionsHeader = () => {





  return (

    <EntityHeader
     title="Executions"
     description="Create and manage executions"
    />

  )
}

export const ExecutionsPagination = () => {
  const executions = useSuspennseExecutions()
  const [params, setParams] = useExecutionsParams()

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => {
        setParams({
          ...params,
          page
        })
      }}

    />
  )
}


export const ExecutionsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}

    >
      {children}
    </EntityContainer>
  )
}


export const ExecutionsLoading = () => {
  return (
    <LoadingView message="Loading Executions..." />
  )
}

export const ExecutionsError = () => {
  return (
    <ErrorView message="Error Loading Executions" />
  )
}


export const ExecutionsEmpty = () => {


  return (
    <EmptyView
      message="You haven't created any executions yet. Get started by running  your frist workflow" />
  )
}

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-500"/>
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-500"/>
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-500 animate-spin"/>
    default:
      return <ClockIcon className="size-5 text-gray-500"/>
  }
}

const formatStatus = (status: ExecutionStatus) => {
 return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export const ExecutionsItem = ({
  data,
}: {
  data: Execution & {
    workflow: {
      id: string
      name: string
    }
  }
}) => {

  const duration = data.completedAt
    ? Math.round(new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000
    : null;

  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{""}
      {formatDistanceToNow(new Date(data.startedAt), {
        addSuffix: true
      })}
      {duration !== null && ` • Duration: ${duration}s`}
    </>
  )


  return (
    <EntityItem
      herf={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}

      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }

    />
  )

}