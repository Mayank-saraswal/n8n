import { channel, topic } from "@inngest/realtime"

export const FILTER_CHANNEL_NAME = (nodeId?: string) =>
  `filter-execution${nodeId ? `-${nodeId}` : ""}` as const

export const filterChannel = (nodeId?: string) =>
  channel(FILTER_CHANNEL_NAME(nodeId) as string).addTopic(
    topic("status").type<{
      nodeId: string
      status: "loading" | "success" | "error"
    }>()
  )()
