"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchAIRealtimeToken } from "../ai/actions"
import { AI_CHANNEL_NAME } from "@/inngest/channels/ai"

type PerplexityNodeData = Record<string, unknown>
type PerplexityNodeType = Node<PerplexityNodeData>

export const PerplexityNode = memo((props: NodeProps<PerplexityNodeType>) => (
  <AIBaseNode
    {...props}
    provider="PERPLEXITY"
    displayName="Perplexity"
    icon="/logos/perplexity.svg"
    channelName={AI_CHANNEL_NAME}
    refreshToken={() => fetchAIRealtimeToken(props.id)}
  />
))
PerplexityNode.displayName = "PerplexityNode"