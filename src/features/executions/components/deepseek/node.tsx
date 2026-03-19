"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchAIRealtimeToken } from "../ai/actions"
import { AI_CHANNEL_NAME } from "@/inngest/channels/ai"

type DeepseekNodeData = Record<string, unknown>
type DeepseekNodeType = Node<DeepseekNodeData>

export const DeepseekNode = memo((props: NodeProps<DeepseekNodeType>) => (
  <AIBaseNode
    {...props}
    provider="DEEPSEEK"
    displayName="DeepSeek"
    icon="/logos/deepseek.svg"
    channelName={AI_CHANNEL_NAME}
    refreshToken={() => fetchAIRealtimeToken(props.id)}
  />
))
DeepseekNode.displayName = "DeepseekNode"