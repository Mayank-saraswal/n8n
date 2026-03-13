import { channel, topic } from "@inngest/realtime"

export const NOTION_CHANNEL_NAME = "notion-execution"
export const notionChannel = channel(NOTION_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
