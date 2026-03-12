"use server"

import { setVariableChannel } from "@/inngest/channels/set-variable"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type SetVariableToken = Realtime.Token<typeof setVariableChannel, ["status"]>

export async function fetchSetVariableRealtimeToken(): Promise<SetVariableToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: setVariableChannel(),
    topics: ["status"],
  })

  return token
}
