import {channel , topic } from "@inngest/realtime"

export const XAI_CHANNEL_NAME  = "xai-execution"
export const xAiChannel = channel(XAI_CHANNEL_NAME )
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
    
}>(),

)