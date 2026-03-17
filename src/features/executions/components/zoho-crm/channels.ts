import { channel, topic } from "@inngest/realtime"

export const ZOHO_CRM_CHANNEL = "zoho-crm"

export const zohoCrmChannel = (nodeId?: string) =>
  channel(`${ZOHO_CRM_CHANNEL}${nodeId ? `:${nodeId}` : ""}`).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
