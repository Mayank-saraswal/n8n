import {channel , topic } from "@inngest/realtime"

export const PERPLEXITY_CHANNEL_NAME  = "perplexity-execution"
export const perplexityChannel = channel(PERPLEXITY_CHANNEL_NAME)
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
    
}>(),

)