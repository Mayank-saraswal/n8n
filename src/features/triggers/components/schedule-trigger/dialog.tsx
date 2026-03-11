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
import { CopyIcon } from "lucide-react"
import { useParams } from "next/navigation"
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

    const copyToClipboard = async(text:string)=>{
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard")
        } catch  {
            toast.error("Failed to copy")
        }
    }

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
                        <Label htmlFor="workflow-id">
                            Workflow ID
                        </Label>
                        <div className="flex gap-2">
                            <Input  
                            id="workflow-id"
                            value={workflowId}
                            readOnly
                            className="font-mono text-sm"
                            />
                            <Button 
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={()=>copyToClipboard(workflowId)}
                            >
                                <CopyIcon className="size-4"/>
                            </Button>
                        </div>
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
                                onClick={()=>copyToClipboard(preset.value)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                   </div>
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
