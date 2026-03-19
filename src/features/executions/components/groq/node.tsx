"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchGroqRealtimeToken } from "./actions"
import { GROQ_CHANNEL_NAME } from "@/inngest/channels/groq"

type GroqNodeData = Record<string, unknown>
type GroqNodeType = Node<GroqNodeData>

export const GroqNode = memo((props: NodeProps<GroqNodeType>) => (
  <AIBaseNode
    {...props}
    provider="GROQ"
    displayName="Groq"
    icon="/logos/groq.svg"
    channelName={GROQ_CHANNEL_NAME}
    refreshToken={fetchGroqRealtimeToken}
  />
))
GroqNode.displayName = "GroqNode"