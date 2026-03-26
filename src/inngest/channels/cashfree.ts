import { channel, topic } from "@inngest/realtime"

export const CASHFREE_CHANNEL_NAME = "cashfree-execution"
export const cashfreeChannel = channel(CASHFREE_CHANNEL_NAME).addTopic(
  topic("status").type<{
    status: "loading" | "success" | "error"
    nodeId: string
  }>()
)
