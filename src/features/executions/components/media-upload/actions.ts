"use server"

import { mediaUploadChannelName } from "@/inngest/channels/media-upload"
import { mediaUploadChannel } from "@/inngest/channels/media-upload"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type MediaUploadToken = Realtime.Token<ReturnType<typeof mediaUploadChannel>, ["status"]>

export async function fetchMediaUploadRealtimeToken(nodeId: string): Promise<MediaUploadToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: mediaUploadChannelName(nodeId),
    topics: ["status"],
  })
  return token as unknown as MediaUploadToken
}
