"use server"

import { mediaUploadChannel } from "@/inngest/channels/media-upload"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type MediaUploadToken = Realtime.Token<ReturnType<typeof mediaUploadChannel>, ["status"]>

export async function fetchMediaUploadRealtimeToken(): Promise<MediaUploadToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: mediaUploadChannel(),
        topics: ["status"]
    })

    return token
}
