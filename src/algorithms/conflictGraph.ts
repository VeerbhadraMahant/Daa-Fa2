import type { Cell, Edge, GraphStep } from '../types/simulation'

export const distance = (a: Cell, b: Cell) => Math.hypot(a.row - b.row, a.col - b.col)

/** Pairwise O(V^2) check: edge iff Euclidean distance <= range. */
export function buildConflictGraph(cameras: Cell[], range: number): Edge[] {
  const edges: Edge[] = []
  for (let a = 0; a < cameras.length; a++)
    for (let b = a + 1; b < cameras.length; b++) {
      const d = distance(cameras[a], cameras[b])
      if (d <= range + 1e-9) edges.push({ a, b, distance: d })
    }
  return edges
}

export function adjacencyList(n: number, edges: Edge[]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const e of edges) {
    adj[e.a].push(e.b)
    adj[e.b].push(e.a)
  }
  return adj
}

/** One step per discovered edge, so the graph can be "drawn" progressively. */
export function graphSteps(cameras: Cell[], edges: Edge[]): GraphStep[] {
  const steps: GraphStep[] = edges.map((edge, i) => ({
    phase: 'graph',
    action: 'edge',
    edge,
    edges: edges.slice(0, i + 1),
    cameras,
    message: `Edge C${edge.a + 1}—C${edge.b + 1}: distance ${edge.distance.toFixed(2)} within range`,
  }))
  steps.push({
    phase: 'graph',
    action: 'complete',
    edges,
    cameras,
    message: `Conflict graph ready: ${cameras.length} vertices, ${edges.length} edges`,
  })
  return steps
}
