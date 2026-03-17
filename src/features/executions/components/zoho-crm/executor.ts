import { NonRetriableError, RetryAfterError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { zohoCrmChannel } from "./channels"

const ZOHO_API_BASE: Record<string, string> = {
  in: "https://www.zohoapis.in/crm/v6",
  com: "https://www.zohoapis.com/crm/v6",
  eu: "https://www.zohoapis.eu/crm/v6",
  au: "https://www.zohoapis.com.au/crm/v6",
  jp: "https://www.zohoapis.jp/crm/v6",
  uk: "https://www.zohoapis.uk/crm/v6",
}

const ZOHO_ACCOUNTS_BASE: Record<string, string> = {
  in: "https://accounts.zoho.in",
  com: "https://accounts.zoho.com",
  eu: "https://accounts.zoho.eu",
  au: "https://accounts.zoho.com.au",
  jp: "https://accounts.zoho.jp",
  uk: "https://accounts.zoho.uk",
}

async function refreshZohoToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  region: string
): Promise<string> {
  const base = ZOHO_ACCOUNTS_BASE[region] ?? ZOHO_ACCOUNTS_BASE.com
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  })

  const res = await fetch(`${base}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!res.ok) {
    throw new NonRetriableError(
      `Zoho CRM: OAuth token refresh failed (${res.status}). Check clientId and clientSecret.`
    )
  }

  const data = (await res.json()) as { access_token?: string; error?: string }

  if (data.error === "invalid_client") {
    throw new NonRetriableError("Zoho CRM: Invalid client ID or secret.")
  }

  if (data.error === "invalid_code") {
    throw new NonRetriableError(
      "Zoho CRM: Refresh token is invalid or expired. Re-authorize in Zoho API Console."
    )
  }

  if (data.error) {
    throw new NonRetriableError(`Zoho CRM OAuth error: ${data.error}`)
  }

  if (!data.access_token) {
    throw new NonRetriableError("Zoho CRM: No access_token returned from OAuth.")
  }

  return data.access_token
}

async function zohoApi(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  accessToken: string,
  region: string,
  body?: unknown,
  queryParams?: Record<string, string | number>
): Promise<Record<string, unknown>> {
  const base = ZOHO_API_BASE[region] ?? ZOHO_API_BASE.com
  const url = new URL(`${base}${path}`)

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After")
    throw new RetryAfterError(
      "Zoho CRM: Rate limit exceeded",
      retryAfter ? parseInt(retryAfter, 10) * 1000 : 60_000
    )
  }

  if (res.status === 401) {
    throw new NonRetriableError("Zoho CRM: Access token rejected. Verify credentials and region.")
  }

  if (res.status === 204) {
    return { success: true }
  }

  const data = (await res.json()) as Record<string, unknown>

  if (
    data.status === "error" &&
    typeof data.code === "string" &&
    !["SUCCESS", "APPROVED"].includes(data.code)
  ) {
    const message = typeof data.message === "string" ? data.message : String(data.code)
    throw new NonRetriableError(`Zoho CRM API error: ${message}`)
  }

  return data
}

export const zohoCrmExecutor: NodeExecutor = async ({ nodeId, context, step, publish, userId }) => {
  const config = await step.run(`zoho-crm-${nodeId}-load`, async () =>
    prisma.zohoCrmNode.findUnique({
      where: { nodeId },
    })
  )

  await step.run(`zoho-crm-${nodeId}-validate`, async () => {
    if (!config) {
      throw new NonRetriableError("Zoho CRM node not configured")
    }

    if (!config.credentialId) {
      throw new NonRetriableError("Zoho CRM: No credential connected. Add a Zoho CRM credential first.")
    }

    return { valid: true }
  })

  return await step.run(`zoho-crm-${nodeId}-execute`, async () => {
    await publish(zohoCrmChannel(nodeId).topic("status").data({ status: "loading", nodeId }) as never)

    try {
      const credential = await prisma.credential.findUnique({
        where: {
          id: config!.credentialId!,
          userId,
        },
      })

      if (!credential) {
        throw new NonRetriableError("Zoho CRM: No credential connected. Add a Zoho CRM credential first.")
      }

      const { clientId, clientSecret, refreshToken, region } = JSON.parse(decrypt(credential.value)) as {
        clientId: string
        clientSecret: string
        refreshToken: string
        region: string
      }

      const accessToken = await refreshZohoToken(clientId, clientSecret, refreshToken, region)

      const r = (field: string) => resolveTemplate(field, context) as string
      const variableName = config!.variableName || "zoho"
      let result: unknown

      switch (config!.operation) {
        case "CREATE_LEAD": {
          if (!r(config!.lastName)) {
            throw new NonRetriableError("Zoho CRM CREATE_LEAD: Last Name is required")
          }

          const customFields = JSON.parse(r(config!.customFields) || "{}") as Record<string, unknown>

          const res = await zohoApi("POST", "/Leads", accessToken, region, {
            data: [{
              First_Name: r(config!.firstName) || undefined,
              Last_Name: r(config!.lastName),
              Email: r(config!.email) || undefined,
              Phone: r(config!.phone) || undefined,
              Mobile: r(config!.mobile) || undefined,
              Company: r(config!.company) || undefined,
              Title: r(config!.title) || undefined,
              Website: r(config!.website) || undefined,
              Lead_Source: r(config!.leadSource) || undefined,
              Lead_Status: r(config!.leadStatus) || undefined,
              Industry: r(config!.industry) || undefined,
              Annual_Revenue: r(config!.annualRevenue)
                ? parseFloat(r(config!.annualRevenue))
                : undefined,
              No_of_Employees: r(config!.noOfEmployees) ? parseInt(r(config!.noOfEmployees), 10) : undefined,
              Rating: r(config!.rating) || undefined,
              Description: r(config!.description) || undefined,
              Street: r(config!.street) || undefined,
              City: r(config!.city) || undefined,
              State: r(config!.state) || undefined,
              Country: r(config!.country) || undefined,
              Zip_Code: r(config!.zipCode) || undefined,
              ...customFields,
            }],
          })

          const item = (res.data as { code: string; details: { id: string }; message: string }[])?.[0]
          if (item?.code !== "SUCCESS") {
            throw new NonRetriableError(`Zoho CRM CREATE_LEAD failed: ${item?.message}`)
          }

          result = { success: true, leadId: item.details.id }
          break
        }

        case "GET_LEAD": {
          const id = r(config!.recordId)
          if (!id) {
            throw new NonRetriableError("Zoho CRM GET_LEAD: Record ID is required")
          }

          const res = await zohoApi("GET", `/Leads/${id}`, accessToken, region)
          result = { success: true, lead: (res.data as unknown[])?.[0] ?? null }
          break
        }

        case "UPDATE_LEAD": {
          const id = r(config!.recordId)
          if (!id) {
            throw new NonRetriableError("Zoho CRM UPDATE_LEAD: Record ID is required")
          }

          const customFields = JSON.parse(r(config!.customFields) || "{}") as Record<string, unknown>
          const updateData: Record<string, unknown> = { id, ...customFields }

          if (r(config!.firstName)) updateData.First_Name = r(config!.firstName)
          if (r(config!.lastName)) updateData.Last_Name = r(config!.lastName)
          if (r(config!.email)) updateData.Email = r(config!.email)
          if (r(config!.phone)) updateData.Phone = r(config!.phone)
          if (r(config!.mobile)) updateData.Mobile = r(config!.mobile)
          if (r(config!.company)) updateData.Company = r(config!.company)
          if (r(config!.leadSource)) updateData.Lead_Source = r(config!.leadSource)
          if (r(config!.leadStatus)) updateData.Lead_Status = r(config!.leadStatus)
          if (r(config!.description)) updateData.Description = r(config!.description)

          const res = await zohoApi("PUT", "/Leads", accessToken, region, { data: [updateData] })
          const item = (res.data as { code: string }[])?.[0]
          result = { success: item?.code === "SUCCESS", leadId: id }
          break
        }

        case "DELETE_LEAD": {
          const id = r(config!.recordId)
          if (!id) {
            throw new NonRetriableError("Zoho CRM DELETE_LEAD: Record ID is required")
          }

          await zohoApi("DELETE", `/Leads?ids=${id}`, accessToken, region)
          result = { success: true, deleted: true, leadId: id }
          break
        }

        case "SEARCH_LEADS": {
          const term = r(config!.searchTerm)
          const field = r(config!.searchField) || "Email"
          const criteria = r(config!.criteria)
          const queryParams: Record<string, string | number> = {
            page: config!.page ?? 1,
            per_page: config!.perPage ?? 10,
          }

          if (criteria) queryParams.criteria = criteria
          else if (term) queryParams[field.toLowerCase()] = term

          const res = await zohoApi("GET", "/Leads/search", accessToken, region, undefined, queryParams)
          const leads = (res.data as unknown[]) ?? []
          result = { success: true, leads, count: leads.length, info: res.info }
          break
        }

        case "CONVERT_LEAD": {
          const id = r(config!.recordId)
          if (!id) {
            throw new NonRetriableError("Zoho CRM CONVERT_LEAD: Lead Record ID is required")
          }

          const convertPayload: Record<string, unknown> = { overwrite: config!.overwrite }

          if (config!.createDeal) {
            convertPayload.Deals = {
              Deal_Name: r(config!.dealName) || undefined,
              Closing_Date: r(config!.closingDate) || undefined,
              Amount: r(config!.dealAmount) ? parseFloat(r(config!.dealAmount)) : undefined,
              Stage: r(config!.dealStage) || "Qualification",
            }
          }

          const res = await zohoApi(
            "POST",
            `/Leads/${id}/actions/convert`,
            accessToken,
            region,
            { data: [convertPayload] }
          )

          const item = (res.data as { Contacts: string; Accounts: string; Deals?: string }[])?.[0]
          result = {
            success: true,
            contactId: item?.Contacts,
            accountId: item?.Accounts,
            dealId: item?.Deals ?? null,
          }
          break
        }

        case "CREATE_CONTACT": {
          if (!r(config!.lastName)) {
            throw new NonRetriableError("Zoho CRM CREATE_CONTACT: Last Name is required")
          }

          const customFields = JSON.parse(r(config!.customFields) || "{}") as Record<string, unknown>

          const res = await zohoApi("POST", "/Contacts", accessToken, region, {
            data: [{
              First_Name: r(config!.firstName) || undefined,
              Last_Name: r(config!.lastName),
              Email: r(config!.email) || undefined,
              Phone: r(config!.phone) || undefined,
              Mobile: r(config!.mobile) || undefined,
              Title: r(config!.title) || undefined,
              Account_Name: r(config!.accountName) ? { name: r(config!.accountName) } : undefined,
              Lead_Source: r(config!.leadSource) || undefined,
              Description: r(config!.description) || undefined,
              Mailing_Street: r(config!.street) || undefined,
              Mailing_City: r(config!.city) || undefined,
              Mailing_State: r(config!.state) || undefined,
              Mailing_Country: r(config!.country) || undefined,
              Mailing_Zip: r(config!.zipCode) || undefined,
              ...customFields,
            }],
          })

          const item = (res.data as { code: string; details: { id: string }; message: string }[])?.[0]
          if (item?.code !== "SUCCESS") {
            throw new NonRetriableError(`Zoho CRM CREATE_CONTACT failed: ${item?.message}`)
          }

          result = { success: true, contactId: item.details.id }
          break
        }

        case "GET_CONTACT": {
          const id = r(config!.recordId)
          if (!id) {
            throw new NonRetriableError("Zoho CRM GET_CONTACT: Record ID is required")
          }

          const res = await zohoApi("GET", `/Contacts/${id}`, accessToken, region)
          result = { success: true, contact: (res.data as unknown[])?.[0] ?? null }
          break
        }

        case "UPDATE_CONTACT": {
          const id = r(config!.recordId)
          if (!id) {
            throw new NonRetriableError("Zoho CRM UPDATE_CONTACT: Record ID is required")
          }

          const customFields = JSON.parse(r(config!.customFields) || "{}") as Record<string, unknown>
          const updateData: Record<string, unknown> = { id, ...customFields }

          if (r(config!.firstName)) updateData.First_Name = r(config!.firstName)
          if (r(config!.lastName)) updateData.Last_Name = r(config!.lastName)
          if (r(config!.email)) updateData.Email = r(config!.email)
          if (r(config!.phone)) updateData.Phone = r(config!.phone)
          if (r(config!.mobile)) updateData.Mobile = r(config!.mobile)
          if (r(config!.description)) updateData.Description = r(config!.description)

          const res = await zohoApi("PUT", "/Contacts", accessToken, region, { data: [updateData] })
          result = { success: (res.data as { code: string }[])?.[0]?.code === "SUCCESS", contactId: id }
          break
        }

        case "DELETE_CONTACT": {
          const id = r(config!.recordId)
          if (!id) {
            throw new NonRetriableError("Zoho CRM DELETE_CONTACT: Record ID is required")
          }

          await zohoApi("DELETE", `/Contacts?ids=${id}`, accessToken, region)
          result = { success: true, deleted: true, contactId: id }
          break
        }

        case "SEARCH_CONTACTS": {
          const term = r(config!.searchTerm)
          const field = r(config!.searchField) || "Email"
          const criteria = r(config!.criteria)
          const queryParams: Record<string, string | number> = {
            page: config!.page ?? 1,
            per_page: config!.perPage ?? 10,
          }

          if (criteria) queryParams.criteria = criteria
          else if (term) queryParams[field.toLowerCase()] = term

          const res = await zohoApi("GET", "/Contacts/search", accessToken, region, undefined, queryParams)
          const contacts = (res.data as unknown[]) ?? []
          result = { success: true, contacts, count: contacts.length }
          break
        }

        case "GET_CONTACT_DEALS": {
          const id = r(config!.recordId)
          if (!id) {
            throw new NonRetriableError("Zoho CRM GET_CONTACT_DEALS: Contact Record ID is required")
          }

          const res = await zohoApi("GET", `/Contacts/${id}/Deals`, accessToken, region, undefined, {
            page: config!.page ?? 1,
            per_page: config!.perPage ?? 10,
          })

          const deals = (res.data as unknown[]) ?? []
          result = { success: true, deals, count: deals.length }
          break
        }

        // ── CONTINUED IN PART 3 (Deals, Accounts, Activities, Notes, Advanced) ──
        default:
          throw new NonRetriableError(`Zoho CRM operation not supported yet: ${config!.operation}`)
      }

      await publish(zohoCrmChannel(nodeId).topic("status").data({ status: "success", nodeId }) as never)
      return { ...context, [variableName]: result }
    } catch (error) {
      await publish(zohoCrmChannel(nodeId).topic("status").data({ status: "error", nodeId }) as never)

      const message = error instanceof Error ? error.message : "Unknown error"
      if (config?.continueOnFail) {
        return { ...context, [config.variableName || "zoho"]: { success: false, error: message } }
      }

      throw error
    }
  })
}
