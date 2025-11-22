import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";
import { NonRetriableError } from "inngest";


type HttpRequestData = {
    endpoint?: string;
    method? : "GET" | "POST" | "PUT" | "DELETE" | "PATCH" 
    body?:string
};
export const httpRequestExecutor:NodeExecutor<HttpRequestData> = async({
    data,
    nodeId,
    context,
    step,
}) =>{
    //Todo : publish loading state for http request
    if(!data.endpoint){

        throw new NonRetriableError("HttpRequest node:No endpoint configure");
    }

    const result = await step.fetch(data.endpoint)


    // const result = await step.run("http-request", async()=>context)

    //Todo public success state 

    return result
}