export type PostgresOperation =
  | "EXECUTE_QUERY"
  | "SELECT"
  | "SELECT_ONE"
  | "COUNT"
  | "EXISTS"
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "UPSERT"
  | "INSERT_MANY"
  | "EXECUTE_TRANSACTION"
  | "GET_TABLE_SCHEMA"
  | "LIST_TABLES"
  | "LIST_SCHEMAS"
  | "CREATE_TABLE"
  | "DROP_TABLE"
  | "EXECUTE_FUNCTION"
  | "COPY_FROM"
  | "EXECUTE_EXPLAIN"
  | "FULL_TEXT_SEARCH"
  | "JSON_PATH_QUERY"
  | "JSON_SET_FIELD"
  | "JSON_AGGREGATE"

export type WhereOperator =
  | "="    | "!="   | "<"    | "<="   | ">"    | ">="
  | "LIKE" | "ILIKE" | "NOT LIKE" | "NOT ILIKE"
  | "IN"   | "NOT IN"
  | "IS NULL" | "IS NOT NULL"
  | "BETWEEN"
  | "ANY"  | "ALL"  // for array columns

export interface WhereCondition {
  id: string
  column: string           // column name or table.column
  operator: WhereOperator
  value: string            // supports {{template}} expressions
  value2: string           // for BETWEEN
  logic: "AND" | "OR"      // how this condition joins with the previous
  castAs?: string          // optional CAST e.g. "INTEGER", "TIMESTAMP"
}

export interface OrderByClause {
  column: string
  direction: "ASC" | "DESC"
  nullsLast: boolean
}

export interface JoinClause {
  type: "INNER" | "LEFT" | "RIGHT" | "FULL"
  table: string
  alias: string
  on: string               // raw ON condition e.g. "orders.user_id = users.id"
}

export interface ColumnDefinition {
  name: string
  type: string             // "TEXT", "INTEGER", "BIGINT", "BOOLEAN", "JSONB", etc.
  nullable: boolean
  default?: string
  primaryKey: boolean
  unique: boolean
  references?: string      // e.g. "users(id)"
}

export interface TransactionStatement {
  id: string
  query: string            // SQL with $1, $2... placeholders
  params: string           // JSON array of params (supports template)
}

export type PostgresNodeData = {
  operation?: string
  credentialId?: string
  tableName?: string
  schemaName?: string
  selectColumns?: string
  whereConditions?: string
  orderBy?: string
  limitRows?: number
  offsetRows?: number
  joins?: string
  insertData?: string
  conflictColumns?: string
  updateOnConflict?: string
  updateData?: string
  insertManyPath?: string
  insertManyColumns?: string
  query?: string
  queryParams?: string
  transactionStatements?: string
  functionName?: string
  functionArgs?: string
  searchColumn?: string
  searchQuery?: string
  searchLanguage?: string
  searchLimit?: number
  jsonColumn?: string
  jsonPath?: string
  jsonSetColumn?: string
  jsonSetPath?: string
  jsonSetValue?: string
  columnDefinitions?: string
  createTableIfNotExists?: boolean
  variableName?: string
  returnData?: boolean
  continueOnFail?: boolean
} & Record<string, unknown>

export const OPERATION_LABELS: Record<PostgresOperation, string> = {
  EXECUTE_QUERY:         "Execute Query (Raw SQL)",
  SELECT:                "Select Rows",
  SELECT_ONE:            "Select One Row",
  COUNT:                 "Count Rows",
  EXISTS:                "Check Exists",
  INSERT:                "Insert Row",
  UPDATE:                "Update Rows",
  DELETE:                "Delete Rows",
  UPSERT:                "Upsert (Insert or Update)",
  INSERT_MANY:           "Insert Many (Bulk)",
  EXECUTE_TRANSACTION:   "Execute Transaction",
  GET_TABLE_SCHEMA:      "Get Table Schema",
  LIST_TABLES:           "List Tables",
  LIST_SCHEMAS:          "List Schemas",
  CREATE_TABLE:          "Create Table",
  DROP_TABLE:            "Drop Table",
  EXECUTE_FUNCTION:      "Execute Function / Procedure",
  COPY_FROM:             "Bulk Copy From (COPY)",
  EXECUTE_EXPLAIN:       "Explain Query (EXPLAIN ANALYZE)",
  FULL_TEXT_SEARCH:      "Full Text Search",
  JSON_PATH_QUERY:       "JSON Path Query (JSONB)",
  JSON_SET_FIELD:        "JSON Set Field (JSONB Update)",
  JSON_AGGREGATE:        "JSON Aggregate",
}

// Operations that need tableName
export const TABLE_OPS: PostgresOperation[] = [
  "SELECT", "SELECT_ONE", "COUNT", "EXISTS", "INSERT", "UPDATE",
  "DELETE", "UPSERT", "INSERT_MANY", "GET_TABLE_SCHEMA",
  "FULL_TEXT_SEARCH", "JSON_PATH_QUERY", "JSON_SET_FIELD",
  "JSON_AGGREGATE", "DROP_TABLE",
]

// Operations that need WHERE conditions builder
export const WHERE_OPS: PostgresOperation[] = [
  "SELECT", "SELECT_ONE", "COUNT", "EXISTS", "UPDATE", "DELETE",
  "UPSERT", "JSON_PATH_QUERY", "JSON_SET_FIELD",
]
