import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";
import { NonRetriableError } from "inngest";
import ky ,{type Options as KyOptions } from "ky";
import { Variable } from "lucide-react";
import Handlebars from "handlebars";


Handlebars.registerHelper("json", (context)=> {
    const jsonString = JSON.stringify(context , null , 2);
    const safeString= new Handlebars.SafeString(jsonString)
    return safeString
});

type HttpRequestData = {
    variableName:string
    endpoint: string;
    method : "GET" | "POST" | "PUT" | "DELETE" | "PATCH" 
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

     if(!data.variableName){

        throw new NonRetriableError("Variable name not configured ");
    }

     if(!data.method){

        throw new NonRetriableError("method not configured ");
    }


    const result = await step.run("http-request" , async()=>{
        const endpoint = Handlebars.compile(data.endpoint)(context);
        console.log("ENDPOINT   ",endpoint);
        const method = data.method 
        const options: KyOptions ={method};
        if(["POST","PUT","PATCH"].includes(method)){
            const resolved = Handlebars.compile(data.body || "{}")(context);
            JSON.parse(resolved)
            
                options.body = resolved;
                options.headers = {
                    "Content-Type":"application/json",
                }
            
        }
        const responce = await ky(endpoint, options);
        const contentType = responce.headers.get("content-type");
        const responceData = contentType?.includes("application/json") ? await responce.json() : await responce.text();
        const responsePayload ={
             httpResponse:{
                status:responce.status,
                data:responceData,
                statusText:responce.statusText
            },
        }

        
             return {
            ...context,
            [data.variableName]:responsePayload
        }
        
          
       

    })


    // const result = await step.run("http-request", async()=>context)

    //Todo public success state 

    return { httpResponse: result }

}