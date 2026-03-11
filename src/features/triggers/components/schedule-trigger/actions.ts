"use server"

import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type ScheduleTriggerToken = Realtime.Token<typeof scheduleTriggerChannel ,  ["status"]>

export async function fetchScheduleTriggerRealtimeToken(): Promise<ScheduleTriggerToken>{
    const token = await getSubscriptionToken( inngest , {
        channel: scheduleTriggerChannel(),
        topics: ["status"]
    })

  return token
}
