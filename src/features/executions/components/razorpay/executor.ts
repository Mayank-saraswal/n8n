import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { razorpayChannel } from "@/inngest/channels/razorpay"
import { RazorpayOperation } from "@/generated/prisma"

interface RazorpayCredential {
  keyId: string
  keySecret: string
}

type RazorpayData = {
  nodeId?: string
}

async function razorpayRequest(
  method: string,
  path: string,
  keyId: string,
  keySecret: string,
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
  const url = `https://api.razorpay.com/v1${path}`

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  }

  if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const errorDesc =
      (error as Record<string, Record<string, string>>)?.error?.description ??
      `HTTP ${response.status}`
    throw new NonRetriableError(`Razorpay API error: ${errorDesc}`)
  }

  return (await response.json()) as Record<string, unknown>
}

export const razorpayExecutor: NodeExecutor<RazorpayData> = async ({
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(
    razorpayChannel().status({
      nodeId,
      status: "loading",
    })
  )

  // Step 1: Load config
  const config = await step.run(`razorpay-${nodeId}-load-config`, async () => {
    return prisma.razorpayNode.findUnique({ where: { nodeId } })
  })

  if (!config) {
    await publish(
      razorpayChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      "Razorpay node not configured. Open settings to configure."
    )
  }

  // Step 2: Load and decrypt credential
  const credential = await step.run(
    `razorpay-${nodeId}-load-credential`,
    async () => {
      if (!config.credentialId) return null
      return prisma.credential.findUnique({
        where: {
          id: config.credentialId,
          userId,
        },
      })
    }
  )

  if (!credential) {
    await publish(
      razorpayChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      "Razorpay credential not found. Please add a RAZORPAY credential first."
    )
  }

  const raw = decrypt(credential.value)
  let creds: RazorpayCredential
  try {
    creds = JSON.parse(raw)
  } catch {
    await publish(
      razorpayChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      'Invalid Razorpay credential format. Expected JSON: {"keyId": "rzp_...", "keySecret": "..."}'
    )
  }

  if (!creds.keyId || !creds.keySecret) {
    await publish(
      razorpayChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      "Razorpay credential missing keyId or keySecret"
    )
  }

  // Step 3: Resolve template variables and execute
  let result: Record<string, unknown>
  try {
    result = await step.run(`razorpay-${nodeId}-execute`, async () => {
      const amount = resolveTemplate(config.amount, context)
      const currency = resolveTemplate(config.currency, context) || "INR"
      const description = resolveTemplate(config.description, context)
      const receipt = resolveTemplate(config.receipt, context)
      const customerId = resolveTemplate(config.customerId, context)
      const paymentId = resolveTemplate(config.paymentId, context)
      const orderId = resolveTemplate(config.orderId, context)
      const refundAmount = resolveTemplate(config.refundAmount, context)
      const customerName = resolveTemplate(config.customerName, context)
      const customerEmail = resolveTemplate(config.customerEmail, context)
      const customerPhone = resolveTemplate(config.customerPhone, context)

      let data: Record<string, unknown>

      switch (config.operation) {
        case RazorpayOperation.CREATE_ORDER: {
          if (!amount) {
            throw new NonRetriableError(
              "Razorpay CREATE_ORDER: 'amount' is required (in paise, e.g. 50000 for ₹500)"
            )
          }
          data = await razorpayRequest(
            "POST",
            "/orders",
            creds.keyId,
            creds.keySecret,
            {
              amount: Number(amount),
              currency,
              receipt: receipt || undefined,
              notes: description ? { description } : undefined,
            }
          )
          break
        }

        case RazorpayOperation.FETCH_ORDER: {
          if (!orderId) {
            throw new NonRetriableError(
              "Razorpay FETCH_ORDER: 'orderId' is required"
            )
          }
          data = await razorpayRequest(
            "GET",
            `/orders/${orderId}`,
            creds.keyId,
            creds.keySecret
          )
          break
        }

        case RazorpayOperation.FETCH_PAYMENT: {
          if (!paymentId) {
            throw new NonRetriableError(
              "Razorpay FETCH_PAYMENT: 'paymentId' is required"
            )
          }
          data = await razorpayRequest(
            "GET",
            `/payments/${paymentId}`,
            creds.keyId,
            creds.keySecret
          )
          break
        }

        case RazorpayOperation.CREATE_REFUND: {
          if (!paymentId) {
            throw new NonRetriableError(
              "Razorpay CREATE_REFUND: 'paymentId' is required"
            )
          }
          const refundBody: Record<string, unknown> = {}
          if (refundAmount) {
            refundBody.amount = Number(refundAmount)
          }
          data = await razorpayRequest(
            "POST",
            `/payments/${paymentId}/refund`,
            creds.keyId,
            creds.keySecret,
            refundBody
          )
          break
        }

        case RazorpayOperation.FETCH_REFUND: {
          if (!paymentId) {
            throw new NonRetriableError(
              "Razorpay FETCH_REFUND: 'paymentId' is required"
            )
          }
          const refundPath = orderId
            ? `/payments/${paymentId}/refunds/${orderId}`
            : `/payments/${paymentId}/refunds`
          data = await razorpayRequest(
            "GET",
            refundPath,
            creds.keyId,
            creds.keySecret
          )
          break
        }

        case RazorpayOperation.CREATE_CUSTOMER: {
          if (!customerName && !customerEmail && !customerPhone) {
            throw new NonRetriableError(
              "Razorpay CREATE_CUSTOMER: at least one of name, email, or phone is required"
            )
          }
          const customerBody: Record<string, unknown> = {}
          if (customerName) customerBody.name = customerName
          if (customerEmail) customerBody.email = customerEmail
          if (customerPhone) customerBody.contact = customerPhone
          data = await razorpayRequest(
            "POST",
            "/customers",
            creds.keyId,
            creds.keySecret,
            customerBody
          )
          break
        }

        case RazorpayOperation.FETCH_CUSTOMER: {
          if (!customerId) {
            throw new NonRetriableError(
              "Razorpay FETCH_CUSTOMER: 'customerId' is required"
            )
          }
          data = await razorpayRequest(
            "GET",
            `/customers/${customerId}`,
            creds.keyId,
            creds.keySecret
          )
          break
        }

        default:
          throw new NonRetriableError(
            `Unknown Razorpay operation: ${config.operation}`
          )
      }

      return {
        ...context,
        razorpay: {
          ...data,
          operation: config.operation,
          timestamp: new Date().toISOString(),
        },
      }
    })
  } catch (error) {
    await publish(
      razorpayChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw error
  }

  await publish(
    razorpayChannel().status({
      nodeId,
      status: "success",
    })
  )

  return result as Record<string, unknown>
}
