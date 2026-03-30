import { channel, topic } from "@inngest/realtime"

export const AGGREGATE_CHANNEL = "aggregate-execution"

export const aggregateChannelName = (nodeId?: string): string =>
  `${AGGREGATE_CHANNEL}${nodeId ? `-${nodeId}` : ""}`

export const aggregateChannel = channel(aggregateChannelName).addTopic(
  topic("status").type<{
    nodeId: string
    status: "loading" | "success" | "error"
  }>()
)
