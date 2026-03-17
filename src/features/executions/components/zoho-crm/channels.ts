import { channel, topic } from "@inngest/realtime"

const ZOHO_CRM_CHANNEL_NAME = "zoho-crm-execution"

const zohoCrmRealtimeChannel = channel(ZOHO_CRM_CHANNEL_NAME).addTopic(
  topic("status").type<{
    status: "loading" | "success" | "error"
    nodeId: string
  }>()
)

type ZohoStatusPayload = {
  status: "loading" | "success" | "error"
  nodeId?: string
}

export const zohoCrmChannel = (nodeId: string) => ({
  topic: (_topicName: "status") => ({
    data: (payload: ZohoStatusPayload) =>
      (zohoCrmRealtimeChannel as unknown as { status: (value: { status: "loading" | "success" | "error"; nodeId: string }) => unknown }).status({
        status: payload.status,
        nodeId: payload.nodeId ?? nodeId,
      }),
  }),
})
