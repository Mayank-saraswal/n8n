import { channel, topic } from "@inngest/realtime"

export const FRESHDESK_CHANNEL_NAME = "freshdesk"

export const freshdeskChannelName = (nodeId?: string): `freshdesk${string}` =>
  `${FRESHDESK_CHANNEL_NAME}${nodeId ? `:${nodeId}` : ""}`

export const freshdeskChannel = (nodeId?: string) =>
  channel(freshdeskChannelName(nodeId)).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
