"use server"

import { cashfreeChannel } from "@/inngest/channels/cashfree"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type CashfreeToken = Realtime.Token<ReturnType<typeof cashfreeChannel>, ["status"]>

export async function fetchCashfreeRealtimeToken(): Promise<CashfreeToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: cashfreeChannel(),
    topics: ["status"],
  })

  return token
}
