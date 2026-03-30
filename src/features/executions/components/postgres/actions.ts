"use server"

import { postgresChannelName } from "@/inngest/channels/postgres"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"

export async function fetchPostgresRealtimeToken(nodeId: string) {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: postgresChannelName(nodeId),
      topics: ["status"],
    })
    return token
  } catch (error) {
    console.error("Failed to fetch Postgres realtime token:", error)
    throw error
  }
}
