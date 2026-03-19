"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchOpenAiRealtimeToken } from "./actions"
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai"

type OpenAINodeData = Record<string, unknown>
type OpenAINodeType = Node<OpenAINodeData>

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => (
  <AIBaseNode
    {...props}
    provider="OPENAI"
    displayName="OpenAI"
    icon="/logos/openai.svg"
    channelName={OPENAI_CHANNEL_NAME}
    refreshToken={fetchOpenAiRealtimeToken}
  />
))
OpenAINode.displayName = "OpenAINode"