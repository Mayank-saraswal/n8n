"use server"

import { sortChannel, SORT_CHANNEL_NAME } from "@/inngest/channels/sort"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type SortToken = Realtime.Token<ReturnType<typeof sortChannel>, ["status"]>

export async function fetchSortRealtimeToken(nodeId: string): Promise<SortToken> {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: SORT_CHANNEL_NAME(nodeId),
      topics: ["status"],
    })
    return token as unknown as SortToken
  } catch (error) {
    console.error("Failed to fetch Sort realtime token:", error)
    throw error
  }
}
