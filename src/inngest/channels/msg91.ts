import { channel, topic } from "@inngest/realtime"

export const MSG91_CHANNEL_NAME = "msg91-execution"
export const msg91Channel = () => channel(MSG91_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
