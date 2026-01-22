import {channel , topic } from "@inngest/realtime"

export const DEEPSEEK_CHANNEL_NAME  = "deepseek-execution"
export const deepseekChannel = channel(DEEPSEEK_CHANNEL_NAME)
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
    
}>(),

)