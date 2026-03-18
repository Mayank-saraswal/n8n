"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { hubspotChannel, HUBSPOT_CHANNEL_NAME } from "@/inngest/channels/hubspot"

export type HubspotToken = Realtime.Subscribe.Token

export async function fetchHubspotRealtimeToken(nodeId: string): Promise<HubspotToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: HUBSPOT_CHANNEL_NAME + (nodeId ? `:${nodeId}` : ""),
        topics: ["status"],
    })
    return token
}
