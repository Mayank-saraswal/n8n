import {channel , topic } from "@inngest/realtime"

export const TELEGRAM_CHANNEL_NAME  = "telegram-execution"
export const telegramChannel = channel(TELEGRAM_CHANNEL_NAME)
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
    
}>(),

)