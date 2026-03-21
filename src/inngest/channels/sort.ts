import { channel, topic } from "@inngest/realtime"

export const SORT_CHANNEL_NAME = (nodeId?: string) =>
  `sort-execution${nodeId ? `-${nodeId}` : ""}` as const

export const sortChannel = (nodeId?: string) =>
  channel(SORT_CHANNEL_NAME(nodeId) as string).addTopic(
    topic("status").type<{
      nodeId: string
      status: "loading" | "success" | "error"
    }>()
  )()
