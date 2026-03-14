"use server"

import { notionChannel } from "@/inngest/channels/notion"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken } from "@inngest/realtime"

export async function fetchNotionRealtimeToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: notionChannel(),
    topics: ["status"],
  })

  return token
}
