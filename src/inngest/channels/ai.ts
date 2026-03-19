import { channel, topic } from "@inngest/realtime"

export const AI_CHANNEL_NAME = "ai-execution"

// String function — used in getSubscriptionToken (must return string)
export const aiChannelName = (nodeId?: string): `ai-execution${string}` =>
  `${AI_CHANNEL_NAME}${nodeId ? `:${nodeId}` : ""}`

// Channel object factory function — used in publish() and functions.ts
export const aiChannel = (nodeId?: string) =>
  channel(aiChannelName(nodeId)).addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
