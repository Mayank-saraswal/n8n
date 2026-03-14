import { channel, topic } from "@inngest/realtime"

export const RAZORPAY_CHANNEL_NAME = "razorpay-execution"
export const razorpayChannel = () => channel(RAZORPAY_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      status: "loading" | "success" | "error"
      nodeId: string
    }>()
  )
