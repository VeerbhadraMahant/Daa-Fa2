import type { ColoringStats, ColoringStep, Edge } from '../types/simulation'
import { adjacencyList } from './conflictGraph'

export const MAX_COLORING_STEPS = 60000

export interface ColoringResult {
  steps: ColoringStep[]
  assignments: number[] | null
  chromaticUsed: number
}

/**
 * Exact graph coloring by backtracking with m colors (channels).
 * Vertices are visited in descending-degree order (a standard heuristic that
 * fails early); channels are tried 1..m in order.
 */
export function colorGraph(n: number, edges: Edge[], channels: number): ColoringResult {
  const adj = adjacencyList(n, edges)
  const order = [...Array(n).keys()].sort((a, b) => adj[b].length - adj[a].length || a - b)
  const color: (number | null)[] = Array(n).fill(null)
  const steps: ColoringStep[] = []
  const stats: ColoringStats = { tried: 0, conflicts: 0, backtracks: 0 }
  let truncated = false

  const push = (s: Omit<ColoringStep, 'phase' | 'assignments' | 'stats'>) =>
    steps.push({ phase: 'coloring', assignments: [...color], stats: { ...stats }, ...s })

  function recurse(i: number): boolean {
    if (i === n) return true
    const v = order[i]
    for (let ch = 1; ch <= channels; ch++) {
      if (steps.length >= MAX_COLORING_STEPS) {
        truncated = true
        return false
      }
      stats.tried++
      push({ action: 'try', vertex: v, channel: ch, message: `C${v + 1}: testing channel ${ch}` })
      const clash = adj[v].find((u) => color[u] === ch)
      if (clash !== undefined) {
        stats.conflicts++
        push({
          action: 'conflict',
          vertex: v,
          channel: ch,
          against: clash,
          message: `Channel ${ch} clashes with neighbour C${clash + 1}`,
        })
        continue
      }
      color[v] = ch
      push({ action: 'assign', vertex: v, channel: ch, message: `C${v + 1} → Channel ${ch}` })
      if (recurse(i + 1)) return true
      if (truncated) return false
      color[v] = null
      stats.backtracks++
      push({
        action: 'backtrack',
        vertex: v,
        channel: ch,
        message: `Dead end — C${v + 1} releases channel ${ch}`,
      })
    }
    return false
  }

  const ok = recurse(0)
  if (ok) push({ action: 'solved', message: 'Every camera has a conflict-free channel' })
  else
    push({
      action: 'fail',
      message: truncated
        ? 'Coloring search aborted — too many steps'
        : `Not colorable with ${channels} channel${channels === 1 ? '' : 's'} — add channels or reduce interference`,
    })
  const assignments = ok ? (color as number[]) : null
  return { steps, assignments, chromaticUsed: assignments ? new Set(assignments).size : 0 }
}
