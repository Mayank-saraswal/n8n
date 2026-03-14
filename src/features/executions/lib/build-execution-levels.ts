/**
 * Groups workflow nodes into execution levels.
 *
 * Nodes in the same level have no data dependency on each other
 * and can safely run in parallel. Levels must run sequentially
 * because later levels may depend on outputs from earlier ones.
 *
 * Algorithm: BFS-style level assignment using in-degree tracking.
 * O(N + E) time where N = nodes, E = connections.
 *
 * @param sortedNodes - Topologically sorted nodes from prepareWorkflow
 * @param connections - All workflow connections
 * @returns Array of levels, each level is an array of nodes
 *
 * @example
 * // TRIGGER → GMAIL, TRIGGER → SLACK, GMAIL → NOTION
 * // Returns: [[TRIGGER], [GMAIL, SLACK], [NOTION]]
 */
export function buildExecutionLevels<T extends { id: string }>(
  sortedNodes: T[],
  connections: Array<{ fromNodeId: string; toNodeId: string }>
): T[][] {
  if (sortedNodes.length === 0) return []

  // Build: nodeId → set of nodeIds this node depends on (its parents)
  const dependsOn = new Map<string, Set<string>>()

  for (const node of sortedNodes) {
    dependsOn.set(node.id, new Set())
  }

  // Only track connections for nodes that are in sortedNodes
  const nodeIdSet = new Set(sortedNodes.map((n) => n.id))

  for (const conn of connections) {
    if (nodeIdSet.has(conn.toNodeId) && nodeIdSet.has(conn.fromNodeId)) {
      dependsOn.get(conn.toNodeId)?.add(conn.fromNodeId)
    }
  }

  // Assign each node to its earliest possible level
  // A node's level = 1 + max(level of all its parents)
  const nodeLevels = new Map<string, number>()

  // Process in topological order (sortedNodes is already topologically sorted)
  for (const node of sortedNodes) {
    const parents = dependsOn.get(node.id) ?? new Set()
    if (parents.size === 0) {
      nodeLevels.set(node.id, 0)
    } else {
      const maxParentLevel = Math.max(
        ...[...parents].map((parentId) => nodeLevels.get(parentId) ?? 0)
      )
      nodeLevels.set(node.id, maxParentLevel + 1)
    }
  }

  // Group nodes by their assigned level
  if (nodeLevels.size === 0) return []
  const maxLevel = Math.max(...nodeLevels.values())
  const levels: T[][] = Array.from({ length: maxLevel + 1 }, () => [])

  // Preserve topological order within each level for deterministic execution
  for (const node of sortedNodes) {
    const level = nodeLevels.get(node.id) ?? 0
    levels[level].push(node)
  }

  // Remove empty levels (defensive)
  return levels.filter((level) => level.length > 0)
}

/**
 * Merges multiple context objects from parallel branch executions.
 *
 * Each parallel node outputs to a unique key (its variableName),
 * so simple spread merge is safe and correct. Later keys win on
 * conflict (which only happens if two nodes use the same variableName
 * — a user configuration error, not a platform error).
 */
export function mergeParallelResults(
  baseContext: Record<string, unknown>,
  results: Record<string, unknown>[]
): Record<string, unknown> {
  return results.reduce(
    (merged, result) => ({ ...merged, ...result }),
    { ...baseContext }
  )
}
