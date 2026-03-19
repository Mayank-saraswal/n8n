import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { mediaUploadChannel } from "@/inngest/channels/media-upload"
import { MediaUploadSource } from "@/generated/prisma"
import { uploadMedia } from "@/lib/media-service"

export const mediaUploadExecutor: NodeExecutor = async ({
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    // 1. Load configuration for this node
    const config = await step.run(`media-load-config-${nodeId}`, async () => {
        const node = await prisma.mediaUploadNode.findUnique({
            where: { nodeId },
        })
        if (!node) {
            throw new NonRetriableError(`MediaUploadNode configuration not found for node: ${nodeId}`)
        }
        return node
    })

    await publish(
        mediaUploadChannel().status({ nodeId, status: "loading" })
    )

    try {
        const inputFieldVal = resolveTemplate(config.inputField, context)

        if (!inputFieldVal.trim()) {
            throw new NonRetriableError(`MediaUpload: input is required. Template evaluated to empty: "${config.inputField}"`)
        }

        let mediaDataToUpload = inputFieldVal
        let mimeTypeHint = config.mimeTypeHint || "application/octet-stream"

        if (config.source === MediaUploadSource.GOOGLE_DRIVE) {
             throw new NonRetriableError("MediaUpload: Google Drive source is not fully supported in this version. Please use URL source with the Google Drive permanent download URL.")
        }

        const uploadResult = await uploadMedia(
            mediaDataToUpload,
            mimeTypeHint,
            {
                userId,
                workflowId: config.workflowId,
                executionId: (context.__executionId as string) ?? undefined,
                filename: config.filename ? resolveTemplate(config.filename, context) : undefined
            }
        )

        await publish(
             mediaUploadChannel().status({ nodeId, status: "success" })
        )

        return {
            ...context,
            [config.variableName]: {
                url: uploadResult.url,
                mimeType: uploadResult.mimeType,
                sizeBytes: uploadResult.sizeBytes,
                expiresAt: uploadResult.expiresAt,
                originalSource: inputFieldVal
            }
        }
    } catch (err) {
        await publish(
             mediaUploadChannel().status({ status: "error", nodeId })
        )
        if (config.continueOnFail) {
            return {
                ...context,
                [config.variableName]: {
                    error: err instanceof Error ? err.message : String(err)
                }
            }
        }
        throw new NonRetriableError(`MediaUpload failed: ${err instanceof Error ? err.message : String(err)}`)
    }
}
