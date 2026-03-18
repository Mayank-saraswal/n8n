"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { hubspotChannel, HUBSPOT_CHANNEL_NAME } from "@/inngest/channels/hubspot"

export type HubspotToken = Realtime.Token<ReturnType<typeof hubspotChannel>, ["status"]>

export async function fetchHubspotRealtimeToken(nodeId: string): Promise<HubspotToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: `${HUBSPOT_CHANNEL_NAME}:${nodeId}`,
    topics: ["status"],
  })
  return token as unknown as HubspotToken
}