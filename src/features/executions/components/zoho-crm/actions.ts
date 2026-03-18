"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { zohoCrmChannel } from "./channels"

export type ZohoCrmToken = Realtime.Token<
  ReturnType<typeof zohoCrmChannel>,
  ["status"]
>

export async function fetchZohoCrmRealtimeToken(nodeId: string): Promise<ZohoCrmToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: zohoCrmChannel(nodeId),
    topics: ["status"],
  })
  return token as unknown as ZohoCrmToken
}
