"use server"

import { hubspotChannel } from "@/inngest/channels/hubspot"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type HubspotToken = Realtime.Token<ReturnType<typeof hubspotChannel>, ["status"]>

export async function fetchHubspotRealtimeToken(nodeId: string): Promise<HubspotToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: hubspotChannel(nodeId),
    topics: ["status"],
  })
  return token
}
