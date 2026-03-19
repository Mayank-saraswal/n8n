"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchAIRealtimeToken } from "../ai/actions"
import { AI_CHANNEL_NAME } from "@/inngest/channels/ai"

type GeminiNodeData = Record<string, unknown>
type GeminiNodeType = Node<GeminiNodeData>

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => (
  <AIBaseNode
    {...props}
    provider="GEMINI"
    displayName="Google Gemini"
    icon="/logos/gemini.svg"
    channelName={AI_CHANNEL_NAME}
    refreshToken={() => fetchAIRealtimeToken(props.id)}
  />
))
GeminiNode.displayName = "GeminiNode"