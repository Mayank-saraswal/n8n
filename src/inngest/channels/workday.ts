import { channel, topic } from "@inngest/realtime"

export const WORKDAY_CHANNEL_NAME = "workday-execution"
export const workdayChannel = channel(WORKDAY_CHANNEL_NAME)
    .addTopic(topic("status").type<{
        status: "loading" | "success" | "error"
        nodeId: string

    }>(),

    )
