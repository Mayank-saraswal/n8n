
import { Editor, EditorError, EditorLoading } from "@/features/editer/components/editor"
import { EditorHeader } from "@/features/editer/components/editor-header"
import { prefetchWorkflow } from "@/features/workflows/server/prefetch"
import { requireAuth } from "@/lib/auth-utils"
import { HydrateClient } from "@/trpc/server"
import { ErrorBoundary } from "@sentry/nextjs"
import { Suspense } from "react"

interface PageProps{
    params:Promise<{
        workflowId:string
    }>
}


const Page = async({params}:PageProps)=>{
    await requireAuth()
    const {workflowId} = await params
    prefetchWorkflow(workflowId);
    return(
        <HydrateClient>
            <ErrorBoundary fallback={ <EditorError/>   }>
            <Suspense fallback={ <EditorLoading/> }>
            <main className="flex-1">
                <EditorHeader workflowId={workflowId}/>
                
            <Editor workflowId={workflowId}/>
            </main>
            </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}
export default Page;