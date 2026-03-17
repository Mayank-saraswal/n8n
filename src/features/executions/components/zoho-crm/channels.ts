import { channel, topic } from "@inngest/realtime"

export const ZOHO_CRM_CHANNEL = "zoho-crm"

type ZohoCrmStatusPayload = {
  status: "loading" | "success" | "error"
  nodeId?: string
}

type ZohoCrmStatusEvent = {
  status: "loading" | "success" | "error"
  nodeId: string
}

export const zohoCrmChannelName = (nodeId?: string) =>
  `${ZOHO_CRM_CHANNEL}${nodeId ? `:${nodeId}` : ""}`

export const zohoCrmRealtimeChannel = (nodeId?: string) =>
  channel(zohoCrmChannelName(nodeId)).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )

export const zohoCrmChannel = (nodeId?: string) => ({
  topic: (_topicName: "status") => ({
    data: (payload: ZohoCrmStatusPayload) =>
      (
        zohoCrmRealtimeChannel(nodeId) as unknown as {
          status: (event: ZohoCrmStatusEvent) => unknown
        }
      ).status({
        status: payload.status,
        nodeId: payload.nodeId ?? nodeId ?? "",
      }),
  }),
})
