import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";
import { schedulePoller } from "@/inngest/functions/schedule-poller";

export const { GET, POST, PUT } = serve({
  client: inngest,

  functions: [executeWorkflow, schedulePoller],
});
