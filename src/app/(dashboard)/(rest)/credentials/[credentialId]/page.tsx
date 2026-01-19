import { requireAuth } from "@/lib/auth-utils"
import { CredentialView } from "@/features/credentials/components/credential"
import { prefetchCredential } from "@/features/credentials/server/prefetch"
import { HydrateClient } from "@/trpc/server"
import { ErrorBoundary } from "react-error-boundary"
import { CredentialsError, CredentialsLoading } from "@/features/credentials/components/credentials"
import { Suspense } from "react"
interface PageProps{
    params:Promise<{
        credentialId:string
    }>
}


const Page = async({params}:PageProps)=>{
    await requireAuth()
    const {credentialId} = await params
    prefetchCredential(credentialId)
    return(
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-6 h-full">
                <HydrateClient>
                    <ErrorBoundary fallback={<CredentialsError/>}>
                    <Suspense fallback={<CredentialsLoading/>}>
                          <CredentialView credentialId={credentialId}/>
                    </Suspense>
                </ErrorBoundary>
                </HydrateClient>
            </div>
        
        </div>
    )
}
export default Page;