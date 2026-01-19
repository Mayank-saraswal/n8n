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
import Image from "next/image"

import {
    Form,
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials"
import { CredentialType } from "@/generated/prisma"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"


//  export const AVAILABLE_MODELS=[
//     "gemini-2.0-flash", 
//     "gemini-1.5-flash",
//     "gemini-1.5-flash-8b",
//     "gemini-1.0-pro",
//     "gemini-1.0-pro",
//     "gemini-pro"
// ] as const




const formSchema = z.object({
    variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, { message: "Variable name must start with a letter or underscore and can only contain letters, numbers, and underscores" }),

    webhookUrl: z.string().min(1, { message: "Webhook URL is required" }),
    content: z.string().min(1, { message: "Content is required" }).max(2000, { message: "Content must be at most 2000 characters long" }),
    username: z.string().optional(),
})

export type DiscordFormValues = z.infer<typeof formSchema>
interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    defaultValues?: Partial<DiscordFormValues>


}

export const DiscordDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}

}: Props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",

            webhookUrl: defaultValues.webhookUrl || "",
            content: defaultValues.content || "",
            username: defaultValues.username || "",

        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",

                webhookUrl: defaultValues.webhookUrl || "",
                content: defaultValues.content || "",
                username: defaultValues.username || "",

            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "myDiscordCall"

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discord Configration </DialogTitle>
                    <DialogDescription>
                        Configure discord webhook settings for this node
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">

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
                                            placeholder="myDiscordCall"
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
                            name="webhookUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Webhook URL</FormLabel>


                                    <FormControl>
                                        <Input
                                            placeholder="https://discord.com/api/webhooks/1234567890/1234567890"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Get this from Discord channel settings →
                                        Integrate →
                                        Webhooks
                                    </FormDescription>
                                    <FormMessage />



                                </FormItem>
                            )}


                        />

                        {/* <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Model
                                    </FormLabel>
                                   <Select
                                   onValueChange={field.onChange}
                                   defaultValue={field.value}
                                   >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="select a model"/>

                                            
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {AVAILABLE_MODELS.map((model) => (
                                            <SelectItem value={model} key={model}>
                                                {model}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                   </Select>

                                    <FormDescription>
                                      The Google Gemini model to use for completion
                                    </FormDescription>
                                    <FormMessage />

                                </FormItem>

                            )}

                        /> */}


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
                                            placeholder="Summary : {{aiResponce}}"
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


                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>  Bot Username (optional)</FormLabel>


                                    <FormControl>
                                        <Input
                                            placeholder="Workflow Bot "
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Override the webhook default username
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

