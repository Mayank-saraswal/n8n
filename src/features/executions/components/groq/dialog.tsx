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
    credentialId: z.string().min(1, { message: "Credential is required" }),
    // model: z.string().min(1, { message: "Model is required" }),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, { message: "User prompt is required" })
})

export type GroqFormValues = z.infer<typeof formSchema>
interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    defaultValues?: Partial<GroqFormValues>


}

export const GroqDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}

}: Props) => {
    const { data: credentials, isLoading: isLoadingCredentials } = useCredentialsByType(CredentialType.GROQ)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            // model: defaultValues.model|| AVAILABLE_MODELS[0],
            userPrompt: defaultValues.userPrompt || "",
            systemPrompt: defaultValues.systemPrompt || ""
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                credentialId: defaultValues.credentialId || "",
                // model: defaultValues.model|| AVAILABLE_MODELS[0],
                userPrompt: defaultValues.userPrompt || "",
                systemPrompt: defaultValues.systemPrompt || ""
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "myApiCall"

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Groq Configration </DialogTitle>
                    <DialogDescription>
                        Configure the Ai model and prompts for this node
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
                                            placeholder="myApiCall"
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
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Groq Credential</FormLabel>

                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoadingCredentials || !credentials?.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a Credential" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {credentials?.map((credential) => (
                                                <SelectItem key={credential.id} value={credential.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Image src="/logos/groq.svg" alt="groq" width={16} height={16} />
                                                        <span>{credential.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>



                                    </Select>
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
                            name="systemPrompt"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        SystemPrompt (optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-[80px] font-mono text-sm"
                                            placeholder="you are a helpful assistant"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormDescription>
                                        Sets the behavior of the assistant.Use {"{{variables}}"} for
                                        simple values or {"{{json variable}}"} to
                                        stringify object
                                    </FormDescription>
                                    <FormMessage />

                                </FormItem>

                            )}



                        />


                        <FormField
                            name="userPrompt"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        UserPrompt
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-[120px] font-mono text-sm"
                                            placeholder="Summarize this text:{{json httpResponce.data}}"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormDescription>
                                        The Prompt to send to the Ai.Use {"{{variables}}"} for
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

