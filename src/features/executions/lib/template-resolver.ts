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
      templateCache.clear()
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

  return compiled(ctx)
}

/**
 * Clears the template cache. Useful for testing.
 */
export function clearTemplateCache(): void {
  templateCache.clear()
}
