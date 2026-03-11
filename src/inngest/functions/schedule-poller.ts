import { CronExpressionParser } from "cron-parser";
import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";

export const schedulePoller = inngest.createFunction(
  {
    id: "schedule-poller",
    name: "Schedule Trigger Poller",
  },
  { cron: "* * * * *" },
  async ({ step }) => {
    return await step.run("check-scheduled-workflows", async () => {
      const activeTriggers = await prisma.scheduleTrigger.findMany({
        where: { isActive: true },
        include: { workflow: true },
      });

      const now = new Date();
      const fired: string[] = [];

      for (const trigger of activeTriggers) {
        try {
          const interval = CronExpressionParser.parse(trigger.cronExpression, {
            currentDate: now,
            tz: trigger.timezone ?? "UTC",
          });

          const prev = interval.prev();
          const secondsSincePrev =
            (now.getTime() - prev.toDate().getTime()) / 1000;

          if (secondsSincePrev <= 60) {
            await sendWorkflowExecution({
              workflowId: trigger.workflowId,
              triggerData: {
                schedule: {
                  firedAt: now.toISOString(),
                  workflowId: trigger.workflowId,
                  cronExpression: trigger.cronExpression,
                  timezone: trigger.timezone ?? "UTC",
                },
              },
            });
            fired.push(trigger.workflowId);
          }
        } catch (err) {
          console.error(
            `Failed to process schedule trigger for workflow ${trigger.workflowId}:`,
            err,
          );
        }
      }

      return {
        checked: activeTriggers.length,
        fired: fired.length,
        firedWorkflows: fired,
      };
    });
  },
);
