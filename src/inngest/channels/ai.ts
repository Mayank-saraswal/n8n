import { channel, topic } from "@inngest/realtime"

export const AI_CHANNEL_NAME = "ai-execution"

export const aiChannelName = (nodeId?: string): `ai-execution${string}` =>
  `${AI_CHANNEL_NAME}${nodeId ? `:${nodeId}` : ""}`

export const aiChannel = (nodeId?: string) =>
  channel(aiChannelName(nodeId) as string).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
