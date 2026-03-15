"use server"

import { razorpayTriggerChannel } from "@/inngest/channels/razorpay-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type RazorpayTriggerToken = Realtime.Token<ReturnType<typeof razorpayTriggerChannel>, ["status"]>

export async function fetchRazorpayTriggerRealtimeToken(): Promise<RazorpayTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: razorpayTriggerChannel(),
    topics: ["status"],
  })

  return token
}
