import { channel, topic } from "@inngest/realtime"

export const GOOGLE_DRIVE_CHANNEL_NAME = "google-drive-execution"
export const googleDriveChannel = channel(GOOGLE_DRIVE_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
