import {channel , topic } from "@inngest/realtime"

export const DISCORD_CHANNEL_NAME  = "discord-execution"
export const discordChannel = channel(DISCORD_CHANNEL_NAME)
.addTopic(topic("status").type<{
    status:"loading" | "success" | "error"
    nodeId:string
    
}>(),

)