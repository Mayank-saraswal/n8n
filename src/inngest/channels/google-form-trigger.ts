import {channel , topic } from "@inngest/realtime"

export const GOOGLE_FORM_TRIGGER_CHANNEL_NAME  = "google-from-trigger-execution"
export const googleformTriggerChannel = channel(GOOGLE_FORM_TRIGGER_CHANNEL_NAME)
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
    
}>(),

)