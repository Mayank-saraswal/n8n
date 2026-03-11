"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const CRON_PRESETS = [
  { label: "Every minute",        value: "* * * * *" },
  { label: "Every 5 minutes",     value: "*/5 * * * *" },
  { label: "Every 15 minutes",    value: "*/15 * * * *" },
  { label: "Every hour",          value: "0 * * * *" },
  { label: "Every day at 9am",    value: "0 9 * * *" },
  { label: "Every Monday 9am",    value: "0 9 * * 1" },
  { label: "Every weekday 9am",   value: "0 9 * * 1-5" },
  { label: "First of month",      value: "0 0 1 * *" },
] as const

interface Props{
    open:boolean
    onOpenChange:(open:boolean)=>void
}

export const ScheduleTriggerDialog =({
    open,
    onOpenChange,
}:Props)=>{

    const params = useParams();
    const workflowId = params.workflowId as string;
    const trpc = useTRPC();

    const [cronExpression, setCronExpression] = useState("0 9 * * *")
    const [timezone, setTimezone] = useState("UTC")
    const [isSaved, setIsSaved] = useState(false)

    const { data: scheduleTrigger } = useQuery(
        trpc.scheduleTrigger.getByWorkflowId.queryOptions(
            { workflowId },
            { enabled: open }
        )
    );

    useEffect(() => {
        if (scheduleTrigger) {
            setCronExpression(scheduleTrigger.cronExpression)
            setTimezone(scheduleTrigger.timezone)
        }
    }, [scheduleTrigger])

    const isValidCron = /^(\S+\s){4}\S+$/.test(cronExpression.trim())

    const saveSchedule = useMutation(
        trpc.scheduleTrigger.createOrUpdateScheduleTrigger.mutationOptions({
            onSuccess: () => {
                setIsSaved(true)
                toast.success("Schedule saved")
            },
            onError: () => toast.error("Failed to save schedule"),
        })
    )

    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Configure a cron schedule to run this workflow automatically on a time-based schedule
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cron-expression">
                            Cron Expression
                        </Label>
                        <Input
                            id="cron-expression"
                            value={cronExpression}
                            onChange={(e) => {
                                setCronExpression(e.target.value)
                                setIsSaved(false)
                            }}
                            placeholder="0 9 * * *"
                            className="font-mono text-sm"
                        />
                        {!isValidCron && cronExpression.trim() !== "" && (
                            <p className="text-sm text-destructive">
                                Invalid cron expression. Must have 5 space-separated fields.
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Expression: <code className="font-mono">{cronExpression}</code>
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timezone">
                            Timezone
                        </Label>
                        <Input
                            id="timezone"
                            value={timezone}
                            onChange={(e) => {
                                setTimezone(e.target.value)
                                setIsSaved(false)
                            }}
                            placeholder="UTC"
                            className="font-mono text-sm"
                        />
                    </div>
                   <div className="rounded-lg bg-muted p-4 space-y-2">
                    <h4 className="font-medium text-sm">
                        Cron Presets:
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {CRON_PRESETS.map((preset)=>(
                            <Button
                                key={preset.value}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="justify-start text-xs"
                                onClick={() => {
                                    setCronExpression(preset.value)
                                    setIsSaved(false)
                                }}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                   </div>
                    <Button
                        onClick={() => saveSchedule.mutate({ workflowId, cronExpression, timezone })}
                        disabled={!isValidCron || saveSchedule.isPending}
                    >
                        {saveSchedule.isPending ? "Saving..." : isSaved ? "Saved ✓" : "Save Schedule"}
                    </Button>
                   <div className="rounded-lg bg-muted p-4 space-y-2">
                    <h4 className="font-medium text-sm">
                        Setup instructions:
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Select a cron preset above or use a custom expression</li>
                        <li>The workflow will run automatically on the configured schedule</li>
                        <li>All times are in UTC by default</li>
                        <li>You can toggle the schedule on/off at any time</li>
                    </ol>
                   </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm"> Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{schedule.firedAt}}"}
                                </code>
                                - When the schedule fired (ISO timestamp)
                            </li>
                             <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{schedule.workflowId}}"}
                                </code>
                                - Workflow ID
                            </li>
                             <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{json schedule}}"}
                                </code>
                                - Full schedule data as JSON
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
