"use server"

import { aiChannelName } from "@/inngest/channels/ai"
import { aiChannel } from "@/inngest/channels/ai"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type AIToken = Realtime.Token<ReturnType<typeof aiChannel>, ["status"]>

export async function fetchAIRealtimeToken(nodeId: string): Promise<AIToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: aiChannelName(nodeId),
    topics: ["status"],
  })
  return token as unknown as AIToken
}
