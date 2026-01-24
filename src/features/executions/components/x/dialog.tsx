"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    Form,
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
    variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, { message: "Variable name must start with a letter or underscore and can only contain letters, numbers, and underscores" }),

    apiKey: z.string().min(1, { message: "API Key is required" }),
    apiSecretKey: z.string().min(1, { message: "API Secret Key is required" }),
    accessToken: z.string().min(1, { message: "Access Token is required" }),
    accessTokenSecret: z.string().min(1, { message: "Access Token Secret is required" }),
    content: z.string().min(1, { message: "Content is required" }).max(280, { message: "Content must be at most 280 characters long" }),
})

export type XFormValues = z.infer<typeof formSchema>
interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    defaultValues?: Partial<XFormValues>
}

export const XDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}

}: Props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            apiKey: defaultValues.apiKey || "",
            apiSecretKey: defaultValues.apiSecretKey || "",
            accessToken: defaultValues.accessToken || "",
            accessTokenSecret: defaultValues.accessTokenSecret || "",
            content: defaultValues.content || "",
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                apiKey: defaultValues.apiKey || "",
                apiSecretKey: defaultValues.apiSecretKey || "",
                accessToken: defaultValues.accessToken || "",
                accessTokenSecret: defaultValues.accessTokenSecret || "",
                content: defaultValues.content || "",
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "myXCall"

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>X (Twitter) Configuration </DialogTitle>
                    <DialogDescription>
                        Configure X bot settings for this node
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">

                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Variable Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="myXCall"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormDescription>
                                        Use this name to reference the result in other nodes:{" "}
                                        {`{{${watchVariableName}.text}}`}
                                    </FormDescription>
                                    <FormMessage />

                                </FormItem>

                            )}

                        />


                        <FormField
                            control={form.control}
                            name="apiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>API Key (Consumer Key)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="API Key"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        <strong>Step 1:</strong> Go to the <a href="https://developer.x.com/en/portal/dashboard" target="_blank" className="underline text-primary">X Developer Portal</a>.<br />
                                        <strong>Step 2:</strong> Click on your App &gt; "Keys and Tokens" tab.<br />
                                        <strong>Step 3:</strong> Under "Consumer Keys", click <strong>"Regenerate"</strong> to get your API Key & Secret.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="apiSecretKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>API Secret Key (Consumer Secret)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="API Secret Key"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is generated together with the API Key in the previous step.
                                        Save it immediately, you won't see it again!
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="accessToken"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Access Token</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Access Token"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        <strong>CRITICAL STEP:</strong><br />
                                        1. Go to "Settings" &gt; "User authentication settings" &gt; "Edit".<br />
                                        2. Set "App permissions" to <strong>"Read and Write"</strong> then Save.<br />
                                        3. Go back to "Keys and Tokens" &gt; "Authentication Tokens" section.<br />
                                        4. Click <strong>"Generate"</strong> to get your Access Token & Secret.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="accessTokenSecret"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Access Token Secret</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Access Token Secret"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is generated together with the Access Token.
                                        It is required to give this node permission to tweet on your behalf.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            name="content"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Message Content
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-[80px] font-mono text-sm"
                                            placeholder="Hello world!"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormDescription>
                                        The message to send .Use {"{{variables}}"} for
                                        simple values or {"{{json variable}}"} to
                                        stringify object
                                    </FormDescription>
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

