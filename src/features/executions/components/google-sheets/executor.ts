import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { googleSheetsChannel } from "@/inngest/channels/google-sheets"
import { GoogleSheetsOp } from "@/generated/prisma"

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets"

// ─── getAccessToken ──────────────────────────────────────────────────────────

async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
      client_secret: process.env.GOOGLE_SHEETS_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new NonRetriableError(
      `Google Sheets: Token refresh failed. ` +
        `Error: ${(err as Record<string, string>).error_description ?? res.status}. ` +
        `Re-authenticate in Settings → Credentials.`
    )
  }
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token)
    throw new NonRetriableError(
      "Google Sheets: No access_token in token refresh response."
    )
  return data.access_token
}

// ─── sheetsRequest ───────────────────────────────────────────────────────────

async function sheetsRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  token: string,
  body?: unknown
): Promise<Record<string, unknown>> {
  const url = path.startsWith("http") ? path : `${SHEETS_API}${path}`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
  const res = await fetch(url, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg =
      (err as Record<string, Record<string, string>>)?.error?.message ??
      `HTTP ${res.status}`
    throw new NonRetriableError(`Google Sheets API error: ${msg}`)
  }
  return (await res.json()) as Record<string, unknown>
}

// ─── rowsToObjects ───────────────────────────────────────────────────────────

function rowsToObjects(
  rows: string[][],
  headerRow: boolean,
  includeEmptyRows: boolean,
  maxResults: number
): unknown[] {
  if (!rows || rows.length === 0) return []

  if (headerRow) {
    const headers = rows[0]
    let dataRows = rows.slice(1)
    if (!includeEmptyRows) {
      dataRows = dataRows.filter((r) => r.some((c) => c !== ""))
    }
    return dataRows.slice(0, maxResults).map((row) => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        obj[h] = row[i] ?? ""
      })
      return obj
    })
  }

  let filtered = rows
  if (!includeEmptyRows) {
    filtered = filtered.filter((r) => r.some((c) => c !== ""))
  }
  return filtered.slice(0, maxResults)
}

// ─── GoogleSheetsData ────────────────────────────────────────────────────────

type GoogleSheetsData = {
  nodeId?: string
}

// ─── Main executor ───────────────────────────────────────────────────────────

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

  let refreshToken: string
  const raw = decrypt(credential.value)
  try {
    const parsed = JSON.parse(raw) as { refreshToken?: string }
    refreshToken = parsed.refreshToken ?? raw
  } catch {
    refreshToken = raw
  }

  if (!refreshToken) {
    await publish(
      googleSheetsChannel().status({ nodeId, status: "error" })
    )
    throw new NonRetriableError(
      'Google Sheets credential missing refreshToken. Store as JSON: {"refreshToken": "..."}'
    )
  }

  // Step 3: Get fresh access token
  const accessToken = await step.run(
    `google-sheets-${nodeId}-token`,
    async () => getAccessToken(refreshToken)
  )

  const spreadsheetId = config.spreadsheetId
  const sheetName = resolveTemplate(config.sheetName || "Sheet1", context)
  const range = `${sheetName}!${config.range || "A:Z"}`
  const varName = config.variableName || "googleSheets"

  // Step 4: Execute operation
  try {
    const result = await step.run(
      `google-sheets-${nodeId}-execute`,
      async () => {
        switch (config.operation) {
          // ── READ_ROWS ────────────────────────────────────────────
          case GoogleSheetsOp.READ_ROWS: {
            const data = await sheetsRequest(
              "GET",
              `/${spreadsheetId}/values/${encodeURIComponent(range)}`,
              accessToken
            )
            const rows = (data.values as string[][] | undefined) ?? []
            const items = rowsToObjects(
              rows,
              config.headerRow,
              config.includeEmptyRows,
              config.maxResults
            )
            return {
              operation: "READ_ROWS",
              rows: items,
              totalRows: rows.length,
              range,
            }
          }

          // ── APPEND_ROW ───────────────────────────────────────────
          case GoogleSheetsOp.APPEND_ROW: {
            let values: string[][]
            if (config.rowValues && config.rowValues.trim()) {
              const resolved = resolveTemplate(config.rowValues, context)
              let parsed: string[] | string[][]
              try {
                parsed = JSON.parse(resolved) as string[] | string[][]
              } catch {
                throw new NonRetriableError(
                  "Google Sheets APPEND_ROW: 'rowValues' contains invalid JSON."
                )
              }
              values = Array.isArray(parsed[0])
                ? (parsed as string[][])
                : [parsed as string[]]
            } else {
              const rowData = config.rowData as Array<{
                column: string
                value: string
              }>
              values = [
                rowData.map((col) => resolveTemplate(col.value, context)),
              ]
            }
            const data = await sheetsRequest(
              "POST",
              `/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${config.valueInputOption}&insertDataOption=INSERT_ROWS`,
              accessToken,
              { values }
            )
            return {
              operation: "APPEND_ROW",
              success: true,
              updatedRange:
                (data.updates as Record<string, unknown>)?.updatedRange ??
                range,
              updatedRows:
                (data.updates as Record<string, unknown>)?.updatedRows ?? 1,
            }
          }

          // ── UPDATE_ROW ───────────────────────────────────────────
          case GoogleSheetsOp.UPDATE_ROW: {
            const rowNum = resolveTemplate(config.rowNumber, context)
            if (!rowNum)
              throw new NonRetriableError(
                "Google Sheets UPDATE_ROW: 'rowNumber' is required."
              )
            const resolved = resolveTemplate(config.updateValues, context)
            let parsed: string[]
            try {
              parsed = JSON.parse(resolved) as string[]
            } catch {
              throw new NonRetriableError(
                "Google Sheets UPDATE_ROW: 'updateValues' contains invalid JSON."
              )
            }
            const updateRange = `${sheetName}!A${rowNum}`
            const data = await sheetsRequest(
              "PUT",
              `/${spreadsheetId}/values/${encodeURIComponent(updateRange)}?valueInputOption=${config.valueInputOption}`,
              accessToken,
              { values: [parsed] }
            )
            return {
              operation: "UPDATE_ROW",
              success: true,
              updatedRange: data.updatedRange ?? updateRange,
              updatedRows: data.updatedRows ?? 1,
            }
          }

          // ── UPDATE_ROWS_BY_QUERY ─────────────────────────────────
          case GoogleSheetsOp.UPDATE_ROWS_BY_QUERY: {
            const matchCol = resolveTemplate(config.matchColumn, context)
            const matchVal = resolveTemplate(config.matchValue, context)
            if (!matchCol || !matchVal)
              throw new NonRetriableError(
                "Google Sheets UPDATE_ROWS_BY_QUERY: 'matchColumn' and 'matchValue' are required."
              )
            const readData = await sheetsRequest(
              "GET",
              `/${spreadsheetId}/values/${encodeURIComponent(range)}`,
              accessToken
            )
            const allRows =
              (readData.values as string[][] | undefined) ?? []
            if (allRows.length === 0)
              return {
                operation: "UPDATE_ROWS_BY_QUERY",
                success: true,
                updatedRows: 0,
              }

            const headers = allRows[0]
            const colIndex = headers.indexOf(matchCol)
            if (colIndex === -1)
              throw new NonRetriableError(
                `Google Sheets UPDATE_ROWS_BY_QUERY: Column '${matchCol}' not found in headers.`
              )

            const resolved = resolveTemplate(config.updateValues, context)
            let updateObj: Record<string, string>
            try {
              updateObj = JSON.parse(resolved) as Record<string, string>
            } catch {
              throw new NonRetriableError(
                "Google Sheets UPDATE_ROWS_BY_QUERY: 'updateValues' contains invalid JSON."
              )
            }
            let updatedCount = 0

            for (let i = 1; i < allRows.length; i++) {
              if (allRows[i][colIndex] === matchVal) {
                const newRow = [...allRows[i]]
                for (const [key, val] of Object.entries(updateObj)) {
                  const ki = headers.indexOf(key)
                  if (ki !== -1) newRow[ki] = val
                }
                const rowRange = `${sheetName}!A${i + 1}`
                await sheetsRequest(
                  "PUT",
                  `/${spreadsheetId}/values/${encodeURIComponent(rowRange)}?valueInputOption=${config.valueInputOption}`,
                  accessToken,
                  { values: [newRow] }
                )
                updatedCount++
              }
            }
            return {
              operation: "UPDATE_ROWS_BY_QUERY",
              success: true,
              updatedRows: updatedCount,
            }
          }

          // ── DELETE_ROW ───────────────────────────────────────────
          case GoogleSheetsOp.DELETE_ROW: {
            const rowNum = resolveTemplate(config.rowNumber, context)
            if (!rowNum)
              throw new NonRetriableError(
                "Google Sheets DELETE_ROW: 'rowNumber' is required."
              )
            const rowIndex = parseInt(rowNum, 10) - 1
            if (isNaN(rowIndex) || rowIndex < 0)
              throw new NonRetriableError(
                `Google Sheets DELETE_ROW: 'rowNumber' must be a positive integer. Received: '${rowNum}'`
              )
            const meta = await sheetsRequest(
              "GET",
              `/${spreadsheetId}?fields=sheets.properties`,
              accessToken
            )
            const sheets =
              (meta.sheets as Array<{
                properties: { title: string; sheetId: number }
              }>) ?? []
            const sheet = sheets.find(
              (s) => s.properties.title === sheetName
            )
            const sheetId = sheet?.properties.sheetId ?? 0
            await sheetsRequest(
              "POST",
              `/${spreadsheetId}:batchUpdate`,
              accessToken,
              {
                requests: [
                  {
                    deleteDimension: {
                      range: {
                        sheetId,
                        dimension: "ROWS",
                        startIndex: rowIndex,
                        endIndex: rowIndex + 1,
                      },
                    },
                  },
                ],
              }
            )
            return {
              operation: "DELETE_ROW",
              success: true,
              deletedRow: parseInt(rowNum, 10),
            }
          }

          // ── GET_ROW_BY_NUMBER ──────────────────────────────────
          case GoogleSheetsOp.GET_ROW_BY_NUMBER: {
            const rowNumber = resolveTemplate(config.rowNumber, context)
            if (!rowNumber.trim())
              throw new NonRetriableError(
                "Google Sheets GET_ROW_BY_NUMBER: rowNumber is required. " +
                  "Row 1 is usually the header. Data rows start at 2."
              )
            const rowNum = parseInt(rowNumber)
            if (isNaN(rowNum) || rowNum < 1)
              throw new NonRetriableError(
                `Google Sheets GET_ROW_BY_NUMBER: must be positive integer. ` +
                  `Received: "${rowNumber}"`
              )

            const [rowData, headerData] = await Promise.all([
              sheetsRequest(
                "GET",
                `/${spreadsheetId}/values/` +
                  `${encodeURIComponent(`${sheetName}!${rowNum}:${rowNum}`)}` +
                  `?valueRenderOption=UNFORMATTED_VALUE`,
                accessToken
              ),
              config.headerRow
                ? sheetsRequest(
                    "GET",
                    `/${spreadsheetId}/values/` +
                      `${encodeURIComponent(`${sheetName}!1:1`)}`,
                    accessToken
                  )
                : Promise.resolve({ values: [] }),
            ])

            const rowArr =
              ((rowData.values as string[][] | undefined) ?? [])[0] ?? []
            const headers = config.headerRow
              ? (((headerData.values as string[][] | undefined) ?? [])[0] ??
                  [])
              : rowArr.map((_, i) => String.fromCharCode(65 + i))

            const rowObj = Object.fromEntries(
              headers.map((h, i) => [h, rowArr[i] ?? ""])
            )
            return {
              operation: "GET_ROW_BY_NUMBER",
              row: rowObj,
              rowNumber: rowNum,
              rowArray: rowArr,
              headers,
              isEmpty: rowArr.length === 0,
              sheetName,
            }
          }

          // ── SEARCH_ROWS ─────────────────────────────────────────
          case GoogleSheetsOp.SEARCH_ROWS: {
            const searchColumn = resolveTemplate(
              config.searchColumn,
              context
            )
            const searchValue = resolveTemplate(
              config.searchValue,
              context
            )
            if (!searchColumn.trim())
              throw new NonRetriableError(
                "Google Sheets SEARCH_ROWS: searchColumn is required. " +
                  "Enter the column header name, e.g. 'Phone' or 'Email'"
              )
            if (!searchValue.trim())
              throw new NonRetriableError(
                "Google Sheets SEARCH_ROWS: searchValue is required."
              )

            const allData = await sheetsRequest(
              "GET",
              `/${spreadsheetId}/values/` +
                `${encodeURIComponent(`${sheetName}!A1:ZZ`)}` +
                `?valueRenderOption=UNFORMATTED_VALUE`,
              accessToken
            )
            const allValues =
              (allData.values as string[][] | undefined) ?? []
            if (allValues.length === 0) {
              return {
                operation: "SEARCH_ROWS",
                rows: [],
                count: 0,
                firstRow: null,
                firstRowNumber: null,
                query: searchValue,
                searchColumn,
                sheetName,
              }
            }

            const sHeaders = config.headerRow ? allValues[0] : []
            const dataStart = config.headerRow ? 1 : 0
            const searchColIdx = config.headerRow
              ? sHeaders.indexOf(searchColumn)
              : parseInt(searchColumn) - 1

            if (config.headerRow && searchColIdx === -1) {
              throw new NonRetriableError(
                `Google Sheets SEARCH_ROWS: Column "${searchColumn}" not found. ` +
                  `Available columns: ${sHeaders.join(", ")}`
              )
            }

            const matchedRows: Record<string, unknown>[] = []
            const matchedRowNumbers: number[] = []

            for (
              let i = dataStart;
              i < allValues.length &&
              matchedRows.length < config.maxResults;
              i++
            ) {
              const row = allValues[i]
              if (
                String(row[searchColIdx] ?? "") ===
                String(searchValue)
              ) {
                if (config.headerRow) {
                  const obj: Record<string, string> = {}
                  sHeaders.forEach((h, j) => {
                    obj[h] = row[j] ?? ""
                  })
                  matchedRows.push(obj)
                } else {
                  matchedRows.push(
                    Object.fromEntries(row.map((v, j) => [j, v]))
                  )
                }
                matchedRowNumbers.push(i + 1)
              }
            }

            return {
              operation: "SEARCH_ROWS",
              rows: matchedRows,
              count: matchedRows.length,
              firstRow: matchedRows[0] ?? null,
              firstRowNumber: matchedRowNumbers[0] ?? null,
              rowNumbers: matchedRowNumbers,
              query: searchValue,
              searchColumn,
              sheetName,
            }
          }

          // ── CLEAR_RANGE ─────────────────────────────────────────
          case GoogleSheetsOp.CLEAR_RANGE: {
            const clearRange = resolveTemplate(
              config.clearRange || config.range || "A:Z",
              context
            )
            const fullRange = `${sheetName}!${clearRange}`
            await sheetsRequest(
              "POST",
              `/${spreadsheetId}/values/${encodeURIComponent(fullRange)}:clear`,
              accessToken,
              {}
            )
            return {
              operation: "CLEAR_RANGE",
              success: true,
              clearedRange: fullRange,
              sheetName,
            }
          }

          // ── CREATE_SHEET ────────────────────────────────────────
          case GoogleSheetsOp.CREATE_SHEET: {
            const newSheetName = resolveTemplate(
              config.newSheetName,
              context
            )
            if (!newSheetName.trim())
              throw new NonRetriableError(
                "Google Sheets CREATE_SHEET: newSheetName is required."
              )
            const createResult = await sheetsRequest(
              "POST",
              `/${spreadsheetId}:batchUpdate`,
              accessToken,
              {
                requests: [
                  {
                    addSheet: {
                      properties: { title: newSheetName },
                    },
                  },
                ],
              }
            )
            const replies =
              (createResult.replies as Array<{
                addSheet?: {
                  properties?: { sheetId?: number; title?: string }
                }
              }>) ?? []
            const newSheet = replies[0]?.addSheet?.properties
            return {
              operation: "CREATE_SHEET",
              success: true,
              sheetId: newSheet?.sheetId ?? null,
              sheetTitle: newSheet?.title ?? newSheetName,
              spreadsheetId,
            }
          }

          // ── GET_SHEET_INFO ──────────────────────────────────────
          case GoogleSheetsOp.GET_SHEET_INFO: {
            const infoData = await sheetsRequest(
              "GET",
              `/${spreadsheetId}?fields=` +
                `properties.title,properties.locale,` +
                `sheets.properties`,
              accessToken
            )
            const props = infoData.properties as Record<
              string,
              unknown
            >
            const infoSheets = (
              infoData.sheets as Array<{
                properties: {
                  sheetId: number
                  title: string
                  index: number
                  rowCount?: number
                  columnCount?: number
                }
              }>
            )?.map((s) => s.properties) ?? []
            return {
              operation: "GET_SHEET_INFO",
              title: props?.title ?? "",
              locale: props?.locale ?? "",
              sheets: infoSheets,
              sheetCount: infoSheets.length,
              spreadsheetId,
            }
          }

          default:
            throw new NonRetriableError(
              `Unknown Google Sheets operation: ${config.operation}`
            )
        }
      }
    )

    await publish(
      googleSheetsChannel().status({ nodeId, status: "success" })
    )

    return {
      ...context,
      [varName]: result,
    }
  } catch (error) {
    await publish(
      googleSheetsChannel().status({ nodeId, status: "error" })
    )

    if (error instanceof NonRetriableError) throw error

    const message =
      error instanceof Error ? error.message : "Unknown Google Sheets error"
    throw new NonRetriableError(`Google Sheets error: ${message}`)
  }
}
