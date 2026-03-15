"use server"

import { mergeChannel } from "@/inngest/channels/merge"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type MergeToken = Realtime.Token<ReturnType<typeof mergeChannel>, ["status"]>

export async function fetchMergeRealtimeToken(): Promise<MergeToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: mergeChannel(),
    topics: ["status"],
  })

  return token
}
