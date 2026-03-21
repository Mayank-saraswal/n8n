/**
 * A single sort key definition.
 * Multiple keys = multi-column sort (primary, secondary, tertiary, etc.)
 */
export interface SortKey {
  /** Dot-notation field path. Empty string = sort primitives directly. */
  field: string

  /** Sort direction */
  direction: "asc" | "desc"

  /**
   * Value type hint for comparison.
   * "auto" = detect at runtime (recommended default)
   * "string" = force string comparison
   * "number" = force numeric comparison (parseFloat)
   * "date"   = force Date comparison (new Date())
   * "boolean" = false < true
   */
  type: "auto" | "string" | "number" | "date" | "boolean"

  /**
   * Null / undefined handling.
   * "last"  = nulls sort after non-null values (default)
   * "first" = nulls sort before non-null values
   */
  nulls: "first" | "last"

  /** Case-insensitive string comparison. Default: false */
  caseSensitive: boolean

  /**
   * Locale for string collation.
   * "" = default JS sort (UTF-16 code units)
   * "en", "hi", "ta", "te", "bn", etc. = locale-aware sort
   * Enables correct sorting of Indian language strings.
   */
  locale: string

  /**
   * Natural sort order for strings containing numbers.
   * true = "item2" sorts before "item10"
   * false = "item10" sorts before "item2" (lexicographic)
   */
  natural: boolean
}

export type SortOperation =
  | "SORT_ARRAY"   // sort array of objects or primitives by SortKeys
  | "SORT_KEYS"    // sort the keys of a plain object
  | "REVERSE"      // reverse array (no comparison needed)
  | "SHUFFLE"      // Fisher-Yates shuffle

export interface SortNodeData {
  operation?: SortOperation
  inputPath?: string
  variableName?: string
  sortKeys?: SortKey[]
  [key: string]: unknown
}

/** Default single sort key */
export const DEFAULT_SORT_KEY: SortKey = {
  field: "",
  direction: "asc",
  type: "auto",
  nulls: "last",
  caseSensitive: false,
  locale: "",
  natural: false,
}
