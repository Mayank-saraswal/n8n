"use client"

import { ExecutionStatus } from "@/generated/prisma"
import { CheckCircle2Icon , Loader2Icon , XCircleIcon , ClockIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card , CardContent , CardDescription, CardFooter , CardHeader , CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Collapsible , CollapsibleContent , CollapsibleTrigger } from "@/components/ui/collapsible"
import { useSuspennseExecution } from "../hooks/use-executions"
import { formatDistanceToNow } from "date-fns"

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


export const ExecutionView = ({executionId}: {executionId: string}) => {
  const {data: execution}= useSuspennseExecution(executionId)
  const [showStackTrace , setShowStackTrace] = useState(false)
  const duration = execution.completedAt
    ? Math.round(new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000
    : null;

  return (
    <Card className="shadow-none"> 
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>{formatStatus(execution.status)}</CardTitle>
            <CardDescription>
              Execution for {execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm text-muted-foreground font-medium">
                    Workflow
                </p>
                <Link 
                prefetch
                className="text-primary hover:underline text-sm"
                href={`/workflows/${execution.workflowId}`}>
                    {execution.workflow.name}
                </Link>
            </div>

            <div>
                <p className="text-sm text-muted-foreground font-medium">
                    Status
                </p>
                <p className="text-sm ">
                    {formatStatus(execution.status)}
                </p>
            </div>

            <div>
                <p className="text-sm text-muted-foreground font-medium">
                    Started At
                </p>
                <p className="text-sm ">
                    {formatDistanceToNow(new Date(execution.startedAt), {
                        addSuffix: true
                      })}
                </p>
            </div>

            <div>
                <p className="text-sm text-muted-foreground font-medium">
                    Started At
                </p>
                <p className="text-sm ">
                    {formatDistanceToNow(new Date(execution.startedAt), {
                        addSuffix: true
                      })}
                </p>
            </div>

            <div>
                <p className="text-sm text-muted-foreground font-medium">
                    Started At
                </p>
                <p className="text-sm ">
                    {formatDistanceToNow(new Date(execution.startedAt), {
                        addSuffix: true
                      })}
                </p>
            </div>
            {execution.completedAt ?(
                <div>
                <p className="text-sm text-muted-foreground font-medium">
                    Completed 
                </p>
                <p className="text-sm ">
                    {formatDistanceToNow(new Date(execution.completedAt), {
                        addSuffix: true
                      })}
                </p>
            </div>
            ):null}


             {duration !==null ?(
                <div>
                <p className="text-sm text-muted-foreground font-medium">
                    Duration 
                </p>
                <p className="text-sm ">
                    {duration} seconds
                </p>
            </div>
            ):null}

             
                <div>
                <p className="text-sm text-muted-foreground font-medium">
                    Event ID 
                </p>
                <p className="text-sm ">
                    {execution.inngestEventId}
                </p>
            </div>
            </div>
            {execution.error &&(
                <div className="mt-6 p-6 bg-red-50 rounded-md space-y-3">
                    <div>
                        <p className="text-sm font-medium text-red-900 mb-2">
                            Error
                        </p>
                        <p className="text-sm text-red-800 font-mono">
                            {execution.error}
                        </p>
                    </div>
                    {execution.errorStack &&(
                        <div>
                            <Collapsible 

                            onOpenChange={setShowStackTrace}
                            open={showStackTrace}
                            >
                                <CollapsibleTrigger
                                asChild
                                >
                                    <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-900 hover:bg-red-100"
                                    >
                                        {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <pre className="text-xs text-red-800 font-mono overflow-auto mt-2 bg-red-100 rounded">
                                        {execution.errorStack}
                                    </pre>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    )}
                
            </div>
            )}
           {execution.output &&(
            <div className="mt-6 p-6 bg-muted rounded-md ">
                <p className="text-sm font-medium mb-2">
                    Output
                </p>
                <pre className="text-xs text-mono overflow-auto">
                    {JSON.stringify(execution.output, null, 2)}
                </pre>
            </div>
           )}
      </CardContent>
      
    </Card>
  )
}