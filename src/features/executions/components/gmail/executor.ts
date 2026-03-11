import nodemailer from "nodemailer"
import type { NodeExecutor } from "@/features/executions/types"
import { NonRetriableError } from "inngest"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { gmailChannel } from "@/inngest/channels/gmail"

interface GmailCredential {
  email: string
  appPassword: string
}

type GmailData = {
  nodeId?: string
}

export const gmailExecutor: NodeExecutor<GmailData> = async ({
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(
    gmailChannel().status({
      nodeId,
      status: "loading",
    })
  )

  // Step 1: Load config
  const config = await step.run(`gmail-${nodeId}-load-config`, async () => {
    return prisma.gmailNode.findUnique({ where: { nodeId } })
  })

  if (!config) {
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      "Gmail node not configured. Open settings to configure."
    )
  }

  // Step 2: Load and decrypt credential
  const credential = await step.run(
    `gmail-${nodeId}-load-credential`,
    async () => {
      return prisma.credenial.findUnique({
        where: {
          id: config.credentialId,
          userId,
        },
      })
    }
  )

  if (!credential) {
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      "Gmail credential not found. Please re-select your credential."
    )
  }

  const decrypted = JSON.parse(decrypt(credential.value)) as GmailCredential

  if (!decrypted.email || !decrypted.appPassword) {
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      "Invalid Gmail credential. Email and App Password are required."
    )
  }

  // Step 3: Resolve template variables
  const resolvedTo = resolveTemplate(config.to, context)
  const resolvedSubject = resolveTemplate(config.subject, context)
  const resolvedBody = resolveTemplate(config.body, context)

  if (!resolvedTo.trim()) {
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw new NonRetriableError(
      `Gmail: 'To' field resolved to empty string. Template: "${config.to}"`
    )
  }

  // Step 4: Send email via Nodemailer
  try {
    const result = await step.run(`gmail-${nodeId}-send`, async () => {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: decrypted.email,
          pass: decrypted.appPassword,
        },
      })

      const mailOptions = {
        from: `Nodebase <${decrypted.email}>`,
        to: resolvedTo,
        subject: resolvedSubject,
        ...(config.isHtml
          ? { html: resolvedBody }
          : { text: resolvedBody }),
      }

      const info = await transporter.sendMail(mailOptions)

      return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        to: resolvedTo,
        subject: resolvedSubject,
        sentAt: new Date().toISOString(),
      }
    })

    await publish(
      gmailChannel().status({
        nodeId,
        status: "success",
      })
    )

    return {
      ...context,
      gmail: result,
    }
  } catch (error) {
    console.error("Gmail Error:", error)
    await publish(
      gmailChannel().status({
        nodeId,
        status: "error",
      })
    )

    const message =
      error instanceof Error ? error.message : "Unknown error"

    if (message.includes("Invalid login") || message.includes("535")) {
      throw new NonRetriableError(
        "Gmail authentication failed. Check your App Password."
      )
    }
    if (message.includes("rejected") || message.includes("550")) {
      throw new NonRetriableError(
        "Email rejected by Gmail. Check the 'To' address."
      )
    }
    throw new NonRetriableError(`Gmail error: ${message}`)
  }
}
