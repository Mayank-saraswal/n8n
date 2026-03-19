"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchAIRealtimeToken } from "../ai/actions"
import { AI_CHANNEL_NAME } from "@/inngest/channels/ai"

type AnthropicNodeData = Record<string, unknown>
type AnthropicNodeType = Node<AnthropicNodeData>

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => (
  <AIBaseNode
    {...props}
    provider="ANTHROPIC"
    displayName="Anthropic"
    icon="/logos/anthropic.svg"
    channelName={AI_CHANNEL_NAME}
    refreshToken={() => fetchAIRealtimeToken(props.id)}
  />
))
AnthropicNode.displayName = "AnthropicAiNode"