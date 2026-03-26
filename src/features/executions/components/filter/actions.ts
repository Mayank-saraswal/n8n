"use server"

import { filterChannel, filterChannelName } from "@/inngest/channels/filter"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type FilterToken = Realtime.Subscribe.Token

export async function fetchFilterRealtimeToken(nodeId: string): Promise<FilterToken> {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: filterChannelName(nodeId),
      topics: ["status"],
    })
    return token as unknown as FilterToken
  } catch (error) {
    console.error("Failed to fetch Filter realtime token:", error)
    throw error
  }
}
