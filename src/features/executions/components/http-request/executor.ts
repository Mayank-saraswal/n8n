import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";
import { NonRetriableError } from "inngest";
import ky ,{type Options as KyOptions } from "ky";


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

    const result = await step.run("http-request" , async()=>{
        const endpoint = data.endpoint!
        const method = data.method || "GET"
        const options: KyOptions ={method};
        if(["POST","PUT","PATCH"].includes(method)){
            
                options.body = data.body
            
        }
        const responce = await ky(endpoint, options);
        const contentType = responce.headers.get("content-type");
        const responceData = contentType?.includes("application/json") ? await responce.json() : await responce.text();

        return {
            ...context,
            httpResponse:{
                status:responce.status,
                data:responceData,
                statusText:responce.statusText
            }
        }

    })


    // const result = await step.run("http-request", async()=>context)

    //Todo public success state 

    return { httpResponse: result }

}