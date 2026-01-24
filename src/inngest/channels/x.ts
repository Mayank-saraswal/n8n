import {channel , topic } from "@inngest/realtime"

export const X_CHANNEL_NAME  = "x-execution"
export const xChannel = channel(X_CHANNEL_NAME)
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
    
}>(),

)