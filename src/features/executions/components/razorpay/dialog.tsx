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

export interface RazorpayFormValues {
  credentialId?: string
  operation?: string
  amount?: string
  currency?: string
  description?: string
  receipt?: string
  customerId?: string
  paymentId?: string
  orderId?: string
  refundAmount?: string
  refundId?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

interface RazorpayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: RazorpayFormValues) => void
  defaultValues?: Partial<RazorpayFormValues>
  nodeId?: string
  workflowId?: string
}

type RazorpayOp =
  | "CREATE_ORDER"
  | "FETCH_ORDER"
  | "CREATE_REFUND"
  | "FETCH_PAYMENT"
  | "FETCH_REFUND"
  | "CREATE_CUSTOMER"
  | "FETCH_CUSTOMER"

const OUTPUT_HINTS: Record<string, string[]> = {
  CREATE_ORDER: [
    "{{razorpay.id}}",
    "{{razorpay.amount}}",
    "{{razorpay.currency}}",
    "{{razorpay.status}}",
  ],
  FETCH_ORDER: [
    "{{razorpay.id}}",
    "{{razorpay.amount}}",
    "{{razorpay.status}}",
  ],
  FETCH_PAYMENT: [
    "{{razorpay.id}}",
    "{{razorpay.amount}}",
    "{{razorpay.status}}",
    "{{razorpay.method}}",
  ],
  CREATE_REFUND: [
    "{{razorpay.id}}",
    "{{razorpay.amount}}",
    "{{razorpay.status}}",
  ],
  FETCH_REFUND: [
    "{{razorpay.id}}",
    "{{razorpay.amount}}",
    "{{razorpay.status}}",
  ],
  CREATE_CUSTOMER: [
    "{{razorpay.id}}",
    "{{razorpay.name}}",
    "{{razorpay.email}}",
  ],
  FETCH_CUSTOMER: [
    "{{razorpay.id}}",
    "{{razorpay.name}}",
    "{{razorpay.email}}",
  ],
}

export const RazorpayDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
  workflowId,
}: RazorpayDialogProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [credentialId, setCredentialId] = useState(
    defaultValues.credentialId || ""
  )
  const [operation, setOperation] = useState<RazorpayOp>(
    (defaultValues.operation as RazorpayOp) || "CREATE_ORDER"
  )
  const [amount, setAmount] = useState(defaultValues.amount || "")
  const [currency, setCurrency] = useState(defaultValues.currency || "INR")
  const [description, setDescription] = useState(
    defaultValues.description || ""
  )
  const [receipt, setReceipt] = useState(defaultValues.receipt || "")
  const [customerId, setCustomerId] = useState(defaultValues.customerId || "")
  const [paymentId, setPaymentId] = useState(defaultValues.paymentId || "")
  const [orderId, setOrderId] = useState(defaultValues.orderId || "")
  const [refundAmount, setRefundAmount] = useState(
    defaultValues.refundAmount || ""
  )
  const [refundId, setRefundId] = useState(defaultValues.refundId || "")
  const [customerName, setCustomerName] = useState(
    defaultValues.customerName || ""
  )
  const [customerEmail, setCustomerEmail] = useState(
    defaultValues.customerEmail || ""
  )
  const [customerPhone, setCustomerPhone] = useState(
    defaultValues.customerPhone || ""
  )
  const [saved, setSaved] = useState(false)

  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.RAZORPAY)

  const { data: config, isLoading } = useQuery(
    trpc.razorpay.getByNodeId.queryOptions(
      { nodeId: nodeId! },
      { enabled: open && !!nodeId }
    )
  )

  // Pre-fill from DB config when loaded
  useEffect(() => {
    if (config) {
      setCredentialId(config.credentialId || "")
      setOperation(config.operation as RazorpayOp)
      setAmount(config.amount)
      setCurrency(config.currency)
      setDescription(config.description)
      setReceipt(config.receipt)
      setCustomerId(config.customerId)
      setPaymentId(config.paymentId)
      setOrderId(config.orderId)
      setRefundAmount(config.refundAmount)
      setRefundId(config.refundId)
      setCustomerName(config.customerName)
      setCustomerEmail(config.customerEmail)
      setCustomerPhone(config.customerPhone)
    }
  }, [config])

  // Reset when dialog opens with defaultValues
  useEffect(() => {
    if (open && !config) {
      setCredentialId(defaultValues.credentialId || "")
      setOperation((defaultValues.operation as RazorpayOp) || "CREATE_ORDER")
      setAmount(defaultValues.amount || "")
      setCurrency(defaultValues.currency || "INR")
      setDescription(defaultValues.description || "")
      setReceipt(defaultValues.receipt || "")
      setCustomerId(defaultValues.customerId || "")
      setPaymentId(defaultValues.paymentId || "")
      setOrderId(defaultValues.orderId || "")
      setRefundAmount(defaultValues.refundAmount || "")
      setRefundId(defaultValues.refundId || "")
      setCustomerName(defaultValues.customerName || "")
      setCustomerEmail(defaultValues.customerEmail || "")
      setCustomerPhone(defaultValues.customerPhone || "")
    }
  }, [open, defaultValues, config])

  const upsertMutation = useMutation(
    trpc.razorpay.upsert.mutationOptions({
      onSuccess: () => {
        if (nodeId) {
          queryClient.invalidateQueries(
            trpc.razorpay.getByNodeId.queryOptions({ nodeId })
          )
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  )

  const isValid = !!credentialId.trim()

  const handleSave = () => {
    if (!isValid) return

    const values: RazorpayFormValues = {
      credentialId,
      operation,
      amount,
      currency,
      description,
      receipt,
      customerId,
      paymentId,
      orderId,
      refundAmount,
      refundId,
      customerName,
      customerEmail,
      customerPhone,
    }

    onSubmit(values)

    if (workflowId && nodeId) {
      upsertMutation.mutate({
        workflowId,
        nodeId,
        credentialId: credentialId || undefined,
        operation,
        amount,
        currency,
        description,
        receipt,
        customerId,
        paymentId,
        orderId,
        refundAmount,
        refundId,
        customerName,
        customerEmail,
        customerPhone,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Razorpay — Payment Gateway</DialogTitle>
          <DialogDescription>
            Create orders, payments, refunds, and customers via Razorpay API
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Credential Selector */}
            <div className="space-y-2">
              <Label>Razorpay Credential</Label>
              <Select
                value={credentialId}
                onValueChange={setCredentialId}
                disabled={isLoadingCredentials || !credentials?.length}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select credential..." />
                </SelectTrigger>
                <SelectContent>
                  {credentials?.map((credential) => (
                    <SelectItem key={credential.id} value={credential.id}>
                      {credential.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!credentials?.length && !isLoadingCredentials && (
                <p className="text-xs text-muted-foreground">
                  No Razorpay credentials found.
                </p>
              )}
              <Link
                href="/credentials/new"
                className="text-xs text-primary hover:underline"
              >
                + Add new Razorpay credential
              </Link>
              {!credentialId && (
                <p className="text-xs text-destructive">
                  Credential is required
                </p>
              )}
            </div>

            <Separator />

            {/* Operation */}
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select
                value={operation}
                onValueChange={(val) => setOperation(val as RazorpayOp)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREATE_ORDER">Create Order</SelectItem>
                  <SelectItem value="FETCH_ORDER">Fetch Order</SelectItem>
                  <SelectItem value="FETCH_PAYMENT">Fetch Payment</SelectItem>
                  <SelectItem value="CREATE_REFUND">Create Refund</SelectItem>
                  <SelectItem value="FETCH_REFUND">Fetch Refund</SelectItem>
                  <SelectItem value="CREATE_CUSTOMER">
                    Create Customer
                  </SelectItem>
                  <SelectItem value="FETCH_CUSTOMER">
                    Fetch Customer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* CREATE_ORDER fields */}
            {operation === "CREATE_ORDER" && (
              <>
                <div className="space-y-2">
                  <Label>Amount (in paise)</Label>
                  <Input
                    placeholder="50000 (for ₹500)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount in smallest currency unit. Tip: Use{" "}
                    {"{{body.amount}}"} for dynamic values
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    placeholder="INR"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Receipt (optional)</Label>
                  <Input
                    placeholder="receipt_001"
                    value={receipt}
                    onChange={(e) => setReceipt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Payment for order #123"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* FETCH_ORDER fields */}
            {operation === "FETCH_ORDER" && (
              <div className="space-y-2">
                <Label>Order ID</Label>
                <Input
                  placeholder="order_xxxxxxxxxxxxx"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{razorpay.id}}"} from a previous Create Order step
                </p>
              </div>
            )}

            {/* FETCH_PAYMENT fields */}
            {operation === "FETCH_PAYMENT" && (
              <div className="space-y-2">
                <Label>Payment ID</Label>
                <Input
                  placeholder="pay_xxxxxxxxxxxxx"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{razorpay.id}}"} from a previous payment context
                </p>
              </div>
            )}

            {/* CREATE_REFUND fields */}
            {operation === "CREATE_REFUND" && (
              <>
                <div className="space-y-2">
                  <Label>Payment ID</Label>
                  <Input
                    placeholder="pay_xxxxxxxxxxxxx"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Refund Amount (optional, in paise)</Label>
                  <Input
                    placeholder="Leave empty for full refund"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If empty, the full payment amount will be refunded
                  </p>
                </div>
              </>
            )}

            {/* FETCH_REFUND fields */}
            {operation === "FETCH_REFUND" && (
              <>
                <div className="space-y-2">
                  <Label>Payment ID</Label>
                  <Input
                    placeholder="pay_xxxxxxxxxxxxx"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Refund ID (optional)</Label>
                  <Input
                    placeholder="rfnd_xxxxxxxxxxxxx (leave empty for all refunds)"
                    value={refundId}
                    onChange={(e) => setRefundId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If empty, returns all refunds for the payment
                  </p>
                </div>
              </>
            )}

            {/* CREATE_CUSTOMER fields */}
            {operation === "CREATE_CUSTOMER" && (
              <>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="john@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+919876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* FETCH_CUSTOMER fields */}
            {operation === "FETCH_CUSTOMER" && (
              <div className="space-y-2">
                <Label>Customer ID</Label>
                <Input
                  placeholder="cust_xxxxxxxxxxxxx"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </div>
            )}

            {/* Output hints */}
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Output variables:
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {OUTPUT_HINTS[operation]?.join("  ") ?? ""}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {"{{razorpay.operation}}  {{razorpay.timestamp}}"}
              </p>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!isValid || upsertMutation.isPending}
              >
                {upsertMutation.isPending ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckIcon className="size-4 mr-2" />
                    Saved ✓
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
