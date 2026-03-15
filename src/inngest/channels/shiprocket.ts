import { channel, topic } from "@inngest/realtime"

export const SHIPROCKET_CHANNEL_NAME = "shiprocket-execution"
export const shiprocketChannel = () => channel(SHIPROCKET_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
