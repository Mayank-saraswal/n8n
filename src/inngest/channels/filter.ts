import { channel, topic } from "@inngest/realtime"

export const FILTER_CHANNEL = "filter-execution"

export const filterChannelName = (nodeId?: string): `filter-execution${string}` =>
  `${FILTER_CHANNEL}${nodeId ? `:${nodeId}` : ""}`

export const filterChannel = (nodeId?: string) =>
  channel(filterChannelName(nodeId) as string).addTopic(
    topic("status").type<{
      nodeId: string
      status: "loading" | "success" | "error"
    }>()
  )()
