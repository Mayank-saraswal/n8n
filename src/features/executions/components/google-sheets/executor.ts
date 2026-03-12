import type { NodeExecutor } from "@/features/executions/types"
import { NonRetriableError } from "inngest"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { googleSheetsChannel } from "@/inngest/channels/google-sheets"

interface GoogleSheetsCredential {
  refreshToken: string
  accessToken?: string
  expiresAt?: number
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.GOOGLE_SHEETS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_SHEETS_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("Failed to refresh Google token")
  return data.access_token
}

type GoogleSheetsData = {
  nodeId?: string
}

export const googleSheetsExecutor: NodeExecutor<GoogleSheetsData> = async ({
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(
    googleSheetsChannel().status({ nodeId, status: "loading" })
  )

  // Step 1: Load config
  const config = await step.run(
    `google-sheets-${nodeId}-load`,
    async () => {
      return prisma.googleSheetsNode.findUnique({ where: { nodeId } })
    }
  )

  if (!config || !config.credentialId || !config.spreadsheetId) {
    await publish(
      googleSheetsChannel().status({ nodeId, status: "error" })
    )
    throw new NonRetriableError(
      "Google Sheets node not configured. Open settings to configure."
    )
  }

  // Step 2: Load and decrypt credential
  const credential = await step.run(
    `google-sheets-${nodeId}-credential`,
    async () => {
      return prisma.credential.findUnique({
        where: { id: config.credentialId, userId },
      })
    }
  )

  if (!credential) {
    await publish(
      googleSheetsChannel().status({ nodeId, status: "error" })
    )
    throw new NonRetriableError(
      "Google Sheets credential not found. Please re-select your credential."
    )
  }

  const { refreshToken } = JSON.parse(
    decrypt(credential.value)
  ) as GoogleSheetsCredential

  if (!refreshToken) {
    await publish(
      googleSheetsChannel().status({ nodeId, status: "error" })
    )
    throw new NonRetriableError(
      "Invalid Google Sheets credential. Refresh token is required."
    )
  }

  // Step 3: Get fresh access token
  const accessToken = await step.run(
    `google-sheets-${nodeId}-token`,
    async () => {
      return refreshAccessToken(refreshToken)
    }
  )

  const spreadsheetId = config.spreadsheetId
  const sheetName = config.sheetName || "Sheet1"
  const range = `${sheetName}!${config.range || "A:Z"}`

  // Step 4: Execute operation
  if (config.operation === "APPEND_ROW") {
    const rowData = config.rowData as Array<{ column: string; value: string }>

    // Resolve templates in values
    const resolvedValues = rowData.map((col) =>
      resolveTemplate(col.value, context)
    )

    const appendResult = await step.run(
      `google-sheets-${nodeId}-append`,
      async () => {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ values: [resolvedValues] }),
          }
        )
        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Google Sheets API error: ${err}`)
        }
        return (await res.json()) as Record<string, unknown>
      }
    )

    await publish(
      googleSheetsChannel().status({ nodeId, status: "success" })
    )

    return {
      ...context,
      googleSheets: {
        operation: "APPEND_ROW",
        success: true,
        result: appendResult,
      },
    }
  } else {
    // READ_ROWS
    const rows = await step.run(
      `google-sheets-${nodeId}-read`,
      async () => {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Google Sheets API error: ${err}`)
        }
        const data = (await res.json()) as { values?: string[][] }
        return data.values || []
      }
    )

    await publish(
      googleSheetsChannel().status({ nodeId, status: "success" })
    )

    return { ...context, googleSheets: { operation: "READ_ROWS", rows } }
  }
}
