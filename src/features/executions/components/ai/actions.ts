"use server"

import { aiChannelName } from "@/inngest/channels/ai"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { aiChannel } from "@/inngest/channels/ai"

export type AIToken = Realtime.Token<ReturnType<typeof aiChannel>, ["status"]>

export async function fetchAIRealtimeToken(nodeId: string): Promise<AIToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: aiChannelName(nodeId),  // ← STRING, not object
    topics: ["status"],
  })
  return token as unknown as AIToken
}
