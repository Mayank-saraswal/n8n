import type { WhereCondition, OrderByClause, JoinClause, ColumnDefinition } from "./types"

export interface BuiltQuery {
  sql: string
  params: unknown[]
}

function quote(identifier: string): string {
  if (identifier.includes(".")) {
    return identifier.split(".").map(p => `"${p.replace(/"/g, '""')}"`).join(".")
  }
  return `"${identifier.replace(/"/g, '""')}"`
}

function buildWhereClause(conditions: WhereCondition[], startIndex: number = 1): { text: string, params: unknown[], nextIndex: number } {
  if (!conditions || conditions.length === 0) {
    return { text: "", params: [], nextIndex: startIndex }
  }

  const parts: string[] = []
  const params: unknown[] = []
  let nextIndex = startIndex

  conditions.forEach((cond, index) => {
    const col = cond.castAs ? `CAST(${quote(cond.column)} AS ${cond.castAs})` : quote(cond.column)
    let op = cond.operator
    let part = ""

    if (op === "IS NULL" || op === "IS NOT NULL") {
      part = `${col} ${op}`
    } else if (op === "IN" || op === "NOT IN") {
      // IN arrays are expected to be an array in JS, PostgreSQL supports ANY
      part = `${col} ${op === "IN" ? "=" : "!="} ANY($${nextIndex}::text[])`
      let valArray: unknown[] = Array.isArray(cond.value) ? cond.value : []
      if (typeof cond.value === "string") {
        try {
          const parsed = JSON.parse(cond.value)
          valArray = Array.isArray(parsed) ? parsed : [cond.value]
        } catch {
          valArray = cond.value.split(",").map(s => s.trim())
        }
      }
      params.push(valArray)
      nextIndex++
    } else if (op === "BETWEEN") {
      part = `${col} >= $${nextIndex} AND ${col} <= $${nextIndex + 1}`
      params.push(cond.value, cond.value2)
      nextIndex += 2
    } else {
      part = `${col} ${op} $${nextIndex}`
      params.push(cond.value)
      nextIndex++
    }

    if (index > 0) {
      parts.push(`${cond.logic} ${part}`)
    } else {
      parts.push(part)
    }
  })

  return { text: "WHERE " + parts.join(" "), params, nextIndex }
}

function buildJoinClause(joins: JoinClause[]): string {
  if (!joins || joins.length === 0) return ""
  return joins.map(j => {
    if (!/^[a-zA-Z0-9_.\s="'<>=!()-]+$/.test(j.on)) {
      throw new Error(`Invalid characters in JOIN ON clause: ${j.on}`)
    }
    return `${j.type} JOIN ${quote(j.table)} AS "${j.alias.replace(/"/g, '""')}" ON ${j.on}`
  }).join(" ") + " "
}

export function buildSelect(options: {
  schema: string
  table: string
  columns: string[]
  where: WhereCondition[]
  orderBy: OrderByClause[]
  limit: number
  offset: number
  joins: JoinClause[]
}): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  const colList = (!options.columns || options.columns.length === 0) ? "*" : options.columns.map(quote).join(", ")
  
  let sql = `SELECT ${colList} FROM ${tableRef}`
  
  const joinsStr = buildJoinClause(options.joins)
  if (joinsStr) sql += ` ${joinsStr.trim()}`

  const { text: whereText, params: whereParams, nextIndex } = buildWhereClause(options.where, 1)
  if (whereText) sql += ` ${whereText}`

  if (options.orderBy && options.orderBy.length > 0) {
    const orderParts = options.orderBy.map(ob => {
      const dir = ob.direction === "DESC" ? "DESC" : "ASC"
      const nulls = ob.nullsLast ? "NULLS LAST" : ""
      return `${quote(ob.column)} ${dir} ${nulls}`.trim()
    })
    sql += ` ORDER BY ${orderParts.join(", ")}`
  }

  let finalParams = [...whereParams]
  let idx = nextIndex

  if (options.limit > 0) {
    sql += ` LIMIT $${idx++}`
    finalParams.push(options.limit)
  }

  if (options.offset > 0) {
    sql += ` OFFSET $${idx++}`
    finalParams.push(options.offset)
  }

  return { sql, params: finalParams }
}

export function buildCount(options: { schema: string; table: string; where: WhereCondition[]; joins: JoinClause[] }): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  let sql = `SELECT COUNT(*) FROM ${tableRef}`
  
  const joinsStr = buildJoinClause(options.joins)
  if (joinsStr) sql += ` ${joinsStr.trim()}`

  const { text: whereText, params } = buildWhereClause(options.where)
  if (whereText) sql += ` ${whereText}`

  return { sql, params }
}

export function buildExists(options: { schema: string; table: string; where: WhereCondition[] }): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  let innerSql = `SELECT 1 FROM ${tableRef}`
  const { text: whereText, params } = buildWhereClause(options.where)
  if (whereText) innerSql += ` ${whereText}`

  const sql = `SELECT EXISTS(${innerSql}) AS "exists"`
  return { sql, params }
}

export function buildInsert(options: { schema: string; table: string; data: Record<string, unknown>; returnData: boolean }): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  const keys = Object.keys(options.data)
  const cols = keys.map(quote).join(", ")
  const vals = keys.map((_, i) => `$${i + 1}`).join(", ")
  
  let sql = `INSERT INTO ${tableRef} (${cols}) VALUES (${vals})`
  if (options.returnData) sql += " RETURNING *"

  return { sql, params: Object.values(options.data) }
}

export function buildInsertMany(options: { schema: string; table: string; rows: Record<string, unknown>[]; columns?: string[]; returnData: boolean }): BuiltQuery {
  if (options.rows.length === 0) return { sql: "", params: [] }
  
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  const columns = (options.columns && options.columns.length > 0) ? options.columns : Object.keys(options.rows[0])
  const cols = columns.map(quote).join(",")

  const params: unknown[] = []
  let paramIdx = 1
  const valuesParts: string[] = []

  for (const row of options.rows) {
    const rowVals = columns.map(c => {
      params.push(row[c] ?? null)
      return `$${paramIdx++}`
    })
    valuesParts.push(`(${rowVals.join(",")})`)
  }

  let sql = `INSERT INTO ${tableRef} (${cols}) VALUES ${valuesParts.join(",")}`
  if (options.returnData) sql += " RETURNING *"

  return { sql, params }
}

export function buildUpdate(options: { schema: string; table: string; data: Record<string, unknown>; where: WhereCondition[]; returnData: boolean; allowFullTableUpdate: boolean }): BuiltQuery {
  if ((!options.where || options.where.length === 0) && !options.allowFullTableUpdate) {
    throw new Error("UPDATE without WHERE conditions is not allowed. Set allowFullTableUpdate to true to overwrite the entire table.")
  }
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  const keys = Object.keys(options.data)
  
  let sql = `UPDATE ${tableRef} SET `
  const setParts: string[] = []
  const params: unknown[] = []
  let idx = 1

  keys.forEach(k => {
    setParts.push(`${quote(k)}=$${idx++}`)
    params.push(options.data[k])
  })
  
  sql += setParts.join(", ")

  const { text: whereText, params: whereParams } = buildWhereClause(options.where, idx)
  if (whereText) sql += ` ${whereText}`
  params.push(...whereParams)

  if (options.returnData) sql += " RETURNING *"

  return { sql, params }
}

export function buildDelete(options: { schema: string; table: string; where: WhereCondition[]; returnData: boolean }): BuiltQuery {
  if (!options.where || options.where.length === 0) {
    throw new Error("DELETE without WHERE conditions is not allowed.")
  }
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  let sql = `DELETE FROM ${tableRef}`
  
  const { text: whereText, params } = buildWhereClause(options.where)
  sql += ` ${whereText}`
  
  if (options.returnData) sql += " RETURNING *"

  return { sql, params }
}

export function buildUpsert(options: { schema: string; table: string; data: Record<string, unknown>; conflictColumns: string[]; updateColumns: string[]; returnData: boolean }): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  const keys = Object.keys(options.data)
  const cols = keys.map(quote).join(", ")
  const vals = keys.map((_, i) => `$${i + 1}`).join(", ")

  let sql = `INSERT INTO ${tableRef} (${cols}) VALUES (${vals}) ON CONFLICT (${options.conflictColumns.map(quote).join(", ")}) DO UPDATE SET `
  
  const updateCols = (options.updateColumns && options.updateColumns.length > 0) 
    ? options.updateColumns 
    : keys.filter(k => !options.conflictColumns.includes(k))

  if (updateCols.length === 0) {
    // If nothing to update, DO NOTHING
    sql = `INSERT INTO ${tableRef} (${cols}) VALUES (${vals}) ON CONFLICT (${options.conflictColumns.map(quote).join(", ")}) DO NOTHING`
  } else {
    sql += updateCols.map(c => `${quote(c)} = EXCLUDED.${quote(c)}`).join(", ")
  }

  if (options.returnData) sql += " RETURNING *"
  return { sql, params: Object.values(options.data) }
}

export function buildFullTextSearch(options: { schema: string; table: string; column: string; query: string; language: string; limit: number; returnColumns: string[] }): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  const colList = (!options.returnColumns || options.returnColumns.length === 0) ? "*" : options.returnColumns.map(quote).join(", ")
  
  const lang = options.language || "english"
  
  const sql = `SELECT ${colList}, ts_rank(to_tsvector($1, ${quote(options.column)}), plainto_tsquery($1, $2)) AS rank FROM ${tableRef} WHERE to_tsvector($1, ${quote(options.column)}) @@ plainto_tsquery($1, $2) ORDER BY rank DESC LIMIT $3`
  return { sql, params: [lang, options.query, options.limit] }
}

export function buildJsonPathQuery(options: { schema: string; table: string; column: string; jsonPath: string; where: WhereCondition[] }): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  
  // Actually, `#>>` expects text array and `@?` expects jsonpath. 
  // Let's modify to a generic form for JSONPath filtering
  // PostgreSQL jsonpath: `jsonb_path_query(col, path)` or `col @? path`
  const { text: whereText, params: whereParams, nextIndex } = buildWhereClause(options.where, 3)
  
  let sql = `SELECT *, jsonb_path_query_array(${quote(options.column)}, $1::jsonpath) AS json_value FROM ${tableRef} WHERE ${quote(options.column)} @? $1::jsonpath`
  
  if (whereText) sql += ` AND (${whereText.replace("WHERE ", "")})`

  return { sql, params: [options.jsonPath, ...whereParams] }
}

export function buildJsonSetField(options: { schema: string; table: string; column: string; path: string; value: unknown; where: WhereCondition[]; returnData: boolean }): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  
  // path is e.g. "{payment,status}". We pass as string array to jsonb_set
  // jsonb_set("col", $1::text[], to_jsonb($2::text))
  
  // Transform "{A,B}" to ["A", "B"] or let DB handle `{A,B}` format literal
  
  let pathStr = options.path
  if (pathStr.startsWith("{") && pathStr.endsWith("}")) {
    // keep format as DB can cast '{A,B}' to text[]
  } else {
    pathStr = `{${pathStr}}`
  }
  
  let sql = `UPDATE ${tableRef} SET ${quote(options.column)} = jsonb_set(${quote(options.column)}, $1::text[], to_jsonb($2::text))`
  
  const { text: whereText, params: whereParams } = buildWhereClause(options.where, 3)
  if (whereText) sql += ` ${whereText}`
  
  if (options.returnData) sql += " RETURNING *"
  
  // value must be stringified for $2::text because to_jsonb parses it
  const valStr = typeof options.value === "string" ? options.value : JSON.stringify(options.value)
  return { sql, params: [pathStr, valStr, ...whereParams] }
}

export function buildCreateTable(options: { schema: string; table: string; columns: ColumnDefinition[]; ifNotExists: boolean }): BuiltQuery {
  const tableRef = `${quote(options.schema)}.${quote(options.table)}`
  const ifNotExistsStr = options.ifNotExists ? "IF NOT EXISTS " : ""
  let sql = `CREATE TABLE ${ifNotExistsStr}${tableRef} (`
  
  const colDefs = options.columns.map(c => {
    let def = `${quote(c.name)} ${c.type}`
    if (!c.nullable) def += " NOT NULL"
    if (c.default) {
      if (!/^[a-zA-Z0-9_.'()\-+/*:\s]+$/.test(c.default)) {
        throw new Error(`Invalid characters in DEFAULT clause: ${c.default}`)
      }
      def += ` DEFAULT ${c.default}`
    }
    if (c.primaryKey) def += " PRIMARY KEY"
    if (c.unique && !c.primaryKey) def += " UNIQUE"
    if (c.references) {
      if (!/^[a-zA-Z0-9_.")(]+$/.test(c.references)) {
        throw new Error(`Invalid characters in REFERENCES clause: ${c.references}`)
      }
      def += ` REFERENCES ${c.references}`
    }
    return def
  })
  
  sql += colDefs.join(", ") + ")"
  return { sql, params: [] }
}
