"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"






const formSchema = z.object({
    variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, { message: "Variable name must start with a letter or underscore and can only contain letters, numbers, and underscores" }),
    // Connection
    tenantUrl: z.string().min(1, { message: "Tenant URL is required" }),
    tenantId: z.string().min(1, { message: "Tenant ID is required" }),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    // Operation
    resource: z.enum(["human_resources", "financial_management"]),
    operation: z.enum(["getWorker", "getAllWorkers", "getInvoices", "submitExpense", "getTimeOff", "updateContact"]),
    // Inputs
    workerId: z.string().optional(),
    apiVersion: z.string().default("v40.0"),
    limit: z.coerce.number().default(100),
    jsonBody: z.string().optional()
})

export type WorkdayFormValues = z.infer<typeof formSchema>
interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    defaultValues?: Partial<WorkdayFormValues>
}

export const WorkdayDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}
}: Props) => {
    const form = useForm<WorkdayFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            variableName: defaultValues.variableName || "",
            tenantUrl: defaultValues.tenantUrl || "",
            tenantId: defaultValues.tenantId || "",
            clientId: defaultValues.clientId || "",
            clientSecret: defaultValues.clientSecret || "",
            resource: defaultValues.resource || "human_resources",
            operation: defaultValues.operation || "getWorker",
            workerId: defaultValues.workerId || "",
            apiVersion: defaultValues.apiVersion || "v40.0",
            limit: defaultValues.limit || 100,
            jsonBody: defaultValues.jsonBody || ""
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                tenantUrl: defaultValues.tenantUrl || "",
                tenantId: defaultValues.tenantId || "",
                clientId: defaultValues.clientId || "",
                clientSecret: defaultValues.clientSecret || "",
                resource: defaultValues.resource || "human_resources",
                operation: defaultValues.operation || "getWorker",
                workerId: defaultValues.workerId || "",
                apiVersion: defaultValues.apiVersion || "v40.0",
                limit: defaultValues.limit || 100,
                jsonBody: defaultValues.jsonBody || ""
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "workdayResponse"
    const watchResource = form.watch("resource")
    const watchOperation = form.watch("operation")

    const showWorkerId = watchOperation === "getWorker"
    const showJsonBody = ["submitExpense", "updateContact"].includes(watchOperation)

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Workday Configuration</DialogTitle>
                    <DialogDescription>
                        Configure connection and operations for Workday
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="workdayResponse" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Access data via {`{{${watchVariableName}.data}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Connection Details - Flattened */}
                        <div className="space-y-4">
                            <div className="text-sm font-medium text-muted-foreground">Connection Details</div>
                            <FormField
                                control={form.control}
                                name="tenantUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tenant URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://wd2-impl-services1.workday.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tenantId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tenant ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="acme_pt1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="clientId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client ID (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="clientSecret"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client Secret (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Resource & Operation */}
                        <div className="space-y-4">
                            <div className="text-sm font-medium text-muted-foreground">Operation</div>
                            <FormField
                                control={form.control}
                                name="resource"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resource</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select Resource" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="human_resources">Human Resources</SelectItem>
                                                <SelectItem value="financial_management">Financial Management</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="operation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Operation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select Operation" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {watchResource === "human_resources" ? (
                                                    <>
                                                        <SelectItem value="getWorker">Get Worker</SelectItem>
                                                        <SelectItem value="getAllWorkers">Get All Workers</SelectItem>
                                                        <SelectItem value="getTimeOff">Get Time Off Requests</SelectItem>
                                                        <SelectItem value="updateContact">Update Contact Info</SelectItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <SelectItem value="getInvoices">Get Invoices</SelectItem>
                                                        <SelectItem value="submitExpense">Submit Expense</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Dynamic Inputs */}
                        {(showWorkerId || showJsonBody) && (
                            <div className="space-y-4">
                                <div className="text-sm font-medium text-muted-foreground">Parameters</div>
                                {showWorkerId && (
                                    <FormField
                                        control={form.control}
                                        name="workerId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Worker ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="12345" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {showJsonBody && (
                                    <FormField
                                        name="jsonBody"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Request Body (JSON)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="min-h-[120px] font-mono text-sm"
                                                        placeholder="{...}"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="apiVersion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>API Version</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

