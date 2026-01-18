import type { inferInput } from "@trpc/tanstack-react-query";
import {prefetch , trpc } from "@/trpc/server"
import { QueryOptions } from "@tanstack/react-query";

type Input = inferInput<typeof trpc.credentials.getMany>;

//for many
export const  prefetchCredentials = (params: Input) =>{
    return prefetch(trpc.credentials.getMany.queryOptions(params))
};

//for one
export const prefetchCredential = ( id:string)=>{
    return(
        prefetch(trpc.credentials.getOne.queryOptions({id}))
    )
}
