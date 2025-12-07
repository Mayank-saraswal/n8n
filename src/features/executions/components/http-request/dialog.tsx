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
    endpoint: z.url({ message: "Please enter a valid URL" }),
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
    body: z.string().optional()
    // .refine(),
})

export type HttpRequestFormValues = z.infer<typeof formSchema>
interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => void
    defaultValues?: Partial<HttpRequestFormValues>


}

export const HttpRequestDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}

}: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            endpoint: defaultValues.endpoint || "",
            method: defaultValues.method || "GET",
            body: defaultValues.body || ""
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                endpoint: defaultValues.endpoint || "",
                method: defaultValues.method || "GET",
                body: defaultValues.body || ""
            })
        }
    }, [open, defaultValues, form])
    
    const watchVariableName = form.watch("variableName") || "myApiCall"
    const watchMethod = form.watch("method")
    const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod)
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Http Request</DialogTitle>
                    <DialogDescription>
                        Configure settings for the http request node
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
                                        {`{{${watchVariableName}.httpResponse.data}}`}
                                    </FormDescription>
                                    <FormMessage />

                                </FormItem>

                            )}

                        />
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Method
                                    </FormLabel>
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                        </SelectContent>

                                    </Select>
                                    <FormDescription>
                                        The HTTP method to use for this request
                                    </FormDescription>
                                    <FormMessage />

                                </FormItem>

                            )}

                        />

                        <FormField
                            control={form.control}
                            name="endpoint"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Endpoint Url
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://apiexample.com/users/{{httpResponse.data.id}"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormDescription>
                                        Static Url or use {"{{variables}}"} for
                                        simple values or {"{{json variable}}"} to
                                        stringify object
                                    </FormDescription>
                                    <FormMessage />

                                </FormItem>

                            )}

                        />
                        {showBodyField && (
                            <FormField
                                name="body"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Request Body
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-[120px] font-mono text-sm"
                                                placeholder={'{\n "userId":"{{httpResponce.data.id}}" , \n "name":"{{httpResponce.data.name}}" \n "items":"{{httpResponce.data.items}}" }\n'}
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormDescription>
                                            JSON with tamplate variables.Use {"{{variables}}"} for
                                            simple values or {"{{json variable}}"} to
                                            stringify object
                                        </FormDescription>
                                        <FormMessage />

                                    </FormItem>

                                )}



                            />
                        )}
                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}