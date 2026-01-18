"use server"

import { xAiChannel } from "@/inngest/channels/xai"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"


export type XaiToken = Realtime.Token<typeof xAiChannel ,  ["status"]>

export async function fetchXaiRealtimeToken(): Promise<XaiToken >{
    const token = await getSubscriptionToken( inngest , {
        channel: xAiChannel(),
        topics: ["status"]
    })

  return token
}


