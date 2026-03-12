"use server"

import { codeChannel } from "@/inngest/channels/code"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type CodeToken = Realtime.Token<typeof codeChannel, ["status"]>

export async function fetchCodeRealtimeToken(): Promise<CodeToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: codeChannel(),
    topics: ["status"],
  })

  return token
}
