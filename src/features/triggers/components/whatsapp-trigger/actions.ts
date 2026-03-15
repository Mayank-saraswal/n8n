"use server"

import { whatsappTriggerChannel } from "@/inngest/channels/whatsapp-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type WhatsAppTriggerToken = Realtime.Token<ReturnType<typeof whatsappTriggerChannel>, ["status"]>

export async function fetchWhatsAppTriggerRealtimeToken(): Promise<WhatsAppTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: whatsappTriggerChannel(),
    topics: ["status"],
  })

  return token
}
