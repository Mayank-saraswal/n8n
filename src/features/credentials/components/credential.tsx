"use client"

import { CredentialType } from "@/generated/prisma";
import { useParams, useRouter, usePathname } from "next/navigation";
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
    notionApiKey: z.string().optional(),
    razorpayKeyId: z.string().optional(),
    razorpayKeySecret: z.string().optional(),
    msg91AuthKey: z.string().optional(),
    shiprocketEmail: z.string().optional(),
    shiprocketPassword: z.string().optional(),
    slackAuthType: z.enum(["bot_token", "webhook"]).optional(),
    slackBotToken: z.string().optional(),
    slackWebhookUrl: z.string().optional(),
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
    if (data.type === CredentialType.NOTION) {
        if (!data.notionApiKey) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Integration Token is required",
                path: ["notionApiKey"],
            })
        }
    }
    if (data.type === CredentialType.RAZORPAY) {
        if (!data.razorpayKeyId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Key ID is required",
                path: ["razorpayKeyId"],
            })
        }
        if (!data.razorpayKeySecret) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Key Secret is required",
                path: ["razorpayKeySecret"],
            })
        }
    }
    if (data.type === CredentialType.MSG91) {
        if (!data.msg91AuthKey) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Auth Key is required",
                path: ["msg91AuthKey"],
            })
        }
    }
    if (data.type === CredentialType.SHIPROCKET) {
        if (!data.shiprocketEmail) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email is required",
                path: ["shiprocketEmail"],
            })
        }
        if (!data.shiprocketPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password is required",
                path: ["shiprocketPassword"],
            })
        }
    }
    if (data.type === CredentialType.SLACK) {
        if (data.slackAuthType === "bot_token" && !data.slackBotToken) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Bot Token is required",
                path: ["slackBotToken"],
            })
        }
        if (data.slackAuthType === "webhook" && !data.slackWebhookUrl) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Webhook URL is required",
                path: ["slackWebhookUrl"],
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
        label: "Gmail (Legacy)",
        logo: "/logos/gmail.svg"
    },
    {
        value: CredentialType.GMAIL_OAUTH,
        label: "Gmail OAuth",
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
    {
        value: CredentialType.RAZORPAY,
        label: "Razorpay",
        logo: "/logos/razorpay.svg"
    },
    {
        value: CredentialType.SLACK,
        label: "Slack",
        logo: "/logos/slack.svg"
    },
    {
        value: CredentialType.MSG91,
        label: "MSG91",
        logo: "/logos/msg91.svg"
    },
    {
        value: CredentialType.SHIPROCKET,
        label: "Shiprocket",
        logo: "/logos/shiprocket.svg"
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
    const pathname = usePathname();
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

    const notionDefaults = useMemo(() => {
        if (initialData?.type === CredentialType.NOTION && initialData.value) {
            try {
                const parsed = JSON.parse(initialData.value)
                return { notionApiKey: parsed.apiKey ?? initialData.value }
            } catch {
                // plain string stored directly
                return { notionApiKey: initialData.value ?? "" }
            }
        }
        return { notionApiKey: "" }
    }, [initialData])

    const razorpayDefaults = useMemo(() => {
        if (initialData?.type === CredentialType.RAZORPAY && initialData.value) {
            try {
                const parsed = JSON.parse(initialData.value)
                return {
                    razorpayKeyId: parsed.keyId ?? "",
                    razorpayKeySecret: parsed.keySecret ?? "",
                }
            } catch {
                return { razorpayKeyId: "", razorpayKeySecret: "" }
            }
        }
        return { razorpayKeyId: "", razorpayKeySecret: "" }
    }, [initialData])

    const msg91Defaults = useMemo(() => {
        if (initialData?.type === CredentialType.MSG91 && initialData.value) {
            try {
                const parsed = JSON.parse(initialData.value)
                return { msg91AuthKey: parsed.authKey ?? "" }
            } catch {
                return { msg91AuthKey: initialData.value ?? "" }
            }
        }
        return { msg91AuthKey: "" }
    }, [initialData])

    const shiprocketDefaults = useMemo(() => {
        if (initialData?.type === CredentialType.SHIPROCKET && initialData.value) {
            try {
                const parsed = JSON.parse(initialData.value)
                return {
                    shiprocketEmail: parsed.email ?? "",
                    shiprocketPassword: parsed.password ?? "",
                }
            } catch {
                return { shiprocketEmail: "", shiprocketPassword: "" }
            }
        }
        return { shiprocketEmail: "", shiprocketPassword: "" }
    }, [initialData])

    const slackDefaults = useMemo(() => {
        if (initialData?.type === CredentialType.SLACK && initialData.value) {
            try {
                const parsed = JSON.parse(initialData.value)
                if (parsed.type === "bot_token") {
                    return {
                        slackAuthType: "bot_token" as const,
                        slackBotToken: parsed.token ?? "",
                        slackWebhookUrl: "",
                    }
                }
                if (parsed.type === "webhook") {
                    return {
                        slackAuthType: "webhook" as const,
                        slackBotToken: "",
                        slackWebhookUrl: parsed.webhookUrl ?? "",
                    }
                }
            } catch {
                // fall through
            }
        }
        return { slackAuthType: "bot_token" as const, slackBotToken: "", slackWebhookUrl: "" }
    }, [initialData])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? { ...initialData, gmailEmail: "", gmailAppPassword: "", ...whatsappDefaults, ...notionDefaults, ...razorpayDefaults, ...msg91Defaults, ...shiprocketDefaults, ...slackDefaults }
            : {
                name: "",
                type: CredentialType.OPENAI,
                value: "",
                gmailEmail: "",
                gmailAppPassword: "",
                whatsappAccessToken: "",
                whatsappPhoneNumberId: "",
                notionApiKey: "",
                razorpayKeyId: "",
                razorpayKeySecret: "",
                msg91AuthKey: "",
                shiprocketEmail: "",
                shiprocketPassword: "",
                slackAuthType: "bot_token",
                slackBotToken: "",
                slackWebhookUrl: "",
            }
    })

    const watchType = form.watch("type")
    const isGmail = watchType === CredentialType.GMAIL
    const isGmailOAuth = watchType === CredentialType.GMAIL_OAUTH
    const isGoogleSheets = watchType === CredentialType.GOOGLE_SHEETS
    const isGoogleDrive = watchType === CredentialType.GOOGLE_DRIVE
    const isWhatsApp = watchType === CredentialType.WHATSAPP
    const isNotion = watchType === CredentialType.NOTION
    const isRazorpay = watchType === CredentialType.RAZORPAY
    const isMsg91 = watchType === CredentialType.MSG91
    const isShiprocket = watchType === CredentialType.SHIPROCKET
    const isSlack = watchType === CredentialType.SLACK
    const watchSlackAuthType = form.watch("slackAuthType")

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

        // For Notion, encode apiKey as JSON in the value field
        if (values.type === CredentialType.NOTION) {
            submitValues.value = JSON.stringify({
                apiKey: values.notionApiKey,
            })
        }

        // For Razorpay, encode keyId + keySecret as JSON in the value field
        if (values.type === CredentialType.RAZORPAY) {
            submitValues.value = JSON.stringify({
                keyId: values.razorpayKeyId,
                keySecret: values.razorpayKeySecret,
            })
        }

        // For MSG91, encode authKey as JSON in the value field
        if (values.type === CredentialType.MSG91) {
            submitValues.value = JSON.stringify({
                authKey: values.msg91AuthKey,
            })
        }

        // For Shiprocket, encode email + password as JSON in the value field
        if (values.type === CredentialType.SHIPROCKET) {
            submitValues.value = JSON.stringify({
                email: values.shiprocketEmail,
                password: values.shiprocketPassword,
            })
        }

        // For Slack, encode based on auth type
        if (values.type === CredentialType.SLACK) {
            if (values.slackAuthType === "bot_token") {
                submitValues.value = JSON.stringify({
                    type: "bot_token",
                    token: values.slackBotToken,
                })
            } else {
                submitValues.value = JSON.stringify({
                    type: "webhook",
                    webhookUrl: values.slackWebhookUrl,
                })
            }
        }

        const { gmailEmail, gmailAppPassword, whatsappAccessToken, whatsappPhoneNumberId, notionApiKey, razorpayKeyId, razorpayKeySecret, msg91AuthKey, shiprocketEmail, shiprocketPassword, slackAuthType, slackBotToken, slackWebhookUrl, ...payload } = submitValues

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
                                                } else if (val === CredentialType.GMAIL_OAUTH) {
                                                    form.setValue("value", "gmail-oauth-credential")
                                                } else if (val === CredentialType.WHATSAPP) {
                                                    form.setValue("value", "whatsapp-credential")
                                                } else if (val === CredentialType.NOTION) {
                                                    form.setValue("value", "notion-credential")
                                                } else if (val === CredentialType.RAZORPAY) {
                                                    form.setValue("value", "razorpay-credential")
                                                } else if (val === CredentialType.MSG91) {
                                                    form.setValue("value", "msg91-credential")
                                                } else if (val === CredentialType.SLACK) {
                                                    form.setValue("value", "slack-credential")
                                                } else if (val === CredentialType.GOOGLE_SHEETS || val === CredentialType.GOOGLE_DRIVE) {
                                                    form.setValue("value", "")
                                                } else {
                                                    const currentValue = form.getValues("value")
                                                    if (
                                                      currentValue === "gmail-credential" ||
                                                      currentValue === "gmail-oauth-credential" ||
                                                      currentValue === "whatsapp-credential" ||
                                                      currentValue === "notion-credential" ||
                                                      currentValue === "razorpay-credential" ||
                                                      currentValue === "msg91-credential" ||
                                                      currentValue === "slack-credential" ||
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


                            {isGmailOAuth ? (
                                <div className="space-y-4">
                                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                        <p className="font-medium mb-2">Connect your Gmail account via OAuth2</p>
                                        <p>Click the button below to securely authorize access to your Gmail account.</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <a href={`/api/auth/gmail?redirectTo=${encodeURIComponent(pathname)}`}>
                                            <Image src="/logos/gmail.svg" alt="Gmail" width={16} height={16} className="mr-2" />
                                            Connect Gmail Account
                                        </a>
                                    </Button>
                                </div>
                            ) : isGmail ? (
                                <>
                                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                                        <p className="font-medium mb-1">⚠️ App Password is deprecated</p>
                                        <p>Reconnect with OAuth2 to use all Gmail operations. Select &quot;Gmail OAuth&quot; as the type above.</p>
                                    </div>

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
                            ) : isNotion ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="notionApiKey"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Internal Integration Token</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="secret_..." {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Find this in{" "}
                                                    <a
                                                        href="https://www.notion.so/my-integrations"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary underline"
                                                    >
                                                        notion.so/my-integrations
                                                    </a>
                                                    {" "}→ select your integration → Secrets → Internal Integration Secret
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : isRazorpay ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="razorpayKeyId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Key ID</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="rzp_live_xxx or rzp_test_xxx" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="razorpayKeySecret"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Key Secret</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Key Secret" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                        <p className="font-medium mb-2">ℹ️ How to get Razorpay API Keys</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Go to{" "}
                                                <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">
                                                    dashboard.razorpay.com
                                                </a>
                                            </li>
                                            <li>Settings → API Keys → Generate Key</li>
                                            <li>Copy Key ID and Key Secret</li>
                                        </ol>
                                        <p className="mt-2 text-xs">
                                            Use rzp_test_ keys for testing, rzp_live_ for production
                                        </p>
                                    </div>
                                </>
                            ) : isMsg91 ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="msg91AuthKey"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Auth Key</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Enter your MSG91 Auth Key" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Found in MSG91 Dashboard → API → Auth Key
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                        <p className="font-medium mb-2">ℹ️ How to get your MSG91 Auth Key</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Go to{" "}
                                                <a href="https://msg91.com" target="_blank" rel="noopener noreferrer" className="underline">
                                                    msg91.com
                                                </a>
                                                {" "}and log in
                                            </li>
                                            <li>Navigate to API → Auth Key</li>
                                            <li>Copy the Auth Key</li>
                                        </ol>
                                    </div>
                                </>
                            ) : isShiprocket ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="shiprocketEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Enter your Shiprocket email" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    The email you use to log in to Shiprocket
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shiprocketPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Enter your Shiprocket password" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Your Shiprocket account password
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                        <p className="font-medium mb-2">ℹ️ How to get your Shiprocket credentials</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Go to{" "}
                                                <a href="https://app.shiprocket.in" target="_blank" rel="noopener noreferrer" className="underline">
                                                    app.shiprocket.in
                                                </a>
                                                {" "}and sign up or log in
                                            </li>
                                            <li>Use the same email and password here</li>
                                            <li>Shiprocket uses JWT auth — credentials are used to generate a token</li>
                                        </ol>
                                    </div>
                                </>
                            ) : isSlack ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="slackAuthType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Auth Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select auth type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="bot_token">Bot Token</SelectItem>
                                                        <SelectItem value="webhook">Incoming Webhook</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {watchSlackAuthType === "bot_token" ? (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="slackBotToken"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bot Token</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="xoxb-..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                                <p className="font-medium mb-2">ℹ️ How to get a Slack Bot Token</p>
                                                <ol className="list-decimal list-inside space-y-1">
                                                    <li>Go to{" "}
                                                        <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="underline">
                                                            api.slack.com/apps
                                                        </a>
                                                    </li>
                                                    <li>Create New App → From scratch</li>
                                                    <li>OAuth &amp; Permissions → Add Bot Token Scopes:
                                                        channels:read, channels:write, chat:write,
                                                        files:write, reactions:write, users:read,
                                                        groups:read, im:read
                                                    </li>
                                                    <li>Install to Workspace</li>
                                                    <li>Copy Bot User OAuth Token (xoxb-...)</li>
                                                </ol>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="slackWebhookUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Webhook URL</FormLabel>
                                                        <FormControl>
                                                            <Input type="text" placeholder="https://hooks.slack.com/..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                                <p className="font-medium mb-2">ℹ️ How to get a Slack Webhook URL</p>
                                                <ol className="list-decimal list-inside space-y-1">
                                                    <li>Go to{" "}
                                                        <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="underline">
                                                            api.slack.com/apps
                                                        </a>
                                                    </li>
                                                    <li>Incoming Webhooks → Activate</li>
                                                    <li>Add New Webhook to Workspace</li>
                                                    <li>Copy Webhook URL</li>
                                                </ol>
                                            </div>
                                        </>
                                    )}
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