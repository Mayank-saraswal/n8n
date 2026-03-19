"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchPerplexityRealtimeToken } from "./actions"
import { PERPLEXITY_CHANNEL_NAME } from "@/inngest/channels/perplexity"

type PerplexityNodeData = Record<string, unknown>
type PerplexityNodeType = Node<PerplexityNodeData>

export const PerplexityNode = memo((props: NodeProps<PerplexityNodeType>) => (
  <AIBaseNode
    {...props}
    provider="PERPLEXITY"
    displayName="Perplexity"
    icon="/logos/perplexity.svg"
    channelName={PERPLEXITY_CHANNEL_NAME}
    refreshToken={fetchPerplexityRealtimeToken}
  />
))
PerplexityNode.displayName = "PerplexityNode"