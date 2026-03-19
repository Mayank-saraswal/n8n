"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchAIRealtimeToken } from "../ai/actions"
import { AI_CHANNEL_NAME } from "@/inngest/channels/ai"

type XAINodeData = Record<string, unknown>
type XAINodeType = Node<XAINodeData>

export const XAiNode = memo((props: NodeProps<XAINodeType>) => (
  <AIBaseNode
    {...props}
    provider="XAI"
    displayName="xAI Grok"
    icon="/logos/xai.svg"
    channelName={AI_CHANNEL_NAME}
    refreshToken={() => fetchAIRealtimeToken(props.id)}
  />
))
XAiNode.displayName = "XAiNode"