"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchAIRealtimeToken } from "../ai/actions"
import { AI_CHANNEL_NAME } from "@/inngest/channels/ai"

type OpenAINodeData = Record<string, unknown>
type OpenAINodeType = Node<OpenAINodeData>

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => (
  <AIBaseNode
    {...props}
    provider="OPENAI"
    displayName="OpenAI"
    icon="/logos/openai.svg"
    channelName={AI_CHANNEL_NAME}
    refreshToken={() => fetchAIRealtimeToken(props.id)}
  />
))
OpenAINode.displayName = "OpenAINode"