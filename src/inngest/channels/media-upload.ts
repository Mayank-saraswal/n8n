import { channel, topic } from "@inngest/realtime"

export const MEDIA_UPLOAD_CHANNEL_NAME = "media-upload-execution"

export const mediaUploadChannelName = (nodeId?: string): `media-upload-execution${string}` =>
  `${MEDIA_UPLOAD_CHANNEL_NAME}${nodeId ? `:${nodeId}` : ""}`

export const mediaUploadChannel = (nodeId?: string) =>
  channel(mediaUploadChannelName(nodeId)).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )()
