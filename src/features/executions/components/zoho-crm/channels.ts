import { channel, topic } from "@inngest/realtime"

export const ZOHO_CRM_CHANNEL = "zoho-crm"

export const zohoCrmChannelName = (nodeId?: string): `zoho-crm${string}` =>
  `${ZOHO_CRM_CHANNEL}${nodeId ? `:${nodeId}` : ""}`

type ZohoCrmStatusPayload = {
  status: "loading" | "success" | "error"
  nodeId: string
}

export const zohoCrmChannel = (nodeId?: string) => {
  const realtimeChannel = channel(zohoCrmChannelName(nodeId)).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )()

  return Object.assign(realtimeChannel, {
    topic: (_topicName: "status") => ({
      data: (payload: ZohoCrmStatusPayload) => realtimeChannel.status(payload),
    }),
  })
}
