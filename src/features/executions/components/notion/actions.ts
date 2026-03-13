"use server"

import { notionChannel } from "@/inngest/channels/notion"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type NotionToken = Realtime.Token<ReturnType<typeof notionChannel>, ["status"]>

export async function fetchNotionRealtimeToken(): Promise<NotionToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: notionChannel(),
    topics: ["status"],
  })

  return token
}
