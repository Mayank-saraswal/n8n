"use server"

import { msg91Channel } from "@/inngest/channels/msg91"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type Msg91Token = Realtime.Token<ReturnType<typeof msg91Channel>, ["status"]>

export async function fetchMsg91RealtimeToken(): Promise<Msg91Token> {
  const token = await getSubscriptionToken(inngest, {
    channel: msg91Channel(),
    topics: ["status"],
  })

  return token
}
