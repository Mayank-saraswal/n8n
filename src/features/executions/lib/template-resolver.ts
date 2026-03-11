/**
 * Resolves template variables in a string using execution context data.
 *
 * Supports two patterns:
 * - {{variable.path}}        → resolves to string value
 * - {{json variable.path}}   → resolves to JSON.stringify of the value
 *
 * Example:
 *   input: "Hello {{body.name}}, your score is {{output.score}}"
 *   context: { body: { name: "Mayank" }, output: { score: 95 } }
 *   output: "Hello Mayank, your score is 95"
 */
export function resolveTemplate(template: string, context: unknown): string {
  if (!template || typeof context !== "object" || context === null) {
    return template
  }

  // Handle {{json variable}} — stringify entire value
  let resolved = template.replace(
    /\{\{json\s+([\w.]+)\}\}/g,
    (_, path: string) => {
      const value = resolvePath(context, path)
      return value !== undefined ? JSON.stringify(value) : ""
    }
  )

  // Handle {{variable}} — string value
  resolved = resolved.replace(
    /\{\{([\w.]+)\}\}/g,
    (_, path: string) => {
      const value = resolvePath(context, path)
      if (value === undefined || value === null) return ""
      return String(value)
    }
  )

  return resolved
}

function resolvePath(data: unknown, path: string): unknown {
  return path.split(".").reduce((current: unknown, key: string) => {
    if (current === null || current === undefined) return undefined
    if (typeof current !== "object") return undefined
    return (current as Record<string, unknown>)[key]
  }, data)
}
