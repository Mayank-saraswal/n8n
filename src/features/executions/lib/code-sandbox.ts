import { VM } from "vm2"
import fetch from "node-fetch"

export interface CodeSandboxOptions {
  code: string
  context: Record<string, unknown>
  language?: string
  timeout?: number
  allowedDomains?: string
}

export interface CodeSandboxResult {
  output: unknown
  logs: string[]
}

/**
 * Run user code in a sandboxed VM2 environment.
 *
 * The sandbox exposes:
 *  - $input / $json — previous node context (read-only copy)
 *  - console.log / console.error — captured into `logs`
 *  - fetch — domain-restricted HTTP client (when allowedDomains is set)
 *  - Promise, JSON, Math, Date, Array, Object, parseInt, parseFloat, etc.
 */
export async function runCodeSandbox(
  options: CodeSandboxOptions,
): Promise<CodeSandboxResult> {
  const {
    code,
    context,
    timeout = 5000,
    allowedDomains = "",
  } = options

  const logs: string[] = []

  // Build a domain-restricted fetch if allowedDomains is specified
  const safeFetch = buildSafeFetch(allowedDomains)

  const sandbox: Record<string, unknown> = {
    $input: structuredClone(context),
    $json: structuredClone(context),
    console: {
      log: (...args: unknown[]) => {
        logs.push(args.map(String).join(" "))
      },
      error: (...args: unknown[]) => {
        logs.push(`[error] ${args.map(String).join(" ")}`)
      },
      warn: (...args: unknown[]) => {
        logs.push(`[warn] ${args.map(String).join(" ")}`)
      },
    },
    fetch: safeFetch,
    setTimeout: undefined,
    setInterval: undefined,
    setImmediate: undefined,
    clearTimeout: undefined,
    clearInterval: undefined,
    clearImmediate: undefined,
  }

  // Wrap user code in an async IIFE so `await` / `return` work at top-level
  const wrappedCode = `
    (async function() {
      ${code}
    })()
  `

  const vm = new VM({
    timeout,
    sandbox,
    eval: false,
    wasm: false,
  })

  const rawOutput = vm.run(wrappedCode)

  // Await the result if it's a promise (from async user code)
  let output: unknown
  if (rawOutput && typeof rawOutput.then === "function") {
    let timer: ReturnType<typeof globalThis.setTimeout> | undefined
    output = await Promise.race([
      (rawOutput as Promise<unknown>).then((v: unknown) => {
        if (timer) clearTimeout(timer)
        return v
      }),
      new Promise((_, reject) => {
        timer = globalThis.setTimeout(
          () => reject(new Error(`Code execution timed out after ${timeout}ms`)),
          timeout,
        )
      }),
    ])
  } else {
    output = rawOutput
  }

  return { output, logs }
}

/**
 * Build a fetch function that only allows requests to specified domains.
 * If allowedDomains is empty, all domains are allowed.
 */
function buildSafeFetch(allowedDomains: string) {
  const domains = allowedDomains
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)

  return async (url: string, init?: Record<string, unknown>) => {
    if (domains.length > 0) {
      try {
        const parsed = new URL(url)
        const hostname = parsed.hostname.toLowerCase()
        const allowed = domains.some(
          (d) => hostname === d || hostname.endsWith(`.${d}`),
        )
        if (!allowed) {
          throw new Error(
            `Fetch blocked: ${hostname} is not in allowed domains (${domains.join(", ")})`,
          )
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.startsWith("Fetch blocked:")) {
          throw err
        }
        throw new Error(`Invalid URL: ${url}`)
      }
    }

    const response = await fetch(url, init as any)
    const contentType = response.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text()

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      json: () => (typeof body === "string" ? JSON.parse(body) : body),
      text: () => (typeof body === "object" ? JSON.stringify(body) : String(body)),
    }
  }
}
