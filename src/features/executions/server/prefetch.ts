import type { inferInput } from "@trpc/tanstack-react-query";
import {prefetch , trpc } from "@/trpc/server"
import { QueryOptions } from "@tanstack/react-query";

type Input = inferInput<typeof trpc.executions.getMany>;

//for many
export const  prefetchExecutions = (params: Input) =>{
    return prefetch(trpc.executions.getMany.queryOptions(params))
};

//for one
export const prefetchExecution = ( id:string)=>{
    return(
        prefetch(trpc.executions.getOne.queryOptions({id}))
    )
}
