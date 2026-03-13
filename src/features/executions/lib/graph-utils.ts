import type { WorkflowNode, WorkflowConnection } from "../types"

/**
 * Given a nodeId and the workflow connections, returns all downstream node IDs
 * in BFS (breadth-first) order. Does NOT include the starting node itself.
 */
export function getDownstreamNodeIds(
  startNodeId: string,
  connections: WorkflowConnection[]
): string[] {
  const visited = new Set<string>()
  const result: string[] = []
  const queue = [startNodeId]

  while (queue.length > 0) {
    const current = queue.shift()!

    const outgoing = connections.filter((c) => c.fromNodeId === current)

    for (const conn of outgoing) {
      if (!visited.has(conn.toNodeId)) {
        visited.add(conn.toNodeId)
        result.push(conn.toNodeId)
        queue.push(conn.toNodeId)
      }
    }
  }

  return result
}
