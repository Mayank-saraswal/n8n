import type { NodeExecutor } from "@/features/executions/types";
import { retry } from "@polar-sh/sdk/lib/retries.js";


type ManualTriggerData = Record<string, unknown>;
export const manualTriggerExecutor:NodeExecutor<ManualTriggerData> = async({
    
    nodeId,
    context,
    step,
}) =>{
    //Todo : publish loading state for manual trigger


    const result = await step.run("manual-trigger", async()=>context)

    //Todo public success state 

    return result
}