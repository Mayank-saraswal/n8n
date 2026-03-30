import { channel, topic } from "@inngest/realtime"

export const POSTGRES_CHANNEL = "postgres-execution"

export const postgresChannelName = (nodeId?: string): string =>
  `${POSTGRES_CHANNEL}${nodeId ? "-" + nodeId : ""}`

export const postgresChannel = channel(postgresChannelName).addTopic(
  topic("status").type<{
    nodeId: string
    status: "loading" | "success" | "error"
  }>()
)
