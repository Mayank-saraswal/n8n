"use server"

import { aggregateChannelName } from "@/inngest/channels/aggregate"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"

export async function fetchAggregateRealtimeToken(nodeId: string) {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: aggregateChannelName(nodeId),
      topics: ["status"],
    })
    return token
  } catch (error) {
    console.error("Failed to fetch Aggregate realtime token:", error)
    throw error
  }
}
