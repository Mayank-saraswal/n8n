import type { NodeExecutor } from "@/features/executions/types"
import { errorTriggerChannel } from "@/inngest/channels/error-trigger"

export const errorTriggerExecutor: NodeExecutor = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    errorTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  )

  const result = await step.run(`error-trigger-${nodeId}`, async () => context)

  await publish(
    errorTriggerChannel().status({
      nodeId,
      status: "success",
    })
  )

  return result
}
