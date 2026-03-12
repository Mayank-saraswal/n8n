import { channel, topic } from "@inngest/realtime"

export const CODE_CHANNEL_NAME = "code-execution"
export const codeChannel = channel(CODE_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
