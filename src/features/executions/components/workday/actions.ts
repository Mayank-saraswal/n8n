"use server"

import { workdayChannel } from "@/inngest/channels/workday"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"


export type WorkdayToken = Realtime.Token<typeof workdayChannel, ["status"]>

export async function fetchWorkdayRealtimeToken(): Promise<WorkdayToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: workdayChannel(),
    topics: ["status"]
  })

  return token
}


