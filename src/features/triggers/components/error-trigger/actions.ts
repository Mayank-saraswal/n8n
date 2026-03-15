"use server"

import { errorTriggerChannel } from "@/inngest/channels/error-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type ErrorTriggerToken = Realtime.Token<ReturnType<typeof errorTriggerChannel>, ["status"]>

export async function fetchErrorTriggerRealtimeToken(): Promise<ErrorTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: errorTriggerChannel(),
        topics: ["status"]
    })

    return token
}
