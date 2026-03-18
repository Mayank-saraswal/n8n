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
  // getSubscriptionToken accepts a channel name string but drops the topic-typed payload when doing so;
  // narrow back to the zohoCrmChannel definition so downstream calls keep the status payload typing.
  return token as ZohoCrmToken
}
