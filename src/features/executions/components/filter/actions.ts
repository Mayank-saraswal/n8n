"use server"

import { filterChannel, FILTER_CHANNEL_NAME } from "@/inngest/channels/filter"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type FilterToken = Realtime.Token<ReturnType<typeof filterChannel>, ["status"]>

export async function fetchFilterRealtimeToken(nodeId: string): Promise<FilterToken> {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: FILTER_CHANNEL_NAME(nodeId),
      topics: ["status"],
    })
    return token as unknown as FilterToken
  } catch (error) {
    console.error("Failed to fetch Filter realtime token:", error)
    throw error
  }
}
