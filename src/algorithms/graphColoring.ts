import type { ColoringStats, ColoringStep, Edge } from '../types/simulation'
import { adjacencyList } from './conflictGraph'

/** Replay-log cap (the search continues unrecorded) and the hard search budget. */
export const MAX_COLORING_STEPS = 60000
export const MAX_COLORING_NODES = 5_000_000

export interface ColoringResult {
  steps: ColoringStep[]
  assignments: number[] | null
  chromaticUsed: number
  truncated: boolean
  skipped: number
}

/**
 * Exact graph coloring by backtracking with m colors (channels).
 * Vertices are visited in descending-degree order (a standard heuristic that
 * fails early); channels are tried 1..m in order, but never above (highest channel
 * used so far + 1): channels are interchangeable, so skipping the rest removes
 * m!-fold symmetric duplicates and lets impossible instances fail fast.
 */
export function colorGraph(n: number, edges: Edge[], channels: number): ColoringResult {
  const adj = adjacencyList(n, edges)
  const order = [...Array(n).keys()].sort((a, b) => adj[b].length - adj[a].length || a - b)
  const color: (number | null)[] = Array(n).fill(null)
  const steps: ColoringStep[] = []
  const stats: ColoringStats = { tried: 0, conflicts: 0, backtracks: 0 }
  let truncated = false
  let logging = true
  let skipped = 0

  const push = (s: Omit<ColoringStep, 'phase' | 'assignments' | 'stats'>) =>
    steps.push({ phase: 'coloring', assignments: [...color], stats: { ...stats }, ...s })
  const log = (s: Omit<ColoringStep, 'phase' | 'assignments' | 'stats'>) => {
    push(s)
    if (steps.length >= MAX_COLORING_STEPS) {
      logging = false
      push({ action: 'skip', message: 'Replay log full — the search continues without recording every step (fast-forward)' })
    }
  }

  function recurse(i: number, used: number): boolean {
    if (i === n) return true
    const v = order[i]
    for (let ch = 1; ch <= Math.min(channels, used + 1); ch++) {
      if (stats.tried >= MAX_COLORING_NODES) {
        truncated = true
        return false
      }
      stats.tried++
      if (logging) log({ action: 'try', vertex: v, channel: ch, message: `C${v + 1}: testing channel ${ch}` })
      else skipped++
      const clash = adj[v].find((u) => color[u] === ch)
      if (clash !== undefined) {
        stats.conflicts++
        if (logging)
          log({
            action: 'conflict',
            vertex: v,
            channel: ch,
            against: clash,
            message: `Channel ${ch} clashes with neighbour C${clash + 1}`,
          })
        else skipped++
        continue
      }
      color[v] = ch
      if (logging) log({ action: 'assign', vertex: v, channel: ch, message: `C${v + 1} → Channel ${ch}` })
      else skipped++
      if (recurse(i + 1, Math.max(used, ch))) return true
      if (truncated) return false
      color[v] = null
      stats.backtracks++
      if (logging)
        log({
          action: 'backtrack',
          vertex: v,
          channel: ch,
          message: `Dead end — C${v + 1} releases channel ${ch}`,
        })
      else skipped++
    }
    return false
  }

  const ok = recurse(0, 0)
  if (ok) push({ action: 'solved', message: 'Every camera has a conflict-free channel' })
  else
    push({
      action: 'fail',
      message: truncated
        ? 'Coloring search aborted — too many candidate channels examined'
        : `Not colorable with ${channels} channel${channels === 1 ? '' : 's'} — add channels or reduce interference`,
    })
  const assignments = ok ? (color as number[]) : null
  return { steps, assignments, chromaticUsed: assignments ? new Set(assignments).size : 0, truncated, skipped }
}
