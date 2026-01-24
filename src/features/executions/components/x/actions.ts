"use server"

import { xChannel } from "@/inngest/channels/x"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"


export type XToken = Realtime.Token<typeof xChannel, ["status"]>

export async function fetchXRealtimeToken(): Promise<XToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: xChannel(),
    topics: ["status"]
  })

  return token
}
