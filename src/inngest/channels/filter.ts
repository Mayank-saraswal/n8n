import { channel, topic } from "@inngest/realtime"

export const FILTER_CHANNEL = "filter-execution"

export const filterChannelName = (nodeId?: string): string =>
  `${FILTER_CHANNEL}${nodeId ? `-${nodeId}` : ""}`

export const filterChannel = (nodeId?: string) =>
  channel(filterChannelName(nodeId)).addTopic(
    topic("status").type<{
      nodeId: string
      status: "loading" | "success" | "error"
    }>()
  )
