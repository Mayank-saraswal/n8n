"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { FRESHDESK_CHANNEL_NAME } from "@/inngest/channels/freshdesk"

export type FreshdeskToken = Realtime.Subscribe.Token

export async function fetchFreshdeskRealtimeToken(nodeId: string): Promise<FreshdeskToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: FRESHDESK_CHANNEL_NAME + (nodeId ? `:${nodeId}` : ""),
    topics: ["status"],
  })
  return token
}
