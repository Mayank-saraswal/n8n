import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useExecutionsParams} from "./use-executions.params";
import { CredentialType } from "@/generated/prisma";




export const useSuspennseExecutions= ()=>{
    const trpc = useTRPC()
    const [params ]  = useExecutionsParams()

    return useSuspenseQuery(trpc.executions.getMany.queryOptions(params))
};






export const useSuspennseExecution =(id:string)=>{
    const trpc = useTRPC()
    return useSuspenseQuery(
        trpc.executions.getOne.queryOptions({id})
    )
    
}

