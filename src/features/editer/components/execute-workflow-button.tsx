import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { NodeType } from "@/generated/prisma";
import { FlaskConicalIcon } from "lucide-react";
import { useState } from "react";

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
    const [showUpgrade, setShowUpgrade] = useState(false)
    const handleExecute =()=>{
        setShowUpgrade(false)
        const triggerData = getTriggerData(triggerType)
        executeWorkflow.mutate({id:workflowId, triggerData}, {
            onError: (error) => {
                if (error.data?.code === "FORBIDDEN") {
                    setShowUpgrade(true)
                }
            }
        })
    }
  return (
    <div className="space-y-3">
      <Button size="lg" onClick={handleExecute} disabled={executeWorkflow.isPending}>
        <FlaskConicalIcon  className="size-4"/>
        Execute Workflow
      </Button>
      {showUpgrade && <UpgradePrompt message={executeWorkflow.error?.message} />}
    </div>
  );
};