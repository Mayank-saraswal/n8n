import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { loopChannel } from "@/inngest/channels/loop"

// Utility: resolve dot-notation path from object
// e.g. resolvePath("googleSheets.rows", context)
//   → context.googleSheets.rows
function resolvePath(path: string, obj: Record<string, any>): any {
  return path.split(".").reduce((current, key) => {
    return current?.[key]
  }, obj)
}

export const loopExecutor: NodeExecutor = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(loopChannel().status({ nodeId, status: "loading" }))

  const config = await step.run(`loop-${nodeId}-load-config`, () =>
    prisma.loopNode.findUnique({ where: { nodeId } })
  )

  if (!config) {
    await publish(loopChannel().status({ nodeId, status: "error" }))
    throw new NonRetriableError("Loop node configuration not found")
  }

  const result = await step.run(`loop-${nodeId}-execute`, async () => {
    // Resolve the array from context
    const inputArray = resolvePath(config.inputPath, context)

    if (!inputArray) {
      throw new NonRetriableError(
        `Loop node: could not find array at path "${config.inputPath}" in context. ` +
        `Available keys: ${Object.keys(context).join(", ")}`
      )
    }

    if (!Array.isArray(inputArray)) {
      throw new NonRetriableError(
        `Loop node: value at path "${config.inputPath}" is not an array. ` +
        `Got: ${typeof inputArray}`
      )
    }

    if (inputArray.length === 0) {
      return {
        ...context,
        loop: {
          results: [],
          count: 0,
          inputPath: config.inputPath,
        },
      }
    }

    const iterations = Math.min(inputArray.length, config.maxIterations)
    const results: any[] = []

    for (let i = 0; i < iterations; i++) {
      const item = inputArray[i]

      // For each item, create enriched context
      // If item is an array (like a Sheets row ["Mayank", "test@..."]):
      //   inject as { item: ["Mayank", "test@..."], itemIndex: 0 }
      // If item is an object (like { name: "Mayank", email: "..." }):
      //   inject as { item: { name: "Mayank", ... }, itemIndex: 0, ...spread item keys }

      const itemContext = {
        ...context,
        [config.itemVariable]: item,
        itemIndex: i,
        itemTotal: iterations,
        // If item is an object, also spread its keys at top level
        // so {{name}} works directly without {{item.name}}
        ...(item && typeof item === "object" && !Array.isArray(item)
          ? item
          : {}),
      }

      results.push(itemContext)
    }

    return {
      ...context,
      loop: {
        results,
        count: iterations,
        inputPath: config.inputPath,
        skipped: inputArray.length - iterations,
      },
      // Also expose first item at top level for single-item patterns
      [config.itemVariable]: inputArray[0],
      itemIndex: 0,
      itemTotal: iterations,
    }
  })

  await publish(loopChannel().status({ nodeId, status: "success" }))
  return result as Record<string, unknown>
}
