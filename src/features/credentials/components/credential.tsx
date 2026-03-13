"use client"

import { CredentialType } from "@/generated/prisma";
import { useParams, useRouter } from "next/navigation";
import z from "zod";
import { useCreateCredential, useUpdateCredential, useSuspennseCredential } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMemo } from "react";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";


const formSchema = z.object({
    name: z.string().min(1, "Name is Required"),
    type: z.enum(CredentialType),
    value: z.string().min(1, "Api key  is required"),
    gmailEmail: z.string().optional(),
    gmailAppPassword: z.string().optional(),
    whatsappAccessToken: z.string().optional(),
    whatsappPhoneNumberId: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.type === CredentialType.GMAIL) {
        if (!data.gmailEmail) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Gmail address is required",
                path: ["gmailEmail"],
            })
        }
        if (!data.gmailAppPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "App Password is required",
                path: ["gmailAppPassword"],
            })
        }
    }
    if (data.type === CredentialType.WHATSAPP) {
        if (!data.whatsappAccessToken) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Access Token is required",
                path: ["whatsappAccessToken"],
            })
        }
        if (!data.whatsappPhoneNumberId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Phone Number ID is required",
                path: ["whatsappPhoneNumberId"],
            })
        }
    }
})




type FormValues = z.infer<typeof formSchema>

const credentialTypeOptions = [
    {
        value: CredentialType.OPENAI,
        label: "Open AI",
        logo: "/logos/openai.svg"
    },
    {
        value: CredentialType.ANTHROPIC,
        label: "Anthropic",
        logo: "/logos/anthropic.svg"
    },
    {
        value: CredentialType.GEMINI,
        label: "Gemini",
        logo: "/logos/gemini.svg"
    },
    {
        value: CredentialType.DEEPSEEK,
        label: "Deepseek",
        logo: "/logos/deepseek.svg"
    },
    {
        value: CredentialType.PERPLEXITY,
        label: "Perplexity",
        logo: "/logos/perplexity.svg"
    },
    {
        value: CredentialType.XAI,
        label: "xAI",
        logo: "/logos/xai.svg"
    },
    {
        value: CredentialType.GROQ,
        label: "Groq",
        logo: "/logos/groq.svg"
    },
    {
        value: CredentialType.GMAIL,
        label: "Gmail",
        logo: "/logos/gmail.svg"
    },
    {
        value: CredentialType.GOOGLE_SHEETS,
        label: "Google Sheets",
        logo: "/logos/googlesheets.svg"
    },
    {
        value: CredentialType.GOOGLE_DRIVE,
        label: "Google Drive",
        logo: "/logos/google-drive.svg"
    },
    {
        value: CredentialType.WHATSAPP,
        label: "WhatsApp",
        logo: "/logos/whatsapp.svg"
    },
    {
        value: CredentialType.NOTION,
        label: "Notion",
        logo: "/logos/notion.svg"
    },

]

interface CredentialsFormPage {
    initialData?: {
        id?: string;
        name: string;
        type: CredentialType
        value: string

    }
};


export const CredentialForm = ({ initialData }: CredentialsFormPage) => {
    const router = useRouter();
    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();
    const { handleError, modal } = useUpgradeModal();

    const isEdit = !!initialData?.id;

    // Parse WhatsApp JSON value into individual fields for editing
    const whatsappDefaults = useMemo(() => {
        if (initialData?.type === CredentialType.WHATSAPP && initialData.value) {
            try {
                const parsed = JSON.parse(initialData.value);
                return {
                    whatsappAccessToken: parsed.accessToken ?? "",
                    whatsappPhoneNumberId: parsed.phoneNumberId ?? "",
                };
            } catch {
                return { whatsappAccessToken: "", whatsappPhoneNumberId: "" };
            }
        }
        return { whatsappAccessToken: "", whatsappPhoneNumberId: "" };
    }, [initialData]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? { ...initialData, gmailEmail: "", gmailAppPassword: "", ...whatsappDefaults }
            : {
                name: "",
                type: CredentialType.OPENAI,
                value: "",
                gmailEmail: "",
                gmailAppPassword: "",
                whatsappAccessToken: "",
                whatsappPhoneNumberId: "",
            }
    })

    const watchType = form.watch("type")
    const isGmail = watchType === CredentialType.GMAIL
    const isGoogleSheets = watchType === CredentialType.GOOGLE_SHEETS
    const isGoogleDrive = watchType === CredentialType.GOOGLE_DRIVE
    const isWhatsApp = watchType === CredentialType.WHATSAPP

    const onSubmit = async (values: FormValues) => {
        let submitValues = { ...values }

        // For Gmail, encode email + appPassword as JSON in the value field
        if (values.type === CredentialType.GMAIL) {
            submitValues.value = JSON.stringify({
                email: values.gmailEmail,
                appPassword: values.gmailAppPassword,
            })
        }

        // For WhatsApp, encode accessToken + phoneNumberId as JSON in the value field
        if (values.type === CredentialType.WHATSAPP) {
            submitValues.value = JSON.stringify({
                accessToken: values.whatsappAccessToken,
                phoneNumberId: values.whatsappPhoneNumberId,
            })
        }

        const { gmailEmail, gmailAppPassword, whatsappAccessToken, whatsappPhoneNumberId, ...payload } = submitValues

        if (isEdit && initialData?.id) {
            await updateCredential.mutate({
                id: initialData.id,

                ...payload
            })
        } else {
            await createCredential.mutate(payload, {
                onSuccess: (data) => {
                    router.push(`/credentials/${data.id}`)
                },
                onError: (error) => {
                    handleError(error);
                }

            })
        }
    }

    return (
        <>
            {modal}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isEdit ? "Edit Credential" : "Create Credential"}
                    </CardTitle>
                    <CardDescription>
                        {isEdit ? "Update your api key or credentials" : "Add a new api key or credentials to your account"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="MY Api key" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}


                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>

                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                // Set a placeholder value for Gmail/WhatsApp so validation passes
                                                if (val === CredentialType.GMAIL) {
                                                    form.setValue("value", "gmail-credential")
                                                } else if (val === CredentialType.WHATSAPP) {
                                                    form.setValue("value", "whatsapp-credential")
                                                } else if (val === CredentialType.GOOGLE_SHEETS || val === CredentialType.GOOGLE_DRIVE) {
                                                    form.setValue("value", "")
                                                } else {
                                                    const currentValue = form.getValues("value")
                                                    if (
                                                      currentValue === "gmail-credential" ||
                                                      currentValue === "whatsapp-credential" ||
                                                      currentValue.startsWith("{")
                                                    ) {
                                                      form.setValue("value", "")
                                                    }
                                                }
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentialTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Image src={option.logo} alt={option.label} width={16} height={16} />
                                                            <span>{option.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>



                                        </Select>
                                        <FormMessage />



                                    </FormItem>
                                )}


                            />


                            {isGmail ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="gmailEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gmail Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="you@gmail.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gmailAppPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>App Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="xxxx xxxx xxxx xxxx" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Generate at: Google Account → Security → 2-Step Verification → App Passwords
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : isWhatsApp ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="whatsappAccessToken"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Access Token</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="EAABx... (from Meta Developer Console)" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Find this in Meta for Developers → WhatsApp → API Setup
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="whatsappPhoneNumberId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number ID</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="1234567890" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Find this in Meta for Developers → WhatsApp → API Setup
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                        <p className="font-medium mb-2">ℹ️ How to get WhatsApp credentials</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Go to{" "}
                                                <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">
                                                    developers.facebook.com
                                                </a>
                                            </li>
                                            <li>Create or open your WhatsApp app</li>
                                            <li>Go to WhatsApp → API Setup</li>
                                            <li>Copy the &quot;Temporary access token&quot; or generate a permanent token</li>
                                            <li>Copy the &quot;Phone number ID&quot;</li>
                                        </ol>
                                    </div>
                                </>
                            ) : isGoogleSheets || isGoogleDrive ? (
                                <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>OAuth Refresh Token JSON</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder='{"refreshToken": "1//0...", ...}'
                                                    rows={6}
                                                    className="font-mono text-xs"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Paste the JSON containing your refresh token from{" "}
                                                <a
                                                    href="https://developers.google.com/oauthplayground"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary underline"
                                                >
                                                    OAuth Playground
                                                </a>
                                                {" "}— select {isGoogleDrive
                                                    ? "\"Google Drive API v3\" scope: https://www.googleapis.com/auth/drive"
                                                    : "\"Google Sheets API v4\" scope"}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Api Key</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="sk-..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}


                                />
                            )}

                            <div className="flex gap-4">
                                <Button type="submit"
                                    disabled={
                                        createCredential.isPending || updateCredential.isPending
                                    }
                                >{isEdit ? "Update" : "Create"}</Button>
                                <Button asChild variant="outline" onClick={() => router.push("/credentials")}>

                                    <Link href="/credentials" prefetch >Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}







export const CredentialView = ({ credentialId }: { credentialId: string }) => {
    const { data: credential } = useSuspennseCredential(credentialId);

    return (
        <CredentialForm initialData={credential} />
    )
}