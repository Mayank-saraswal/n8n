import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "@/features/executions/types"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { resolveTemplate } from "@/features/executions/lib/template-resolver"
import { googleDriveChannel } from "@/inngest/channels/google-drive"

const DRIVE_API = "https://www.googleapis.com/drive/v3"
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3"

// Token refresh — identical to Google Sheets executor pattern
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error("Failed to refresh Google token")
  return data.access_token
}

export const googleDriveExecutor: NodeExecutor = async ({
  nodeId, context, step, publish, userId,
}) => {
  await publish(googleDriveChannel().status({ nodeId, status: "loading" }))
                                                               
  // Load config
  const config = await step.run(`drive-${nodeId}-load-config`, () =>
    prisma.googleDriveNode.findUnique({ where: { nodeId } })
  )

  if (!config?.credentialId) {
    await publish(googleDriveChannel().status({ nodeId, status: "error" }))
    throw new NonRetriableError("Google Drive node is missing credential")
  }

  // Load and decrypt credential
  const credential = await step.run(`drive-${nodeId}-load-credential`, () =>
    prisma.credential.findUnique({
      where: { id: config.credentialId!, userId }
    })
  )

  if (!credential) {
    await publish(googleDriveChannel().status({ nodeId, status: "error" }))
    throw new NonRetriableError("Google Drive credential not found")
  }

  let decrypted: { refreshToken: string }
  const raw = decrypt(credential.value)
  try {
    decrypted = JSON.parse(raw)
  } catch {
    decrypted = { refreshToken: raw }
  }

  if (!decrypted?.refreshToken) {
    await publish(googleDriveChannel().status({ nodeId, status: "error" }))
    throw new NonRetriableError(
      'Google Drive credential missing refreshToken. Store as JSON: {"refreshToken": "..."}'
    )
  }

  // Execute operation
  const result = await step.run(`drive-${nodeId}-execute`, async () => {
    const token = await refreshAccessToken(decrypted.refreshToken)

    switch (config.operation) {

      case "UPLOAD_FILE": {
        // Get file content from context (previous node output)
        const fileContent = (context as Record<string, unknown>).fileContent ??
          ((context as Record<string, Record<string, unknown>>).body?.fileContent)
        const fileName = resolveTemplate(config.fileName ?? "untitled", context)
        const mimeType = config.mimeType ?? "application/octet-stream"

        if (!fileContent) {
          throw new NonRetriableError(
            "UPLOAD_FILE requires fileContent in context from a previous node"
          )
        }

        // Multipart upload
        const metadata = {
          name: fileName,
          ...(config.folderId ? { parents: [config.folderId] } : {}),
        }

        const boundary = "nodebase_boundary"
        const body = [
          `--${boundary}`,
          "Content-Type: application/json; charset=UTF-8",
          "",
          JSON.stringify(metadata),
          `--${boundary}`,
          `Content-Type: ${mimeType}`,
          "",
          typeof fileContent === "string" ? fileContent : JSON.stringify(fileContent),
          `--${boundary}--`,
        ].join("\r\n")

        const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        })
        const file = await res.json()
        if (!res.ok) throw new Error(`Drive upload failed: ${file.error?.message}`)

        return {
          ...context,
          googleDrive: {
            operation: "UPLOAD_FILE",
            fileId: file.id,
            fileName: file.name,
            mimeType: file.mimeType,
            webViewLink: file.webViewLink,
          },
        }
      }

      case "DOWNLOAD_FILE": {
        const fileId = resolveTemplate(config.fileId ?? "", context)
        if (!fileId) throw new NonRetriableError("DOWNLOAD_FILE requires a fileId")

        // Get file metadata first
        const metaRes = await fetch(`${DRIVE_API}/files/${fileId}?fields=id,name,mimeType,size`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const meta = await metaRes.json()
        if (!metaRes.ok) throw new Error(`Drive metadata failed: ${meta.error?.message}`)

        // Download content
        const contentRes = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const content = await contentRes.text()
        if (!contentRes.ok) throw new Error(`Drive download failed`)

        return {
          ...context,
          googleDrive: {
            operation: "DOWNLOAD_FILE",
            fileId: meta.id,
            fileName: meta.name,
            mimeType: meta.mimeType,
            fileContent: content,
          },
        }
      }

      case "LIST_FILES": {
        const q = config.query
          ? resolveTemplate(config.query, context)
          : config.folderId
            ? `'${config.folderId}' in parents and trashed=false`
            : "trashed=false"

        const params = new URLSearchParams({
          q,
          pageSize: String(config.maxResults ?? 10),
          fields: "files(id,name,mimeType,size,modifiedTime,webViewLink)",
        })

        const res = await fetch(`${DRIVE_API}/files?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(`Drive list failed: ${data.error?.message}`)

        return {
          ...context,
          googleDrive: {
            operation: "LIST_FILES",
            files: data.files,
            count: data.files?.length ?? 0,
          },
        }
      }

      case "CREATE_FOLDER": {
        const folderName = resolveTemplate(config.fileName ?? "New Folder", context)

        const res = await fetch(`${DRIVE_API}/files`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            ...(config.folderId ? { parents: [config.folderId] } : {}),
          }),
        })
        const folder = await res.json()
        if (!res.ok) throw new Error(`Drive folder creation failed: ${folder.error?.message}`)

        return {
          ...context,
          googleDrive: {
            operation: "CREATE_FOLDER",
            folderId: folder.id,
            folderName: folder.name,
          },
        }
      }

      default:
        throw new NonRetriableError(`Unknown operation: ${config.operation}`)
    }
  })

  await publish(googleDriveChannel().status({ nodeId, status: "success" }))
  return result as Record<string, unknown>
}
