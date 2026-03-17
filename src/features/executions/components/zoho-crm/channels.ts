import { channel, topic } from "@inngest/realtime"

export const ZOHO_CRM_CHANNEL = "zoho-crm"

export const zohoCrmChannelName = (nodeId?: string): `zoho-crm${string}` =>
  `${ZOHO_CRM_CHANNEL}${nodeId ? `:${nodeId}` : ""}`

export const zohoCrmChannel = (nodeId?: string) => {
  const chan = channel(zohoCrmChannelName(nodeId)).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )()

  return {
    ...chan,
    topic: (id: "status") => ({
      data: chan[id],
    }),
  }
}
