"use client"

import { useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials"
import { CredentialType } from "@/generated/prisma"
import { CheckIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export interface Msg91FormValues {
  credentialId?: string
  operation?: string
  variableName?: string
  mobile?: string
  senderId?: string
  flowId?: string
  smsVariables?: string
  message?: string
  route?: string
  bulkData?: string
  scheduleTime?: string
  otpTemplateId?: string
  otpExpiry?: number
  otpLength?: number
  otpValue?: string
  retryType?: string
  whatsappTemplate?: string
  whatsappLang?: string
  whatsappParams?: string
  integratedNumber?: string
  mediaType?: string
  mediaUrl?: string
  mediaCaption?: string
  voiceMessage?: string
  toEmail?: string
  subject?: string
  emailBody?: string
  fromEmail?: string
  fromName?: string
  requestId?: string
  continueOnFail?: boolean
}

interface Msg91DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: Msg91FormValues) => void
  defaultValues?: Partial<Msg91FormValues>
  nodeId?: string
  workflowId?: string
}

type Msg91Op =
  | "SEND_SMS" | "SEND_BULK_SMS" | "SEND_TRANSACTIONAL" | "SCHEDULE_SMS"
  | "SEND_OTP" | "VERIFY_OTP" | "RESEND_OTP" | "INVALIDATE_OTP"
  | "SEND_WHATSAPP" | "SEND_WHATSAPP_MEDIA"
  | "SEND_VOICE_OTP"
  | "SEND_EMAIL"
  | "GET_BALANCE" | "GET_REPORT"

const needsMobile = (op: string) =>
  ["SEND_SMS", "SEND_BULK_SMS", "SEND_TRANSACTIONAL", "SCHEDULE_SMS", "SEND_OTP", "VERIFY_OTP", "RESEND_OTP", "INVALIDATE_OTP", "SEND_WHATSAPP", "SEND_WHATSAPP_MEDIA", "SEND_VOICE_OTP"].includes(op)
const needsFlowId = (op: string) =>
  ["SEND_SMS", "SEND_BULK_SMS", "SCHEDULE_SMS"].includes(op)
const needsSenderId = (op: string) =>
  ["SEND_SMS", "SEND_BULK_SMS", "SEND_TRANSACTIONAL", "SCHEDULE_SMS"].includes(op)
const needsOtpFields = (op: string) =>
  ["SEND_OTP", "SEND_VOICE_OTP"].includes(op)
const needsWhatsApp = (op: string) =>
  ["SEND_WHATSAPP"].includes(op)
const needsMedia = (op: string) =>
  ["SEND_WHATSAPP_MEDIA"].includes(op)
const needsEmail = (op: string) =>
  ["SEND_EMAIL"].includes(op)

export const Msg91Dialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
  workflowId,
}: Msg91DialogProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [credentialId, setCredentialId] = useState(defaultValues.credentialId || "")
  const [operation, setOperation] = useState<Msg91Op>((defaultValues.operation as Msg91Op) || "SEND_OTP")
  const [variableName, setVariableName] = useState(defaultValues.variableName || "msg91")
  const [mobile, setMobile] = useState(defaultValues.mobile || "")
  const [senderId, setSenderId] = useState(defaultValues.senderId || "")
  const [flowId, setFlowId] = useState(defaultValues.flowId || "")
  const [smsVariables, setSmsVariables] = useState(defaultValues.smsVariables || "{}")
  const [message, setMessage] = useState(defaultValues.message || "")
  const [route, setRoute] = useState(defaultValues.route || "4")
  const [bulkData, setBulkData] = useState(defaultValues.bulkData || "[]")
  const [scheduleTime, setScheduleTime] = useState(defaultValues.scheduleTime || "")
  const [otpTemplateId, setOtpTemplateId] = useState(defaultValues.otpTemplateId || "")
  const [otpExpiry, setOtpExpiry] = useState(defaultValues.otpExpiry ?? 10)
  const [otpLength, setOtpLength] = useState(defaultValues.otpLength ?? 6)
  const [otpValue, setOtpValue] = useState(defaultValues.otpValue || "")
  const [retryType, setRetryType] = useState(defaultValues.retryType || "text")
  const [whatsappTemplate, setWhatsappTemplate] = useState(defaultValues.whatsappTemplate || "")
  const [whatsappLang, setWhatsappLang] = useState(defaultValues.whatsappLang || "en")
  const [whatsappParams, setWhatsappParams] = useState(defaultValues.whatsappParams || "[]")
  const [integratedNumber, setIntegratedNumber] = useState(defaultValues.integratedNumber || "")
  const [mediaType, setMediaType] = useState(defaultValues.mediaType || "image")
  const [mediaUrl, setMediaUrl] = useState(defaultValues.mediaUrl || "")
  const [mediaCaption, setMediaCaption] = useState(defaultValues.mediaCaption || "")
  const [voiceMessage, setVoiceMessage] = useState(defaultValues.voiceMessage || "")
  const [toEmail, setToEmail] = useState(defaultValues.toEmail || "")
  const [subject, setSubject] = useState(defaultValues.subject || "")
  const [emailBody, setEmailBody] = useState(defaultValues.emailBody || "")
  const [fromEmail, setFromEmail] = useState(defaultValues.fromEmail || "")
  const [fromName, setFromName] = useState(defaultValues.fromName || "")
  const [requestId, setRequestId] = useState(defaultValues.requestId || "")
  const [continueOnFail, setContinueOnFail] = useState(defaultValues.continueOnFail ?? false)
  const [saved, setSaved] = useState(false)

  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.MSG91)

  const { data: config, isLoading } = useQuery(
    trpc.msg91.getByNodeId.queryOptions(
      { nodeId: nodeId! },
      { enabled: open && !!nodeId }
    )
  )

  useEffect(() => {
    if (config) {
      setCredentialId(config.credentialId || "")
      setOperation(config.operation as Msg91Op)
      setVariableName(config.variableName || "msg91")
      setMobile(config.mobile)
      setSenderId(config.senderId)
      setFlowId(config.flowId)
      setSmsVariables(config.smsVariables)
      setMessage(config.message)
      setRoute(config.route)
      setBulkData(config.bulkData)
      setScheduleTime(config.scheduleTime)
      setOtpTemplateId(config.otpTemplateId)
      setOtpExpiry(config.otpExpiry)
      setOtpLength(config.otpLength)
      setOtpValue(config.otpValue)
      setRetryType(config.retryType)
      setWhatsappTemplate(config.whatsappTemplate)
      setWhatsappLang(config.whatsappLang)
      setWhatsappParams(config.whatsappParams)
      setIntegratedNumber(config.integratedNumber)
      setMediaType(config.mediaType)
      setMediaUrl(config.mediaUrl)
      setMediaCaption(config.mediaCaption)
      setVoiceMessage(config.voiceMessage)
      setToEmail(config.toEmail)
      setSubject(config.subject)
      setEmailBody(config.emailBody)
      setFromEmail(config.fromEmail)
      setFromName(config.fromName)
      setRequestId(config.requestId)
      setContinueOnFail(config.continueOnFail)
    }
  }, [config])

  useEffect(() => {
    if (open && !config) {
      setCredentialId(defaultValues.credentialId || "")
      setOperation((defaultValues.operation as Msg91Op) || "SEND_OTP")
      setVariableName(defaultValues.variableName || "msg91")
      setMobile(defaultValues.mobile || "")
      setSenderId(defaultValues.senderId || "")
      setFlowId(defaultValues.flowId || "")
      setSmsVariables(defaultValues.smsVariables || "{}")
      setMessage(defaultValues.message || "")
      setRoute(defaultValues.route || "4")
      setBulkData(defaultValues.bulkData || "[]")
      setScheduleTime(defaultValues.scheduleTime || "")
      setOtpTemplateId(defaultValues.otpTemplateId || "")
      setOtpExpiry(defaultValues.otpExpiry ?? 10)
      setOtpLength(defaultValues.otpLength ?? 6)
      setOtpValue(defaultValues.otpValue || "")
      setRetryType(defaultValues.retryType || "text")
      setWhatsappTemplate(defaultValues.whatsappTemplate || "")
      setWhatsappLang(defaultValues.whatsappLang || "en")
      setWhatsappParams(defaultValues.whatsappParams || "[]")
      setIntegratedNumber(defaultValues.integratedNumber || "")
      setMediaType(defaultValues.mediaType || "image")
      setMediaUrl(defaultValues.mediaUrl || "")
      setMediaCaption(defaultValues.mediaCaption || "")
      setVoiceMessage(defaultValues.voiceMessage || "")
      setToEmail(defaultValues.toEmail || "")
      setSubject(defaultValues.subject || "")
      setEmailBody(defaultValues.emailBody || "")
      setFromEmail(defaultValues.fromEmail || "")
      setFromName(defaultValues.fromName || "")
      setRequestId(defaultValues.requestId || "")
      setContinueOnFail(defaultValues.continueOnFail ?? false)
    }
  }, [open, config, defaultValues])

  const upsertMutation = useMutation(
    trpc.msg91.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.msg91.getByNodeId.queryKey({ nodeId: nodeId! }) })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  )

  const handleSave = () => {
    if (!nodeId || !workflowId) return
    const values: Msg91FormValues = {
      credentialId: credentialId || undefined,
      operation,
      variableName,
      mobile,
      senderId,
      flowId,
      smsVariables,
      message,
      route,
      bulkData,
      scheduleTime,
      otpTemplateId,
      otpExpiry,
      otpLength,
      otpValue,
      retryType,
      whatsappTemplate,
      whatsappLang,
      whatsappParams,
      integratedNumber,
      mediaType,
      mediaUrl,
      mediaCaption,
      voiceMessage,
      toEmail,
      subject,
      emailBody,
      fromEmail,
      fromName,
      requestId,
      continueOnFail,
    }
    upsertMutation.mutate({
      nodeId,
      workflowId,
      credentialId: credentialId || undefined,
      operation,
      variableName,
      mobile,
      senderId,
      flowId,
      smsVariables,
      message,
      route,
      bulkData,
      scheduleTime,
      otpTemplateId,
      otpExpiry,
      otpLength,
      otpValue,
      retryType,
      whatsappTemplate,
      whatsappLang,
      whatsappParams,
      integratedNumber,
      mediaType,
      mediaUrl,
      mediaCaption,
      voiceMessage,
      toEmail,
      subject,
      emailBody,
      fromEmail,
      fromName,
      requestId,
      continueOnFail,
    })
    onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>MSG91 Configuration</DialogTitle>
          <DialogDescription>
            SMS, OTP, WhatsApp, Voice & Email via MSG91
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="animate-spin size-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Credential */}
            <div className="space-y-2">
              <Label>MSG91 Credential</Label>
              {isLoadingCredentials ? (
                <div className="text-sm text-muted-foreground">Loading credentials…</div>
              ) : credentials && credentials.length > 0 ? (
                <Select value={credentialId} onValueChange={setCredentialId}>
                  <SelectTrigger><SelectValue placeholder="Select credential" /></SelectTrigger>
                  <SelectContent>
                    {credentials.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No MSG91 credentials.{" "}
                  <Link href="/credentials" className="underline">Add one</Link>
                </p>
              )}
            </div>

            <Separator />

            {/* Operation */}
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select value={operation} onValueChange={(v) => setOperation(v as Msg91Op)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEND_SMS">Send SMS</SelectItem>
                  <SelectItem value="SEND_BULK_SMS">Send Bulk SMS</SelectItem>
                  <SelectItem value="SEND_TRANSACTIONAL">Send Transactional SMS</SelectItem>
                  <SelectItem value="SCHEDULE_SMS">Schedule SMS</SelectItem>
                  <SelectItem value="SEND_OTP">Send OTP</SelectItem>
                  <SelectItem value="VERIFY_OTP">Verify OTP</SelectItem>
                  <SelectItem value="RESEND_OTP">Resend OTP</SelectItem>
                  <SelectItem value="INVALIDATE_OTP">Invalidate OTP</SelectItem>
                  <SelectItem value="SEND_WHATSAPP">Send WhatsApp</SelectItem>
                  <SelectItem value="SEND_WHATSAPP_MEDIA">WhatsApp Media</SelectItem>
                  <SelectItem value="SEND_VOICE_OTP">Voice OTP</SelectItem>
                  <SelectItem value="SEND_EMAIL">Send Email</SelectItem>
                  <SelectItem value="GET_BALANCE">Get Balance</SelectItem>
                  <SelectItem value="GET_REPORT">Get Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Variable name */}
            <div className="space-y-2">
              <Label>Variable Name</Label>
              <Input value={variableName} onChange={(e) => setVariableName(e.target.value)} placeholder="msg91" />
              <p className="text-xs text-muted-foreground">Access output as {"{{"}msg91.status{"}}"}.</p>
            </div>

            <Separator />

            {/* ── Mobile ─────────────────────────────────────── */}
            {needsMobile(operation) && (
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="919876543210 or {{variable}}" />
                <p className="text-xs text-muted-foreground">Include country code (e.g. 91 for India)</p>
              </div>
            )}

            {/* ── SMS fields ─────────────────────────────────── */}
            {needsSenderId(operation) && (
              <div className="space-y-2">
                <Label>Sender ID</Label>
                <Input value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="NODEBS (6 chars, DLT registered)" />
              </div>
            )}

            {needsFlowId(operation) && (
              <>
                <div className="space-y-2">
                  <Label>Flow ID</Label>
                  <Input value={flowId} onChange={(e) => setFlowId(e.target.value)} placeholder="MSG91 Flow ID" />
                  <p className="text-xs text-muted-foreground">From MSG91 Dashboard → SMS → Flows</p>
                </div>
                <div className="space-y-2">
                  <Label>Template Variables (JSON)</Label>
                  <Textarea value={smsVariables} onChange={(e) => setSmsVariables(e.target.value)} placeholder='{"VAR1": "value1", "VAR2": "value2"}' rows={3} />
                </div>
              </>
            )}

            {operation === "SEND_TRANSACTIONAL" && (
              <>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message text" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Route</Label>
                  <Select value={route} onValueChange={setRoute}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Promotional</SelectItem>
                      <SelectItem value="4">4 - Transactional</SelectItem>
                      <SelectItem value="8">8 - DND Transactional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {operation === "SEND_BULK_SMS" && (
              <div className="space-y-2">
                <Label>Bulk Data (JSON Array)</Label>
                <Textarea value={bulkData} onChange={(e) => setBulkData(e.target.value)} placeholder='[{"mobile":"919...", "VAR1":"value"}, ...]' rows={4} />
              </div>
            )}

            {operation === "SCHEDULE_SMS" && (
              <div className="space-y-2">
                <Label>Schedule Time</Label>
                <Input value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} placeholder="YYYY-MM-DD HH:mm:ss or {{variable}}" />
              </div>
            )}

            {/* ── OTP fields ─────────────────────────────────── */}
            {needsOtpFields(operation) && (
              <>
                <div className="space-y-2">
                  <Label>OTP Template ID</Label>
                  <Input value={otpTemplateId} onChange={(e) => setOtpTemplateId(e.target.value)} placeholder="DLT-registered template ID" />
                </div>
                <div className="space-y-2">
                  <Label>OTP Length</Label>
                  <Select value={String(otpLength)} onValueChange={(v) => setOtpLength(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 digits</SelectItem>
                      <SelectItem value="5">5 digits</SelectItem>
                      <SelectItem value="6">6 digits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>OTP Expiry (minutes)</Label>
                  <Input type="number" value={otpExpiry} onChange={(e) => setOtpExpiry(Number(e.target.value))} placeholder="10" />
                </div>
              </>
            )}

            {operation === "VERIFY_OTP" && (
              <div className="space-y-2">
                <Label>OTP Value</Label>
                <Input value={otpValue} onChange={(e) => setOtpValue(e.target.value)} placeholder="{{body.otp}} or entered OTP" />
              </div>
            )}

            {operation === "RESEND_OTP" && (
              <div className="space-y-2">
                <Label>Retry Type</Label>
                <Select value={retryType} onValueChange={setRetryType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text (SMS)</SelectItem>
                    <SelectItem value="voice">Voice Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ── WhatsApp fields ────────────────────────────── */}
            {(needsWhatsApp(operation) || needsMedia(operation)) && (
              <div className="space-y-2">
                <Label>Integrated Number</Label>
                <Input value={integratedNumber} onChange={(e) => setIntegratedNumber(e.target.value)} placeholder="Your WhatsApp number via MSG91" />
              </div>
            )}

            {needsWhatsApp(operation) && (
              <>
                <div className="space-y-2">
                  <Label>WhatsApp Template Name</Label>
                  <Input value={whatsappTemplate} onChange={(e) => setWhatsappTemplate(e.target.value)} placeholder="template_name" />
                </div>
                <div className="space-y-2">
                  <Label>Template Language</Label>
                  <Input value={whatsappLang} onChange={(e) => setWhatsappLang(e.target.value)} placeholder="en" />
                </div>
                <div className="space-y-2">
                  <Label>Template Components (JSON)</Label>
                  <Textarea value={whatsappParams} onChange={(e) => setWhatsappParams(e.target.value)} placeholder='[{"type":"body","parameters":[...]}]' rows={3} />
                </div>
              </>
            )}

            {needsMedia(operation) && (
              <>
                <div className="space-y-2">
                  <Label>Media Type</Label>
                  <Select value={mediaType} onValueChange={setMediaType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Media URL</Label>
                  <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                </div>
                <div className="space-y-2">
                  <Label>Caption</Label>
                  <Input value={mediaCaption} onChange={(e) => setMediaCaption(e.target.value)} placeholder="Optional caption" />
                </div>
              </>
            )}

            {/* ── Email fields ───────────────────────────────── */}
            {needsEmail(operation) && (
              <>
                <div className="space-y-2">
                  <Label>To Email</Label>
                  <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="recipient@example.com or {{variable}}" />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="sender@yourdomain.com" />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
                </div>
                <div className="space-y-2">
                  <Label>Email Body</Label>
                  <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Email content (HTML supported)" rows={4} />
                </div>
              </>
            )}

            {/* ── Report ─────────────────────────────────────── */}
            {operation === "GET_REPORT" && (
              <div className="space-y-2">
                <Label>Request ID</Label>
                <Input value={requestId} onChange={(e) => setRequestId(e.target.value)} placeholder="Request ID from previous SMS send" />
              </div>
            )}

            <Separator />

            {/* Continue on fail */}
            <div className="flex items-center justify-between">
              <Label>Continue on Fail</Label>
              <Switch checked={continueOnFail} onCheckedChange={setContinueOnFail} />
            </div>

            {/* Save */}
            <Button onClick={handleSave} disabled={upsertMutation.isPending} className="w-full">
              {upsertMutation.isPending ? (
                <Loader2Icon className="animate-spin size-4 mr-2" />
              ) : saved ? (
                <CheckIcon className="size-4 mr-2" />
              ) : null}
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
