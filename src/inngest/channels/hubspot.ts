import { channel, topic } from "@inngest/realtime"

export const HUBSPOT_CHANNEL_NAME = "hubspot-execution"

export const hubspotChannel = channel(
  (nodeId?: string) => `${HUBSPOT_CHANNEL_NAME}${nodeId ? `:${nodeId}` : ""}`
).addTopic(
  topic("status").type<{
    status: "loading" | "success" | "error"
    nodeId: string
  }>()
)
