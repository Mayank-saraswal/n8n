import { channel, topic } from "@inngest/realtime"

export const ERROR_TRIGGER_CHANNEL_NAME = "error-trigger-execution"
export const errorTriggerChannel = () =>
  channel(ERROR_TRIGGER_CHANNEL_NAME).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
