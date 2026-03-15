"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const ErrorTriggerDialog = ({
    open,
    onOpenChange,
}: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Error Trigger</DialogTitle>
                    <DialogDescription>
                        Configure settings for the error trigger node
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground ">
                        This node fires when any node in the workflow fails. Connect it to Slack, Gmail, or WhatsApp to get instant failure alerts.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Available variables: {`{{errorTrigger.message}}`}, {`{{errorTrigger.failedNodeName}}`}, {`{{errorTrigger.failedNodeType}}`}, {`{{errorTrigger.failedAt}}`}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
