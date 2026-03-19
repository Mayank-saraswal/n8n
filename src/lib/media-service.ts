import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob"

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME ?? ""
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY ?? ""
const CONTAINER_NAME =
  process.env.AZURE_STORAGE_CONTAINER_NAME ?? "nodebase-workflow-media"
const SAS_EXPIRY_HOURS = parseInt(
  process.env.AZURE_STORAGE_SAS_EXPIRY_HOURS ?? "48"
)

// Lazy-initialized client (only created when actually needed)
let _blobServiceClient: BlobServiceClient | null = null

function getBlobServiceClient(): BlobServiceClient {
  if (!_blobServiceClient) {
    if (!ACCOUNT_NAME || !ACCOUNT_KEY) {
      throw new Error(
        "MediaService: AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY must be set"
      )
    }
    const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY)
    _blobServiceClient = new BlobServiceClient(
      `https://${ACCOUNT_NAME}.blob.core.windows.net`,
      credential
    )
  }
  return _blobServiceClient
}

export interface UploadResult {
  blobName: string // internal path
  url: string // permanent SAS URL valid for SAS_EXPIRY_HOURS
  mimeType: string
  sizeBytes: number
  expiresAt: string // ISO timestamp
}

export interface MediaUploadOptions {
  userId: string
  workflowId: string
  executionId?: string
  filename?: string // if not set, auto-generated from mimeType
}

// ── Core: upload from URL (fetches URL, stores permanently) ────────────────

export async function uploadFromUrl(
  sourceUrl: string,
  opts: MediaUploadOptions
): Promise<UploadResult> {
  // Fetch the media bytes
  const response = await fetch(sourceUrl, {
    signal: AbortSignal.timeout(60000), // 60s timeout for large images
  })

  if (!response.ok) {
    throw new Error(
      `MediaService: Failed to fetch media from URL (${response.status}): ${sourceUrl.slice(0, 100)}`
    )
  }

  const mimeType =
    response.headers.get("content-type") ?? "application/octet-stream"
  const buffer = await response.arrayBuffer()

  return uploadFromBuffer(Buffer.from(buffer), mimeType, opts)
}

// ── Core: upload from base64 string ───────────────────────────────────────

export async function uploadFromBase64(
  base64Data: string,
  mimeType: string,
  opts: MediaUploadOptions
): Promise<UploadResult> {
  // Strip data URL prefix if present: "data:image/png;base64,..."
  const stripped = base64Data.includes(",")
    ? base64Data.split(",")[1] ?? base64Data
    : base64Data

  const buffer = Buffer.from(stripped, "base64")
  return uploadFromBuffer(buffer, mimeType, opts)
}

// ── Core: upload from Buffer ───────────────────────────────────────────────

export async function uploadFromBuffer(
  buffer: Buffer,
  mimeType: string,
  opts: MediaUploadOptions
): Promise<UploadResult> {
  const ext = mimeTypeToExt(mimeType)
  const filename = opts.filename ?? `media-${Date.now()}.${ext}`
  const executionId = opts.executionId ?? "no-execution"

  // Path: uploads/{userId}/{workflowId}/{executionId}/{timestamp}-{filename}
  const blobName = `uploads/${opts.userId}/${opts.workflowId}/${executionId}/${Date.now()}-${filename}`

  const client = getBlobServiceClient()
  const containerClient = client.getContainerClient(CONTAINER_NAME)

  // Ensure container exists (idempotent)
  await containerClient.createIfNotExists()

  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: mimeType },
  })

  const url = generateSasUrl(blobName)
  const expiresAt = new Date(
    Date.now() + SAS_EXPIRY_HOURS * 60 * 60 * 1000
  ).toISOString()

  return {
    blobName,
    url,
    mimeType,
    sizeBytes: buffer.length,
    expiresAt,
  }
}

// ── SAS URL generation ─────────────────────────────────────────────────────

function generateSasUrl(blobName: string): string {
  const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY)
  const expiresOn = new Date(Date.now() + SAS_EXPIRY_HOURS * 60 * 60 * 1000)

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: CONTAINER_NAME,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // read-only
      expiresOn,
    },
    credential
  ).toString()

  return `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${sasToken}`
}

// ── Convenience: auto-detect source type and upload ───────────────────────

export async function uploadMedia(
  source: string, // URL, base64 data URL, or raw base64
  mimeTypeHint: string, // used if source is raw base64
  opts: MediaUploadOptions
): Promise<UploadResult> {
  if (source.startsWith("data:")) {
    // data:image/png;base64,iVBOR...
    const mimeMatch = source.match(/data:([^;]+);/)
    const mimeType = mimeMatch?.[1] ?? mimeTypeHint
    return uploadFromBase64(source, mimeType, opts)
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    return uploadFromUrl(source, opts)
  }

  // Assume raw base64
  return uploadFromBase64(source, mimeTypeHint, opts)
}

// ── Mime type → file extension ─────────────────────────────────────────────

export function mimeTypeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "audio/mpeg": "mp3",
    "audio/mp4": "mp4",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/flac": "flac",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/json": "json",
    "application/octet-stream": "bin",
  }
  return map[mimeType] ?? mimeType.split("/")[1] ?? "bin"
}

// ── Delete (called by cleanup job or on workflow delete) ───────────────────

export async function deleteWorkflowMedia(
  userId: string,
  workflowId: string
): Promise<number> {
  const client = getBlobServiceClient()
  const containerClient = client.getContainerClient(CONTAINER_NAME)
  const prefix = `uploads/${userId}/${workflowId}/`

  let deleted = 0
  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    await containerClient.deleteBlob(blob.name, {
      deleteSnapshots: "include",
    })
    deleted++
  }
  return deleted
}
