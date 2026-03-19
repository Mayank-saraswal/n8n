"use client"
import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"
import { AIBaseNode } from "../ai/node"
import { fetchXaiRealtimeToken } from "./actions"
import { XAI_CHANNEL_NAME } from "@/inngest/channels/xai"

type XAINodeData = Record<string, unknown>
type XAINodeType = Node<XAINodeData>

export const XAiNode = memo((props: NodeProps<XAINodeType>) => (
  <AIBaseNode
    {...props}
    provider="XAI"
    displayName="xAI Grok"
    icon="/logos/xai.svg"
    channelName={XAI_CHANNEL_NAME}
    refreshToken={fetchXaiRealtimeToken}
  />
))
XAiNode.displayName = "XAiNode"