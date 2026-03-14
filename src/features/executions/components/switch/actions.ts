import type { Realtime } from "@inngest/realtime"
import { switchChannel } from "@/inngest/channels/switch"

export type SwitchToken = Realtime.Token<
  ReturnType<typeof switchChannel>,
  ["status"]
>
