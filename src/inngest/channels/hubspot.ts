import { channel, topic } from "@inngest/realtime"

export const HUBSPOT_CHANNEL_NAME = "hubspot-execution"

export const hubspotChannel = (nodeId?: string) =>
  channel(`${HUBSPOT_CHANNEL_NAME}${nodeId ? `:${nodeId}` : ""}`).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
