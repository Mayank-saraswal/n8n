"use server"

import { filterChannelName } from "@/inngest/channels/filter"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"

export async function fetchFilterRealtimeToken(nodeId: string) {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: filterChannelName(nodeId),
      topics: ["status"],
    })
    return token
  } catch (error) {
    console.error("Failed to fetch Filter realtime token:", error)
    throw error
  }
}
