"use server"

import { discordChannel } from "@/inngest/channels/discord"
import { telegramChannel } from "@/inngest/channels/telegram"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

  
export type TelegramToken = Realtime.Token<typeof telegramChannel ,  ["status"]>

export async function fetchTelegramRealtimeToken(): Promise<TelegramToken>{
    const token = await getSubscriptionToken( inngest , {
        channel: telegramChannel(),
        topics: ["status"]
    })

  return token
}


