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
import { Textarea } from "@/components/ui/textarea"
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

    botToken: z.string().min(1, { message: "Bot Token is required" }),
    chatId: z.string().min(1, { message: "Chat ID is required" }),
    content: z.string().min(1, { message: "Content is required" }).max(4096, { message: "Content must be at most 4096 characters long" }),
})

export type TelegramFormValues = z.infer<typeof formSchema>
interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    defaultValues?: Partial<TelegramFormValues>


}

export const TelegramDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}

}: Props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            botToken: defaultValues.botToken || "",
            chatId: defaultValues.chatId || "",
            content: defaultValues.content || "",

        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                botToken: defaultValues.botToken || "",
                chatId: defaultValues.chatId || "",
                content: defaultValues.content || "",

            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "myTelegramCall"

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Telegram Configuration </DialogTitle>
                    <DialogDescription>
                        Configure Telegram bot settings for this node
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
                                            placeholder="myTelegramCall"
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
                            name="botToken"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Bot Token</FormLabel>


                                    <FormControl>
                                        <Input
                                            placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWxyz"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Get this from @BotFather on Telegram
                                    </FormDescription>
                                    <FormMessage />



                                </FormItem>
                            )}


                        />

                        <FormField
                            control={form.control}
                            name="chatId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Channel ID</FormLabel>


                                    <FormControl>
                                        <Input
                                            placeholder="123456789"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The unique identifier for the target chat or username of the target channel (in the format @channelusername)
                                        open the telegram in web browser and go to the channel amd copy the channel id from the url its look like -51259XXXXX
                                        and make sure to copy with - sign
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

