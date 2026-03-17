"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { zohoCrmChannelName } from "./channels"

export type ZohoCrmToken = Realtime.Subscribe.Token

export async function fetchZohoCrmRealtimeToken(nodeId: string): Promise<ZohoCrmToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: zohoCrmChannelName(nodeId),
    topics: ["status"],
  })

  return token
}
