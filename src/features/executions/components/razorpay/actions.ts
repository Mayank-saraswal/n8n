"use server"

import { razorpayChannel } from "@/inngest/channels/razorpay"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type RazorpayToken = Realtime.Token<ReturnType<typeof razorpayChannel>, ["status"]>

export async function fetchRazorpayRealtimeToken(): Promise<RazorpayToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: razorpayChannel(),
    topics: ["status"],
  })

  return token
}
