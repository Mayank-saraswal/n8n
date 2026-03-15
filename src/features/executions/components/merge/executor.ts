import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { mergeChannel } from "@/inngest/channels/merge"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import {
  mergeByPosition,
  crossJoin,
  keyMatch,
  keyDiff,
  combineAll,
} from "@/features/executions/lib/merge-strategies"

/**
 * Merge node executor.
 *
 * The Merge node collects data from the current workflow context
 * (which already contains outputs from all upstream branches)
 * and re-combines them using one of 5 strategies:
 *
 * - combine:   spread all branch outputs into one object (default)
 * - position:  zip arrays by index
 * - crossJoin: cartesian product of arrays
 * - keyMatch:  inner join by a key field
 * - keyDiff:   outer difference by a key field
 *
 * Since the workflow engine already merges parallel results via
 * mergeParallelResults(), the Merge node can focus on applying
 * the user's chosen strategy to re-structure the data.
 */
export const mergeExecutor: NodeExecutor = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    mergeChannel().status({
      nodeId,
      status: "loading",
    })
  )

  const config = await step.run(`merge-${nodeId}-load-config`, async () => {
    return prisma.mergeNode.findUnique({
      where: { nodeId },
    })
  })

  if (!config) {
    await publish(
      mergeChannel().status({
        nodeId,
        status: "error",
      })
    )
    return {
      ...context,
      error: "Merge node not configured. Open settings to configure.",
    }
  }

  const variableName = config.variableName || "merge"
  const mode = config.mergeMode || "combine"

  await publish(
    mergeChannel().status({
      nodeId,
      status: "waiting",
      waitingFor: config.inputCount,
    })
  )

  // Gather branch data from context.
  // Upstream node outputs are stored as top-level keys in context.
  // We collect all non-internal context values as potential branch data.
  const branchValues: unknown[] = []
  for (const [key, value] of Object.entries(context)) {
    // Skip internal keys and the merge node's own output key
    if (key === "branch" || key === "error" || key === variableName) continue
    branchValues.push(value)
  }

  let mergeResult: unknown

  const result = await step.run(`merge-${nodeId}-execute`, async () => {
    switch (mode) {
      case "position": {
        const fill = (config.positionFill === "longest" ? "longest" : "shortest") as "shortest" | "longest"
        return mergeByPosition(branchValues, fill)
      }

      case "crossJoin": {
        return crossJoin(branchValues)
      }

      case "keyMatch": {
        let key1 = config.matchKey1 || ""
        let key2 = config.matchKey2 || ""

        // Resolve templates in key paths
        if (key1.includes("{{")) {
          key1 = resolveTemplate(key1, context) as string
        }
        if (key2.includes("{{")) {
          key2 = resolveTemplate(key2, context) as string
        }

        // keyMatch uses the first two branch values
        const b1 = branchValues[0]
        const b2 = branchValues[1]
        return keyMatch(b1, b2, key1, key2)
      }

      case "keyDiff": {
        let key1 = config.matchKey1 || ""
        let key2 = config.matchKey2 || ""

        if (key1.includes("{{")) {
          key1 = resolveTemplate(key1, context) as string
        }
        if (key2.includes("{{")) {
          key2 = resolveTemplate(key2, context) as string
        }

        const b1 = branchValues[0]
        const b2 = branchValues[1]
        return keyDiff(b1, b2, key1, key2)
      }

      case "combine":
      default: {
        return combineAll(branchValues)
      }
    }
  })

  mergeResult = result

  await publish(
    mergeChannel().status({
      nodeId,
      status: "success",
      received: branchValues.length,
    })
  )

  return {
    ...context,
    [variableName]: mergeResult,
  }
}
