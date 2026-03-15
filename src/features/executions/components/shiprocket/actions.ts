"use server"

import { shiprocketChannel } from "@/inngest/channels/shiprocket"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type ShiprocketToken = Realtime.Token<ReturnType<typeof shiprocketChannel>, ["status"]>

export async function fetchShiprocketRealtimeToken(): Promise<ShiprocketToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: shiprocketChannel(),
    topics: ["status"],
  })

  return token
}
