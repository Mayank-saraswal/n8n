import { useQuery } from "@tanstack/react-query";
import type { NodeProps } from "@xyflow/react";
import { ClockIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { memo, useState } from "react";

import { SCHEDULE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/schedule-trigger";
import { useTRPC } from "@/trpc/client";
import { BaseTriggerNode } from "../base-trigger-node";
import { useNodeStatus } from "../shared/hooks/use-node-status";
import { fetchScheduleTriggerRealtimeToken } from "./actions";
import { ScheduleTriggerDialog } from "./dialog";

function useScheduleDescription(): string {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const trpc = useTRPC();
  const { data: scheduleTrigger } = useQuery(
    trpc.scheduleTrigger.getByWorkflowId.queryOptions(
      { workflowId },
      { enabled: !!workflowId },
    ),
  );

  if (!scheduleTrigger) return "Not configured";
  if (scheduleTrigger.isActive)
    return `● Active: ${scheduleTrigger.cronExpression}`;
  return `○ Paused: ${scheduleTrigger.cronExpression}`;
}

export const ScheduleTriggerNode = memo((props: NodeProps) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SCHEDULE_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchScheduleTriggerRealtimeToken,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const scheduleDescription = useScheduleDescription();
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };
  return (
    <>
      <ScheduleTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={ClockIcon}
        name="Schedule"
        status={nodeStatus}
        description={scheduleDescription}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ScheduleTriggerNode.displayName = "ScheduleTriggerNode";
