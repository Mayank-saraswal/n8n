"use server"

import { deepseekChannel } from "@/inngest/channels/deepseek"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"


export type DeepseekToken = Realtime.Token<typeof deepseekChannel ,  ["status"]>

export async function fetchDeepseekRealtimeToken(): Promise<DeepseekToken>{
    const token = await getSubscriptionToken( inngest , {
        channel: deepseekChannel(),
        topics: ["status"]
    })

  return token
}


