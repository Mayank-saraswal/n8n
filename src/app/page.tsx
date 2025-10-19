import { getQueryClient , trpc} from "@/trpc/server"
import { Client } from "./client"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";


const Page = async ()=>{
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.getUsers.queryOptions())
  return(
    <div className="text-red-500 min-h-screen min-w-screen flex items-center justify-center">
      <HydrationBoundary state={dehydrate(queryClient)}>

      <Client />
      </HydrationBoundary>
    </div>
  )
}

export default Page