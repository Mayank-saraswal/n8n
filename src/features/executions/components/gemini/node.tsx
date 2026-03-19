"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchGeminiRealtimeToken } from "./actions"
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini"

type GeminiNodeData = Record<string, unknown>
type GeminiNodeType = Node<GeminiNodeData>

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => (
  <AIBaseNode
    {...props}
    provider="GEMINI"
    displayName="Google Gemini"
    icon="/logos/gemini.svg"
    channelName={GEMINI_CHANNEL_NAME}
    refreshToken={fetchGeminiRealtimeToken}
  />
))
GeminiNode.displayName = "GeminiNode"