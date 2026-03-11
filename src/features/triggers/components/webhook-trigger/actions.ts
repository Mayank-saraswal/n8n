"use server"

import { webhookTriggerChannel } from "@/inngest/channels/webhook-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type WebhookTriggerToken = Realtime.Token<typeof webhookTriggerChannel ,  ["status"]>

export async function fetchWebhookTriggerRealtimeToken(): Promise<WebhookTriggerToken>{
    const token = await getSubscriptionToken( inngest , {
        channel: webhookTriggerChannel(),
        topics: ["status"]
    })

  return token
}
