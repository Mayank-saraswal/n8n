"use server"

import { waitChannel } from "@/inngest/channels/wait"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type WaitToken = Realtime.Token<ReturnType<typeof waitChannel>, ["status"]>

export async function fetchWaitRealtimeToken(): Promise<WaitToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: waitChannel(),
    topics: ["status"],
  })

  return token
}
