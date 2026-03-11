import {channel , topic } from "@inngest/realtime"

export const GMAIL_CHANNEL_NAME  = "gmail-execution"
export const gmailChannel = channel(GMAIL_CHANNEL_NAME)
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
}>(),
)
