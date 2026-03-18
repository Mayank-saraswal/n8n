"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { ZOHO_CRM_CHANNEL } from "./channels"

export type ZohoCrmToken = Realtime.Subscribe.Token

export async function fetchZohoCrmRealtimeToken(nodeId: string): Promise<ZohoCrmToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: ZOHO_CRM_CHANNEL + (nodeId ? `:${nodeId}` : ""),
    topics: ["status"],
  })
  return token
}
