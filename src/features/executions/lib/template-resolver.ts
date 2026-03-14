import Handlebars from "handlebars"

// ─── Constants ────────────────────────────────────────────────────────────
const MAX_CACHE_SIZE = 500
const DEFAULT_TRUNCATE_LENGTH = 100

// ─── Template cache for performance ───────────────────────────────────────
const templateCache = new Map<string, HandlebarsTemplateDelegate>()

// ─── Create an isolated Handlebars instance ───────────────────────────────
const hbs = Handlebars.create()

// ─── Register custom helpers ──────────────────────────────────────────────

// {{json value}} — pretty-print any value as JSON
hbs.registerHelper("json", (context: unknown) => {
  const jsonString = JSON.stringify(context, null, 2)
  return new hbs.SafeString(jsonString)
})

// {{eq a b}} — equality check
hbs.registerHelper("eq", (a: unknown, b: unknown) => a === b)

// {{ne a b}} — inequality check
hbs.registerHelper("ne", (a: unknown, b: unknown) => a !== b)

// {{default value fallback}} — fallback for missing values
hbs.registerHelper(
  "default",
  (value: unknown, fallback: unknown) =>
    value != null && value !== "" ? value : fallback,
)

// {{uppercase str}}
hbs.registerHelper("uppercase", (str: unknown) =>
  typeof str === "string" ? str.toUpperCase() : str,
)

// {{lowercase str}}
hbs.registerHelper("lowercase", (str: unknown) =>
  typeof str === "string" ? str.toLowerCase() : str,
)

// {{truncate str len}}
hbs.registerHelper("truncate", (str: unknown, len: unknown) => {
  if (typeof str !== "string") return str
  const max = typeof len === "number" ? len : DEFAULT_TRUNCATE_LENGTH
  return str.length > max ? str.slice(0, max) + "…" : str
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
 * - {{eq a b}} / {{ne a b}}
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
