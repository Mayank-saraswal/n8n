import { channel, topic } from "@inngest/realtime"

export const GOOGLE_SHEETS_CHANNEL_NAME = "google-sheets-execution"
export const googleSheetsChannel = channel(GOOGLE_SHEETS_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
