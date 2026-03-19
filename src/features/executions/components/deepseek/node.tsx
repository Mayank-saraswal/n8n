"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchDeepseekRealtimeToken } from "./actions"
import { DEEPSEEK_CHANNEL_NAME } from "@/inngest/channels/deepseek"

type DeepseekNodeData = Record<string, unknown>
type DeepseekNodeType = Node<DeepseekNodeData>

export const DeepseekNode = memo((props: NodeProps<DeepseekNodeType>) => (
  <AIBaseNode
    {...props}
    provider="DEEPSEEK"
    displayName="DeepSeek"
    icon="/logos/deepseek.svg"
    channelName={DEEPSEEK_CHANNEL_NAME}
    refreshToken={fetchDeepseekRealtimeToken}
  />
))
DeepseekNode.displayName = "DeepseekNode"