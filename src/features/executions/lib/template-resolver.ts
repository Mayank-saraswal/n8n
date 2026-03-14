import Handlebars from "handlebars"

// ─── Constants ────────────────────────────────────────────────────────────
const MAX_CACHE_SIZE = 500
const DEFAULT_TRUNCATE_LENGTH = 100

// ─── Template cache for performance ───────────────────────────────────────
const templateCache = new Map<string, HandlebarsTemplateDelegate>()

// ─── Create an isolated Handlebars instance ───────────────────────────────
const hbs = Handlebars.create()

// ─── Utility: detect Handlebars options hash ──────────────────────────────
// Handlebars always passes an options object as the LAST argument to every
// helper.  When a helper is called with fewer positional args than the
// function signature expects, later parameters receive that options object
// instead of the intended user value.  This guard lets every helper tell a
// real value apart from the internal options hash.
function isOptionsHash(value: unknown): boolean {
  if (value == null || typeof value !== "object") return false
  const obj = value as Record<string, unknown>
  return "hash" in obj && "data" in obj
}

// ─── Register custom helpers ──────────────────────────────────────────────

// {{json value}} — pretty-print any value as JSON
// FIX: handles null, undefined, and no-arg calls gracefully
hbs.registerHelper("json", (context: unknown) => {
  if (context == null || isOptionsHash(context)) return ""
  const jsonString = JSON.stringify(context, null, 2)
  return new hbs.SafeString(jsonString)
})

// {{eq a b}} — equality check
hbs.registerHelper("eq", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return false
  return a === b
})

// {{ne a b}} — inequality check
hbs.registerHelper("ne", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return false
  return a !== b
})

// {{gt a b}} — greater than
hbs.registerHelper("gt", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return false
  return Number(a) > Number(b)
})

// {{gte a b}} — greater than or equal
hbs.registerHelper("gte", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return false
  return Number(a) >= Number(b)
})

// {{lt a b}} — less than
hbs.registerHelper("lt", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return false
  return Number(a) < Number(b)
})

// {{lte a b}} — less than or equal
hbs.registerHelper("lte", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return false
  return Number(a) <= Number(b)
})

// {{not value}} — logical NOT
// When called without an argument, value is the options hash → return true (same as !undefined)
hbs.registerHelper("not", (value: unknown) => {
  if (isOptionsHash(value)) return true
  return !value
})

// {{default value fallback}} — fallback for missing values
// FIX: detects options hash to avoid rendering "[object Object]"
hbs.registerHelper(
  "default",
  (value: unknown, fallback: unknown) => {
    const fb = isOptionsHash(fallback) ? "" : fallback
    return value != null && value !== "" ? value : fb
  },
)

// {{uppercase str}}
hbs.registerHelper("uppercase", (str: unknown) => {
  if (isOptionsHash(str)) return ""
  return typeof str === "string" ? str.toUpperCase() : str
})

// {{lowercase str}}
hbs.registerHelper("lowercase", (str: unknown) => {
  if (isOptionsHash(str)) return ""
  return typeof str === "string" ? str.toLowerCase() : str
})

// {{truncate str len}}
hbs.registerHelper("truncate", (str: unknown, len: unknown) => {
  if (isOptionsHash(str)) return ""
  if (typeof str !== "string") return str
  const max =
    !isOptionsHash(len) && typeof len === "number" ? len : DEFAULT_TRUNCATE_LENGTH
  return str.length > max ? str.slice(0, max) + "…" : str
})

// {{concat a b ...}} — concatenate values
hbs.registerHelper("concat", (...args: unknown[]) => {
  return args.filter((a) => !isOptionsHash(a)).join("")
})

// {{encodeURI str}} — percent-encode a string for safe URL embedding
hbs.registerHelper("encodeURI", (str: unknown) => {
  if (isOptionsHash(str) || typeof str !== "string") return ""
  return encodeURIComponent(str)
})

// {{replace str search replacement}} — string replacement
hbs.registerHelper(
  "replace",
  (str: unknown, search: unknown, replacement: unknown) => {
    if (typeof str !== "string" || isOptionsHash(search)) return str
    const rep = isOptionsHash(replacement) ? "" : String(replacement ?? "")
    return str.split(String(search)).join(rep)
  },
)

// {{length value}} — length of a string or array
hbs.registerHelper("length", (value: unknown) => {
  if (isOptionsHash(value)) return 0
  if (typeof value === "string" || Array.isArray(value)) return value.length
  return 0
})

// {{jsonInline value}} — compact JSON (no pretty-print)
hbs.registerHelper("jsonInline", (value: unknown) => {
  if (value == null || isOptionsHash(value)) return "null"
  return new hbs.SafeString(JSON.stringify(value))
})

// {{trim str}} — remove leading/trailing whitespace
hbs.registerHelper("trim", (str: unknown) => {
  if (isOptionsHash(str) || str == null) return ""
  return String(str).trim()
})

// {{base64 value}} — base64-encode a string
hbs.registerHelper("base64", (value: unknown) => {
  if (isOptionsHash(value) || value == null) return ""
  return Buffer.from(String(value)).toString("base64")
})

// {{urlEncode value}} — percent-encode a string
hbs.registerHelper("urlEncode", (value: unknown) => {
  if (isOptionsHash(value) || value == null) return ""
  return encodeURIComponent(String(value))
})

// {{join arr separator}} — join array elements
hbs.registerHelper("join", (value: unknown, separator: unknown) => {
  if (isOptionsHash(value)) return ""
  if (!Array.isArray(value)) return String(value ?? "")
  const sep = !isOptionsHash(separator) && typeof separator === "string"
    ? separator : ","
  return value.map(String).join(sep)
})

// {{first arr}} — first element of an array
hbs.registerHelper("first", (arr: unknown) => {
  if (isOptionsHash(arr) || !Array.isArray(arr) || arr.length === 0) return ""
  return arr[0]
})

// {{last arr}} — last element of an array
hbs.registerHelper("last", (arr: unknown) => {
  if (isOptionsHash(arr) || !Array.isArray(arr) || arr.length === 0) return ""
  return arr[arr.length - 1]
})

// {{includes arr value}} — check if array includes a value
hbs.registerHelper("includes", (arr: unknown, value: unknown) => {
  if (isOptionsHash(arr) || !Array.isArray(arr)) return false
  return arr.includes(value)
})

// {{coalesce a b ...}} — return first non-null/empty value
hbs.registerHelper("coalesce", (...args: unknown[]) => {
  const values = args.filter((a) => !isOptionsHash(a))
  for (const v of values) {
    if (v !== null && v !== undefined && v !== "") return v
  }
  return ""
})

// {{and a b}} — logical AND
hbs.registerHelper("and", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return !!a
  return !!a && !!b
})

// {{or a b}} — logical OR
hbs.registerHelper("or", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return !!a
  return !!a || !!b
})

// {{add a b}} — addition
hbs.registerHelper("add", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return Number(a)
  return Number(a) + Number(b)
})

// {{subtract a b}} — subtraction
hbs.registerHelper("subtract", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return Number(a)
  return Number(a) - Number(b)
})

// {{multiply a b}} — multiplication
hbs.registerHelper("multiply", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return 0
  return Number(a) * Number(b)
})

// {{divide a b}} — division (safe: returns 0 on divide-by-zero)
hbs.registerHelper("divide", (a: unknown, b: unknown) => {
  if (isOptionsHash(b)) return 0
  const divisor = Number(b)
  return divisor === 0 ? 0 : Number(a) / divisor
})

// {{paiseToRupees amount}} — convert paise to rupees (e.g. 1000 → "10.00")
hbs.registerHelper("paiseToRupees", (amount: unknown) => {
  if (isOptionsHash(amount)) return "0"
  const num = Number(amount)
  return isNaN(num) ? "0" : (num / 100).toFixed(2)
})

// {{formatCurrency amount}} — format as Indian Rupees
hbs.registerHelper("formatCurrency", (amount: unknown) => {
  if (isOptionsHash(amount)) return "₹0"
  const num = Number(amount)
  if (isNaN(num)) return "₹0"
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
})

// {{formatDate value format}} — format a date
hbs.registerHelper("formatDate", (value: unknown, format: unknown) => {
  if (isOptionsHash(value) || value == null) return ""
  let date: Date
  const num = Number(value)
  if (!isNaN(num) && num > 0) {
    // > 1e10 distinguishes millisecond timestamps from second timestamps
    date = new Date(num > 1e10 ? num : num * 1000)
  } else {
    date = new Date(String(value))
  }
  if (isNaN(date.getTime())) return String(value)
  const fmt = !isOptionsHash(format) && typeof format === "string"
    ? format : "YYYY-MM-DD"
  const pad = (n: number) => String(n).padStart(2, "0")
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"]
  return fmt
    .replace("YYYY", String(date.getFullYear()))
    .replace("YY",   String(date.getFullYear()).slice(-2))
    .replace("MMM",  months[date.getMonth()])
    .replace("MM",   pad(date.getMonth() + 1))
    .replace("DD",   pad(date.getDate()))
    .replace("HH",   pad(date.getHours()))
    .replace("mm",   pad(date.getMinutes()))
    .replace("ss",   pad(date.getSeconds()))
})

// {{timestamp}} — current Unix timestamp in seconds
hbs.registerHelper("timestamp", () => Math.floor(Date.now() / 1000))

// {{isoDate}} — current date as ISO 8601 string
hbs.registerHelper("isoDate", () => new Date().toISOString())

// ─── Core resolver ────────────────────────────────────────────────────────

/**
 * Resolves Handlebars template variables in a string using execution context data.
 *
 * Supports all Handlebars features plus custom helpers:
 * - {{variable.path}}             → resolves to string value
 * - {{json variable.path}}        → resolves to JSON.stringify of the value
 * - {{default value "fallback"}}  → fallback for missing values
 * - {{uppercase str}} / {{lowercase str}}
 * - {{truncate str len}}
 * - {{eq a b}} / {{ne a b}} / {{gt a b}} / {{gte a b}} / {{lt a b}} / {{lte a b}}
 * - {{not value}}
 * - {{concat a b ...}}
 * - {{encodeURI str}}
 * - {{replace str search replacement}}
 * - {{length value}}
 *
 * Handles undefined/null gracefully — never outputs "undefined" or "null".
 * Uses compiled template caching for performance.
 *
 * Example:
 *   input: "Hello {{body.name}}, your score is {{output.score}}"
 *   context: { body: { name: "Mayank" }, output: { score: 95 } }
 *   output: "Hello Mayank, your score is 95"
 */
export function resolveTemplate(template: string, context: unknown): string {
  if (!template) return template

  let compiled = templateCache.get(template)
  if (!compiled) {
    if (templateCache.size >= MAX_CACHE_SIZE) {
      const firstKey = templateCache.keys().next().value
      if (firstKey !== undefined) templateCache.delete(firstKey)
    }
    // noEscape: true — templates produce raw output (used for API payloads,
    // AI prompts, webhook bodies, etc., NOT rendered as HTML)
    compiled = hbs.compile(template, { noEscape: true })
    templateCache.set(template, compiled)
  }

  const ctx =
    context !== null && context !== undefined && typeof context === "object"
      ? context
      : {}

  try {
    const result = compiled(ctx)
    if (result === undefined || result === null) return ""
    const str = String(result)
    if (str === "undefined" || str === "null") return ""
    return str
  } catch {
    return template
  }
}

/**
 * Resolves a Handlebars template and parses the result as JSON.
 * Throws with a descriptive error if the result is empty or invalid JSON.
 */
export function resolveTemplateJson<T>(
  template: string,
  context: unknown,
  fieldName: string
): T {
  const resolved = resolveTemplate(template, context)
  if (!resolved.trim()) {
    throw new Error(
      `${fieldName} is empty after template resolution. ` +
      `Please provide valid JSON.`
    )
  }
  try {
    return JSON.parse(resolved) as T
  } catch {
    throw new Error(
      `${fieldName} contains invalid JSON. ` +
      `Received: ${resolved.slice(0, 300)}`
    )
  }
}

/**
 * Resolves a Handlebars template and parses the result as JSON.
 * Returns null if the template is empty, trivial, or produces invalid JSON.
 */
export function resolveTemplateJsonOptional<T>(
  template: string,
  context: unknown
): T | null {
  if (!template?.trim()) return null
  const t = template.trim()
  if (t === "{}" || t === "[]" || t === "null") return null
  const resolved = resolveTemplate(template, context)
  const r = resolved.trim()
  if (!r || r === "{}" || r === "[]" || r === "null") return null
  try {
    return JSON.parse(r) as T
  } catch {
    return null
  }
}

/**
 * Clears the template cache. Useful for testing.
 */
export function clearTemplateCache(): void {
  templateCache.clear()
}
