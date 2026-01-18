import {channel , topic } from "@inngest/realtime"

export const OPENAI_CHANNEL_NAME  = "openai-execution"
export const openAiChannel = channel(OPENAI_CHANNEL_NAME)
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
    
}>(),

)