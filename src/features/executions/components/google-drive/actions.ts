"use server"

import { googleDriveChannel } from "@/inngest/channels/google-drive"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type GoogleDriveToken = Realtime.Token<
  typeof googleDriveChannel,
  ["status"]
>

export async function fetchGoogleDriveRealtimeToken(): Promise<GoogleDriveToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: googleDriveChannel(),
    topics: ["status"],
  })

  return token
}
