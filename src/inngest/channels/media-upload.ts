import { channel, topic } from "@inngest/realtime"

export const MEDIA_UPLOAD_CHANNEL_NAME = "media-upload-execution"

export const mediaUploadChannel = channel(MEDIA_UPLOAD_CHANNEL_NAME).addTopic(
  topic("status").type<{
    status: "loading" | "success" | "error"
    nodeId: string
  }>()
)
