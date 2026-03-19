import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { mediaUploadChannel } from "@/inngest/channels/media-upload"
import { uploadMedia } from "@/lib/media-service"

export const mediaUploadExecutor: NodeExecutor = async ({
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  // STEP 1: Load config
  const config = await step.run(`media-upload-${nodeId}-load`, async () => {
    const node = await prisma.mediaUploadNode.findUnique({
      where: { nodeId },
      include: { workflow: { select: { userId: true } } },
    })
    if (!node) throw new NonRetriableError("MediaUpload node not configured")
    if (node.workflow.userId !== userId) throw new NonRetriableError("Unauthorized")
    return node
  })

  // STEP 2: Validate
  await step.run(`media-upload-${nodeId}-validate`, async () => {
    const input = resolveTemplate(config.inputField, context)
    if (!input?.trim()) {
      throw new NonRetriableError(
        `MediaUpload: input resolved to empty. Template: "${config.inputField}"`
      )
    }
    return { valid: true }
  })

  // STEP 3: Execute — publish AND uploadMedia BOTH inside here
  return await step.run(`media-upload-${nodeId}-execute`, async () => {
    await publish((mediaUploadChannel() as any).status({ nodeId, status: "loading" } as any))
    try {
      const inputFieldVal = resolveTemplate(config.inputField, context)
      const result = await uploadMedia(
        inputFieldVal,
        config.mimeTypeHint || "application/octet-stream",
        {
          userId,
          workflowId: config.workflowId,
          executionId: (context.__executionId as string) ?? undefined,
          filename: config.filename
            ? resolveTemplate(config.filename, context)
            : undefined,
        }
      )
      await publish((mediaUploadChannel() as any).status({ nodeId, status: "success" } as any))
      return {
        ...context,
        [config.variableName]: {
          url: result.url,
          mimeType: result.mimeType,
          sizeBytes: result.sizeBytes,
          expiresAt: result.expiresAt,
          originalSource: inputFieldVal,
        },
      }
    } catch (err) {
      await publish((mediaUploadChannel() as any).status({ nodeId, status: "error" } as any))
      if (config.continueOnFail) {
        return {
          ...context,
          [config.variableName]: {
            error: err instanceof Error ? err.message : String(err),
          },
        }
      }
      throw new NonRetriableError(
        `MediaUpload failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  })
}
