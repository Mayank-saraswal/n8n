"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { zohoCrmChannel, zohoCrmChannelName } from "./channels"

export type ZohoCrmToken = Realtime.Token<ReturnType<typeof zohoCrmChannel>, ["status"]>

export async function fetchZohoCrmRealtimeToken(nodeId: string): Promise<ZohoCrmToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: zohoCrmChannelName(nodeId),
    topics: ["status"],
  })
  return token as ZohoCrmToken
}
