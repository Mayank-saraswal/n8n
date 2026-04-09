import pg from "pg"
import Cursor from "pg-cursor"

export interface PostgresConnectionConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl: "disable" | "require" | "verify-full"
  sslCertificate?: string
  connectionTimeout: number  // seconds
  queryTimeout: number       // seconds
}

export async function createConnection(
  config: PostgresConnectionConfig
): Promise<pg.Client> {
  const sslConfig: any =
    config.ssl === "disable"
      ? false
      : config.ssl === "require"
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: true, ca: config.sslCertificate }

  const connectionTimeoutSec = config.connectionTimeout ?? 10
  const queryTimeoutSec = config.queryTimeout ?? 30

  const client = new pg.Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: sslConfig,
    connectionTimeoutMillis: connectionTimeoutSec * 1000,
    statement_timeout: queryTimeoutSec * 1000,
  })

  await client.connect()
  return client
}

export async function executeWithConnection<T>(
  config: PostgresConnectionConfig,
  fn: (client: pg.Client) => Promise<T>
): Promise<T> {
  let client: pg.Client | null = null
  try {
    client = await createConnection(config)
    return await fn(client)
  } catch (error) {
    // Redact password from connection strings in error message
    if (error instanceof Error) {
      error.message = error.message.replace(config.password, "***")
    }
    throw error
  } finally {
    if (client) {
      await client.end()
    }
  }
}

export async function executeQuery(
  client: pg.Client,
  sql: string,
  params: unknown[],
  maxRows: number
): Promise<{
  rows: Record<string, unknown>[]
  rowCount: number
  fields: Array<{ name: string; dataTypeID: number }>
}> {
  const cursor = client.query(new Cursor(sql, params))
  let rows: Record<string, unknown>[] = []
  
  try {
    // In newer pg-cursor versions, read() without callback returns a promise
    rows = await cursor.read(maxRows)
  } catch (err) {
    throw err
  } finally {
    // Close the cursor if it has a promise-based close (or callback)
    try {
      await cursor.close()
    } catch {
      // ignore close errors
    }
  }

  // pg-cursor stores the query result internal object
  const anyCursor = cursor as any
  const fields = anyCursor._result?.fields?.map((f: any) => ({
    name: f.name,
    dataTypeID: f.dataTypeID,
  })) ?? []

  return {
    rows,
    rowCount: rows.length,
    fields,
  }
}

export async function executeTransaction(
  client: pg.Client,
  statements: Array<{ sql: string; params: unknown[] }>
): Promise<{
  results: Array<{
    statement: number
    rows: Record<string, unknown>[]
    rowCount: number
  }>
  committed: boolean
}> {
  let committed = false
  const results: Array<{ statement: number; rows: Record<string, unknown>[]; rowCount: number }> = []

  try {
    await client.query("BEGIN")

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      const result = await executeQuery(client, stmt.sql, stmt.params, 10000)
      results.push({
        statement: i + 1,
        rows: result.rows,
        rowCount: result.rowCount,
      })
    }

    await client.query("COMMIT")
    committed = true
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  }

  return { results, committed }
}

export async function testConnection(
  config: PostgresConnectionConfig
): Promise<{ success: boolean; error?: string; latencyMs: number }> {
  const start = Date.now()
  let client: pg.Client | null = null

  try {
    client = await createConnection(config)
    await client.query("SELECT 1 AS ping")
    const latencyMs = Date.now() - start
    return { success: true, latencyMs }
  } catch (error) {
    let errorMsg = error instanceof Error ? error.message : String(error)
    errorMsg = errorMsg.replace(config.password, "***")
    
    // Provide human-readable errors
    if (errorMsg.includes("ECONNREFUSED") || errorMsg.includes("ENOTFOUND")) {
      errorMsg = "Check host and port"
    } else if (errorMsg.includes("password authentication failed") || errorMsg.includes("role") && errorMsg.includes("does not exist")) {
      errorMsg = "Check username and password"
    } else if (errorMsg.includes("no pg_hba.conf entry") && errorMsg.includes("SSL off")) {
      errorMsg = "Enable SSL in credential settings"
    } else if (errorMsg.includes("database") && errorMsg.includes("does not exist")) {
      errorMsg = "Check database name"
    }
    
    return { success: false, error: errorMsg, latencyMs: Date.now() - start }
  } finally {
    if (client) {
      await client.end()
    }
  }
}

export function redactPassword(config: PostgresConnectionConfig): string {
  return `${config.host}:${config.port}/${config.database} (user: ${config.user})`
}
