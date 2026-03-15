import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { codeChannel } from "@/inngest/channels/code"
import { runCodeSandbox } from "@/features/executions/lib/code-sandbox"

export const codeExecutor: NodeExecutor = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    codeChannel().status({
      nodeId,
      status: "loading",
    })
  )

  const codeNode = await step.run(`code-${nodeId}-load-config`, async () => {
    return prisma.codeNode.findUnique({ where: { nodeId } })
  })

  if (!codeNode?.code?.trim()) {
    await publish(
      codeChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError("Code node has no code to execute")
  }

  try {
    const result = await step.run(`code-${nodeId}-execute`, async () => {
      const timeout = codeNode.timeout ?? 5000
      const outputMode = codeNode.outputMode ?? "append"
      const allowedDomains = codeNode.allowedDomains ?? ""

      try {
        const { output, logs } = await runCodeSandbox({
          code: codeNode.code,
          context,
          language: codeNode.language ?? "javascript",
          timeout,
          allowedDomains,
        })

        // Log captured console output
        for (const line of logs) {
          console.log(`[CodeNode ${nodeId}]`, line)
        }

        // Apply output based on outputMode
        if (outputMode === "raw") {
          // Raw mode: return the output directly as the full context
          if (output !== undefined && output !== null && typeof output === "object" && !Array.isArray(output)) {
            return output as Record<string, unknown>
          }
          return { codeOutput: output ?? null }
        }

        if (outputMode === "replace") {
          // Replace mode: output replaces context entirely
          if (output !== undefined && output !== null && typeof output === "object" && !Array.isArray(output)) {
            return output as Record<string, unknown>
          }
          return { codeOutput: output ?? null }
        }

        // Default: "append" mode — merge into existing context
        if (output !== undefined && output !== null) {
          if (Array.isArray(output)) {
            return { ...context, codeOutput: output }
          }
          if (typeof output === "object") {
            return { ...context, ...output }
          }
          return { ...context, codeOutput: output }
        }

        return context
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes("timed out") || message.includes("Script execution timed out")) {
          throw new NonRetriableError(
            `Code node timed out after ${timeout}ms`
          )
        }
        throw new NonRetriableError(`Code execution error: ${message}`)
      }
    })

    await publish(
      codeChannel().status({
        nodeId,
        status: "success",
      })
    )

    return result as Record<string, unknown>
  } catch (err) {
    if (codeNode.continueOnFail) {
      await publish(
        codeChannel().status({
          nodeId,
          status: "success",
        })
      )
      const message = err instanceof Error ? err.message : String(err)
      return { ...context, codeError: message }
    }

    await publish(
      codeChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw err
  }
}
