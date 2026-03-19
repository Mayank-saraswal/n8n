"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchAIRealtimeToken } from "../ai/actions"
import { AI_CHANNEL_NAME } from "@/inngest/channels/ai"

type GroqNodeData = Record<string, unknown>
type GroqNodeType = Node<GroqNodeData>

export const GroqNode = memo((props: NodeProps<GroqNodeType>) => (
  <AIBaseNode
    {...props}
    provider="GROQ"
    displayName="Groq"
    icon="/logos/groq.svg"
    channelName={AI_CHANNEL_NAME}
    refreshToken={() => fetchAIRealtimeToken(props.id)}
  />
))
GroqNode.displayName = "GroqNode"