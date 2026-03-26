"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { CASHFREE_CHANNEL_NAME } from "@/inngest/channels/cashfree"

export type CashfreeToken = Realtime.Subscribe.Token

export async function fetchCashfreeRealtimeToken(): Promise<CashfreeToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: CASHFREE_CHANNEL_NAME,
    topics: ["status"],
  })
  return token
}
