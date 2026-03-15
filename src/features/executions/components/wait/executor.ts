import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { waitChannel } from "@/inngest/channels/wait"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { NonRetriableError } from "inngest"

/**
 * Convert a duration + unit to an Inngest-compatible sleep string.
 * Inngest step.sleep accepts: "30s", "5m", "2h", "1d", etc.
 */
function toSleepDuration(duration: number, unit: string): string {
  switch (unit) {
    case "seconds":
      return `${duration}s`
    case "minutes":
      return `${duration}m`
    case "hours":
      return `${duration}h`
    case "days":
      return `${duration}d`
    case "weeks":
      return `${duration * 7}d`
    default:
      return `${duration}m`
  }
}

/**
 * Convert a duration + unit to milliseconds (for output).
 */
function toMs(duration: number, unit: string): number {
  switch (unit) {
    case "seconds":
      return duration * 1_000
    case "minutes":
      return duration * 60_000
    case "hours":
      return duration * 3_600_000
    case "days":
      return duration * 86_400_000
    case "weeks":
      return duration * 604_800_000
    default:
      return duration * 60_000
  }
}

export const waitExecutor: NodeExecutor = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    waitChannel().status({
      nodeId,
      status: "loading",
    })
  )

  const config = await step.run(`wait-${nodeId}-load-config`, async () => {
    return prisma.waitNode.findUnique({
      where: { nodeId },
    })
  })

  if (!config) {
    await publish(
      waitChannel().status({
        nodeId,
        status: "error",
      })
    )
    return {
      ...context,
      error: "Wait node not configured. Open settings to configure.",
    }
  }

  const variableName = config.variableName || "wait"
  const startTime = Date.now()

  if (config.waitMode === "duration") {
    const sleepStr = toSleepDuration(config.duration, config.durationUnit)

    await publish(
      waitChannel().status({
        nodeId,
        status: "waiting",
      })
    )

    await step.sleep(`wait-${nodeId}-sleep`, sleepStr)

    const endTime = Date.now()
    await publish(
      waitChannel().status({
        nodeId,
        status: "success",
      })
    )

    return {
      ...context,
      [variableName]: {
        waitedMs: endTime - startTime,
        resumedBy: "duration",
        resumedAt: new Date(endTime).toISOString(),
      },
    }
  }

  if (config.waitMode === "until") {
    let targetDatetime = config.untilDatetime

    // Resolve handlebars templates like {{trigger.body.scheduledAt}}
    if (targetDatetime.includes("{{")) {
      targetDatetime = resolveTemplate(targetDatetime, context) as string
    }

    const targetDate = new Date(targetDatetime)
    if (isNaN(targetDate.getTime())) {
      await publish(
        waitChannel().status({
          nodeId,
          status: "error",
        })
      )
      return {
        ...context,
        error: `Wait node: invalid datetime "${targetDatetime}"`,
      }
    }

    await publish(
      waitChannel().status({
        nodeId,
        status: "waiting",
      })
    )

    await step.sleepUntil(`wait-${nodeId}-sleep-until`, targetDate)

    const endTime = Date.now()
    await publish(
      waitChannel().status({
        nodeId,
        status: "success",
      })
    )

    return {
      ...context,
      [variableName]: {
        waitedMs: endTime - startTime,
        resumedBy: "until",
        resumedAt: new Date(endTime).toISOString(),
      },
    }
  }

  if (config.waitMode === "webhook") {
    const eventName = `wait/resume-${nodeId}`
    const timeoutStr = toSleepDuration(
      config.timeoutDuration,
      config.timeoutUnit
    )
    const resumeUrl = `/api/webhooks/wait/${encodeURIComponent(eventName)}`

    await publish(
      waitChannel().status({
        nodeId,
        status: "waiting",
        resumeUrl,
      })
    )

    const result = await step.waitForEvent(`wait-${nodeId}-webhook`, {
      event: eventName,
      timeout: timeoutStr,
    })

    const endTime = Date.now()
    const resumedBy = result ? "webhook" : "timeout"

    if (!result && !config.continueOnTimeout) {
      await publish(
        waitChannel().status({
          nodeId,
          status: "error",
        })
      )
      throw new NonRetriableError(
        `Wait node timed out after ${config.timeoutDuration} ${config.timeoutUnit} and continueOnTimeout is disabled`
      )
    }

    await publish(
      waitChannel().status({
        nodeId,
        status: "success",
      })
    )

    return {
      ...context,
      [variableName]: {
        waitedMs: endTime - startTime,
        resumedBy,
        resumedAt: new Date(endTime).toISOString(),
        resumeUrl,
        webhookData: result?.data ?? null,
      },
    }
  }

  // Unknown wait mode — treat as error
  await publish(
    waitChannel().status({
      nodeId,
      status: "error",
    })
  )
  return {
    ...context,
    error: `Wait node: unknown waitMode "${config.waitMode}"`,
  }
}
