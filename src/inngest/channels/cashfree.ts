import { channel, topic } from "@inngest/realtime"

export const CASHFREE_CHANNEL = "cashfree-execution"

export const cashfreeChannelName = (nodeId?: string): `cashfree-execution${string}` =>
  `${CASHFREE_CHANNEL}${nodeId ? `:${nodeId}` : ""}`

export const cashfreeChannel = (nodeId?: string) =>
  channel(cashfreeChannelName(nodeId) as string).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )()
