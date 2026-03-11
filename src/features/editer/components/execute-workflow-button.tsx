import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { NodeType } from "@/generated/prisma";
import { FlaskConicalIcon } from "lucide-react";

function getTriggerData(triggerType: string): Record<string, unknown> | undefined {
    switch (triggerType) {
        case NodeType.SCHEDULE_TRIGGER:
            return { scheduleFiredAt: new Date().toISOString() }
        case NodeType.WEBHOOK_TRIGGER:
            return {
                body: {},
                headers: {},
                method: "POST",
                queryParams: {},
                receivedAt: new Date().toISOString(),
            }
        default:
            return undefined
    }
}

export const ExecuteWorkflowButton = ({workflowId, triggerType}:{
    workflowId: string
    triggerType: string
}) => {
    const executeWorkflow = useExecuteWorkflow()
    const handleExecute =()=>{
        const triggerData = getTriggerData(triggerType)
        executeWorkflow.mutate({id:workflowId, triggerData})
    }
  return (
    <Button size="lg" onClick={handleExecute} disabled={executeWorkflow.isPending}>
      <FlaskConicalIcon  className="size-4"/>
      Execute Workflow
    </Button>
  );
};