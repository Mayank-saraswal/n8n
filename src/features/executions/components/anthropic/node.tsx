"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchAnthropicRealtimeToken } from "./actions"
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic"

type AnthropicNodeData = Record<string, unknown>
type AnthropicNodeType = Node<AnthropicNodeData>

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => (
  <AIBaseNode
    {...props}
    provider="ANTHROPIC"
    displayName="Anthropic"
    icon="/logos/anthropic.svg"
    channelName={ANTHROPIC_CHANNEL_NAME}
    refreshToken={fetchAnthropicRealtimeToken}
  />
))
AnthropicNode.displayName = "AnthropicAiNode"