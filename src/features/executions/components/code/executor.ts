import vm from "vm"
import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { codeChannel } from "@/inngest/channels/code"

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

  const result = await step.run(`code-${nodeId}-execute`, async () => {
    // Create sandbox with $input = full context
    // Security: Only expose safe built-ins. Do NOT expose require, import,
    // process, __dirname, __filename, fetch, fs, path, child_process.
    const sandbox = {
      $input: context,
      $json: context,
      console: {
        log: (...args: any[]) => console.log("[CodeNode]", ...args),
        error: (...args: any[]) => console.error("[CodeNode]", ...args),
      },
      result: undefined as any,
    }

    // Wrap user code to capture return value
    const wrappedCode = `
      (function() {
        ${codeNode.code}
      })()
    `

    try {
      const script = new vm.Script(wrappedCode)
      const vmContext = vm.createContext(sandbox)
      const output = script.runInContext(vmContext, { timeout: 5000 })

      // If user returned something, use it. Otherwise pass context through.
      if (output !== undefined && output !== null) {
        if (typeof output === "object") {
          return { ...context, ...output }
        }
        return { ...context, codeOutput: output }
      }

      return context
    } catch (err: any) {
      if (err.code === "ERR_SCRIPT_EXECUTION_TIMEOUT") {
        throw new NonRetriableError("Code node timed out after 5 seconds")
      }
      throw new NonRetriableError(`Code execution error: ${err.message}`)
    }
  })

  await publish(
    codeChannel().status({
      nodeId,
      status: "success",
    })
  )

  return result as Record<string, unknown>
}
