"use server"

import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"
import { hubspotChannel, HUBSPOT_CHANNEL_NAME } from "@/inngest/channels/hubspot"

export type HubspotToken = Realtime.Token
