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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CopyIcon, Loader2Icon } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

interface Props{
    open:boolean
    onOpenChange:(open:boolean)=>void
}

export const WebhookTriggerDialog =({
    open,
    onOpenChange,
}:Props)=>{

    const params = useParams();
    const workflowId = params.workflowId as string;
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const { data: webhookTrigger, isLoading } = useQuery(
        trpc.webhookTrigger.getByWorkflowId.queryOptions(
            { workflowId },
            { enabled: open }
        )
    );

    const createTrigger = useMutation(
        trpc.webhookTrigger.createWebhookTrigger.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(
                    trpc.webhookTrigger.getByWorkflowId.queryOptions({ workflowId })
                );
            },
        })
    );

    useEffect(() => {
        if (open && !isLoading && !webhookTrigger) {
            createTrigger.mutate({ workflowId });
        }
    }, [open, isLoading, webhookTrigger]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const webhookUrl = webhookTrigger
        ? `${baseUrl}/api/webhooks/trigger/${webhookTrigger.webhookId}`
        : "Loading..."

    const copyToClipboard = async()=>{
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard")
        } catch  {
            toast.error("Failed to copy Url ")
        }
    }

    const curlCommand = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"key": "value"}'`

    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Webhook Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this Webhook URL to trigger this workflow via HTTP request
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">
                            Webhook URL
                        </Label>

                        <div className="flex gap-2">
                            <Input  
                            id="webhook-url"
                            value={webhookUrl}
                            readOnly
                            className="font-mono text-sm"
                            />
                            <Button 
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={copyToClipboard}
                            >
                                <CopyIcon className="size-4"/>
                            </Button>
                        </div>
                    </div>
                   <div className="rounded-lg bg-muted p-4 space-y-2">
                    <h4 className="font-medium text-sm">
                        Setup instructions:
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Copy the Webhook URL above</li>
                        <li>Send a POST or GET request to the URL</li>
                        <li>Include any JSON payload in the request body</li>
                        <li>The workflow will be triggered automatically</li>
                    </ol>
                   </div>
                   <div className="rounded-lg bg-muted p-4 space-y-3">
                        <h4 className="font-medium text-sm">
                            Example cURL Command
                        </h4>
                        <Button 
                        type="button"
                        variant="outline"
                        onClick={async()=>{
                            try {
                                await navigator.clipboard.writeText(curlCommand);
                                toast.success("cURL command copied to clipboard")
                            } catch {
                               toast.error("Failed to copy cURL command")
                            }
                        }}
                        >
                            <CopyIcon className="size-4 mr-2"/>
                            Copy cURL Command
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            This command sends a POST request with a JSON body to your webhook
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm"> Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{webhook.body}}"}
                                </code>
                                - Request body
                            </li>
                             <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{webhook.headers}}"}
                                </code>
                                - Request headers
                            </li>
                             <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{webhook.method}}"}
                                </code>
                                - HTTP method
                            </li>
                             <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{json webhook}}"}
                                </code>
                                - Full webhook data as JSON
                            </li>
                        </ul>
                    </div>
                </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
