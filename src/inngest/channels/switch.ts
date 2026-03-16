import { channel, topic } from "@inngest/realtime"

export const SWITCH_CHANNEL_NAME = "switch-execution"
export const switchChannel = channel(SWITCH_CHANNEL_NAME).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
