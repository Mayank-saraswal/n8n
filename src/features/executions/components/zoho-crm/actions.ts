"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { zohoCrmChannel, zohoCrmChannelName } from "./channels"

export async function fetchZohoCrmRealtimeToken(nodeId: string) {
  const token = await getSubscriptionToken(inngest, {
    channel: zohoCrmChannelName(nodeId),
    topics: ["status"],
  })
  return token
}

export type ZohoCrmToken = Awaited<ReturnType<typeof fetchZohoCrmRealtimeToken>>
