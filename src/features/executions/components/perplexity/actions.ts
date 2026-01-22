"use server"

import { perplexityChannel } from "@/inngest/channels/perplexity"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"


export type PerplexityToken = Realtime.Token<typeof perplexityChannel ,  ["status"]>

export async function fetchPerplexityRealtimeToken(): Promise<PerplexityToken>{
    const token = await getSubscriptionToken( inngest , {
        channel: perplexityChannel(),
        topics: ["status"]
    })

  return token
}


