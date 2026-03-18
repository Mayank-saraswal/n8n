"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { zohoCrmChannelName } from "./channels"

type ZohoCrmChannelName = ReturnType<typeof zohoCrmChannelName>
export type ZohoCrmToken = Realtime.Subscribe.Token<Realtime.Channel.AsChannel<ZohoCrmChannelName>, ["status"]>

export async function fetchZohoCrmRealtimeToken(nodeId: string): Promise<ZohoCrmToken> {
  const token = await getSubscriptionToken<ZohoCrmChannelName, ["status"], ZohoCrmToken>(inngest, {
    channel: zohoCrmChannelName(nodeId),
    topics: ["status"],
  })
  return token
}
