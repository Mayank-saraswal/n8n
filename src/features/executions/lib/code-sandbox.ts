import vm from "node:vm"
import nodeFetch from "node-fetch"

export interface CodeSandboxOptions {
  code: string
  context: Record<string, unknown>
  timeout: number
  allowedDomains: string
  variableName: string
}

export interface CodeSandboxResult {
  output: unknown
  logs: string[]
  executionMs: number
  error?: string
}

/**
 * Build a domain-restricted fetch function.
 * If allowedDomains is empty, all domains are allowed.
 */
function buildSafeFetch(allowedDomains: string) {
  const allowedList = allowedDomains
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)

  return async (url: string, init?: Record<string, unknown>) => {
    if (allowedList.length > 0) {
      let hostname: string
      try {
        hostname = new URL(url).hostname.toLowerCase()
      } catch {
        throw new Error(`Invalid URL: ${url}`)
      }
      const allowed = allowedList.some(
        (d) => hostname === d || hostname.endsWith(`.${d}`),
      )
      if (!allowed) {
        throw new Error(
          `fetch() blocked: "${hostname}" is not in allowed domains. ` +
            `Add it in Code node Settings → Allowed Domains.`,
        )
      }
    }
    const response = await nodeFetch(url, init as Parameters<typeof nodeFetch>[1])
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
      text: () =>
        typeof body === "object" ? JSON.stringify(body) : String(body),
    }
  }
}

/**
 * Run user code in a sandboxed Node.js vm context.
 *
 * Uses vm.createContext() which creates a context with NO access to
 * process, require, fs, child_process, etc. by default.
 * Only explicitly injected objects are available.
 *
 * The sandbox exposes:
 *  - $input / $json — previous node context (deep-cloned)
 *  - $ — rich helper object (fetch, date, number, string, array, json utilities)
 *  - console.log / console.error / console.warn / console.info — captured into logs
 *  - fetch — domain-restricted HTTP client
 */
export async function runCodeSandbox(
  opts: CodeSandboxOptions,
): Promise<CodeSandboxResult> {
  const logs: string[] = []
  const startTime = Date.now()

  try {
    // Deep-clone context to prevent mutation
    const safeContext = JSON.parse(JSON.stringify(opts.context))

    // Build domain-restricted fetch
    const safeFetch = buildSafeFetch(opts.allowedDomains)

    // Console capture
    const logFn = (...args: unknown[]) => {
      const msg = args
        .map((a) =>
          typeof a === "object" ? JSON.stringify(a) : String(a),
        )
        .join(" ")
      logs.push(`[${new Date().toISOString()}] ${msg}`)
    }

    // Build the $ helper object
    const dollarHelper = {
      get: (key: string) => safeContext[key],
      all: () => ({ ...safeContext }),
      keys: () => Object.keys(safeContext),
      has: (key: string) =>
        key in safeContext && safeContext[key] != null,

      fetch: safeFetch,
      getJson: async (url: string, fetchOpts?: Record<string, unknown>) => {
        const r = await safeFetch(url, fetchOpts)
        return r.json()
      },
      postJson: async (
        url: string,
        body: unknown,
        fetchOpts?: Record<string, unknown>,
      ) => {
        const r = await safeFetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(fetchOpts?.headers as Record<string, string> ?? {}),
          },
          body: JSON.stringify(body),
          ...fetchOpts,
        })
        return r.json()
      },

      date: {
        now: () => new Date().toISOString(),
        format: (
          date: string | number | Date,
          locale?: string,
          options?: Intl.DateTimeFormatOptions,
        ) => new Date(date).toLocaleString(locale ?? "en-IN", options),
        addDays: (date: string | number | Date, days: number) => {
          const d = new Date(date)
          d.setDate(d.getDate() + days)
          return d.toISOString()
        },
        addHours: (date: string | number | Date, hours: number) => {
          const d = new Date(date)
          d.setHours(d.getHours() + hours)
          return d.toISOString()
        },
        diff: (
          a: string | number | Date,
          b: string | number | Date,
          unit?: string,
        ) => {
          const ms = new Date(a).getTime() - new Date(b).getTime()
          if (unit === "hours") return ms / (1000 * 60 * 60)
          if (unit === "minutes") return ms / (1000 * 60)
          return ms / (1000 * 60 * 60 * 24)
        },
        isWeekend: (date: string | number | Date) => {
          const d = new Date(date).getDay()
          return d === 0 || d === 6
        },
      },

      number: {
        paiseToRupees: (p: number) => p / 100,
        rupeesToPaise: (r: number) => Math.round(r * 100),
        formatCurrency: (
          amount: number,
          currency?: string,
          locale?: string,
        ) =>
          new Intl.NumberFormat(locale ?? "en-IN", {
            style: "currency",
            currency: currency ?? "INR",
          }).format(amount),
        round: (n: number, decimals?: number) =>
          Number(n.toFixed(decimals ?? 2)),
        clamp: (n: number, min: number, max: number) =>
          Math.min(Math.max(n, min), max),
        sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
        average: (arr: number[]) =>
          arr.reduce((a, b) => a + b, 0) / arr.length,
      },

      string: {
        truncate: (s: string, len: number, suffix?: string) =>
          s.length > len ? s.slice(0, len) + (suffix ?? "...") : s,
        slugify: (s: string) =>
          s
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        extractEmails: (s: string) =>
          s.match(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
          ) ?? [],
        extractNumbers: (s: string) =>
          (s.match(/-?\d+(\.\d+)?/g) ?? []).map(Number),
        template: (tmpl: string, vars: Record<string, unknown>) =>
          tmpl.replace(/\{\{(\w+)\}\}/g, (_, k) =>
            String(vars[k] ?? ""),
          ),
      },

      array: {
        chunk: <T>(arr: T[], size: number) => {
          const chunks: T[][] = []
          for (let i = 0; i < arr.length; i += size)
            chunks.push(arr.slice(i, i + size))
          return chunks
        },
        unique: <T>(arr: T[]) => [...new Set(arr)],
        groupBy: <T extends Record<string, unknown>>(
          arr: T[],
          key: string,
        ) =>
          arr.reduce(
            (acc, item) => {
              const k = String(item[key])
              if (!acc[k]) acc[k] = []
              acc[k].push(item)
              return acc
            },
            {} as Record<string, T[]>,
          ),
        flatten: <T>(arr: T[][]) => arr.flat(),
        sortBy: (
          arr: Record<string, unknown>[],
          key: string,
          dir?: string,
        ) =>
          [...arr].sort((a, b) => {
            const aVal = a[key] as string | number
            const bVal = b[key] as string | number
            if (aVal < bVal) return dir === "desc" ? 1 : -1
            if (aVal > bVal) return dir === "desc" ? -1 : 1
            return 0
          }),
      },

      json: {
        parse: (s: string) => JSON.parse(s),
        stringify: (v: unknown, indent?: number) =>
          JSON.stringify(v, null, indent ?? 0),
        pick: (obj: Record<string, unknown>, keys: string[]) =>
          Object.fromEntries(
            keys.filter((k) => k in obj).map((k) => [k, obj[k]]),
          ),
        omit: (obj: Record<string, unknown>, keys: string[]) =>
          Object.fromEntries(
            Object.entries(obj).filter(([k]) => !keys.includes(k)),
          ),
      },

      log: (...args: unknown[]) => logFn(...args),
    }

    // Build sandbox with explicit globals only — no process, require, fs, etc.
    const sandbox: Record<string, unknown> = {
      $input: safeContext,
      $json: safeContext,
      $: dollarHelper,
      console: {
        log: (...args: unknown[]) => logFn(...args),
        error: (...args: unknown[]) => logFn("[ERROR]", ...args),
        warn: (...args: unknown[]) => logFn("[WARN]", ...args),
        info: (...args: unknown[]) => logFn("[INFO]", ...args),
      },
      fetch: safeFetch,
      // Standard safe globals
      JSON,
      Math,
      Date,
      Array,
      Object,
      String: globalThis.String,
      Number: globalThis.Number,
      Boolean: globalThis.Boolean,
      RegExp,
      Map,
      Set,
      Promise,
      parseInt: globalThis.parseInt,
      parseFloat: globalThis.parseFloat,
      isNaN: globalThis.isNaN,
      isFinite: globalThis.isFinite,
      encodeURIComponent: globalThis.encodeURIComponent,
      decodeURIComponent: globalThis.decodeURIComponent,
      encodeURI: globalThis.encodeURI,
      decodeURI: globalThis.decodeURI,
      Intl: globalThis.Intl,
      // Block dangerous globals
      process: undefined,
      require: undefined,
      module: undefined,
      exports: undefined,
      __dirname: undefined,
      __filename: undefined,
      globalThis: undefined,
      global: undefined,
      setTimeout: undefined,
      setInterval: undefined,
      setImmediate: undefined,
      clearTimeout: undefined,
      clearInterval: undefined,
      clearImmediate: undefined,
      Buffer: undefined,
      eval: undefined,
      Function: undefined,
    }

    // Create isolated context
    const vmContext = vm.createContext(sandbox)

    // Wrap user code in async IIFE — top-level await works
    const wrappedCode = `
      (async function __userCode__() {
        ${opts.code}
      })()
    `

    // Compile and run with timeout
    const script = new vm.Script(wrappedCode, {
      filename: "user-code.js",
    })

    const rawResult = script.runInContext(vmContext, {
      timeout: opts.timeout,
    })

    // Await the result if it's a promise
    let output: unknown
    if (rawResult && typeof rawResult.then === "function") {
      let timer: ReturnType<typeof globalThis.setTimeout> | undefined
      output = await Promise.race([
        (rawResult as Promise<unknown>).then((v: unknown) => {
          if (timer) globalThis.clearTimeout(timer)
          return v
        }),
        new Promise((_, reject) => {
          timer = globalThis.setTimeout(
            () =>
              reject(
                new Error(
                  `Code execution timed out after ${opts.timeout}ms`,
                ),
              ),
            opts.timeout,
          )
        }),
      ])
    } else {
      output = rawResult
    }

    return { output, logs, executionMs: Date.now() - startTime }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const isTimeout =
      message.includes("Script execution timed out") ||
      message.includes("timed out")
    return {
      output: undefined,
      logs,
      executionMs: Date.now() - startTime,
      error: isTimeout
        ? `Code execution timed out after ${opts.timeout}ms. Increase timeout in node settings.`
        : message,
    }
  }
}
