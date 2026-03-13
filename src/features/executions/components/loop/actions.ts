"use server"

import { loopChannel } from "@/inngest/channels/loop"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type LoopToken = Realtime.Token<typeof loopChannel, ["status"]>

export async function fetchLoopRealtimeToken(): Promise<LoopToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: loopChannel(),
    topics: ["status"],
  })

  return token
}
