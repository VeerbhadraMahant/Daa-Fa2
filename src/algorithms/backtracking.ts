import type { Cell, Config, PlacementStep, RejectReason, Stats } from '../types/simulation'

/** Hard cap so a no-solution scenario cannot freeze the browser. */
export const MAX_PLACEMENT_STEPS = 60000

export interface Violation {
  reason: RejectReason
  against?: Cell
}

/**
 * Placement constraint set (documented in README):
 *  1. the cell must not be blocked
 *  2. no two cameras share a row   (if cfg.uniqueRows)
 *  3. no two cameras share a column (if cfg.uniqueCols)
 *  4. no two cameras share a diagonal (if cfg.uniqueDiagonals)
 *  5. Chebyshev distance between any two cameras >= cfg.minSeparation
 * Duplicate cells are impossible because candidates are strictly increasing in row-major order.
 */
export function checkPlacement(cfg: Config, placed: Cell[], c: Cell): Violation | null {
  if (cfg.blocked.some((b) => b.row === c.row && b.col === c.col)) return { reason: 'blocked' }
  for (const p of placed) {
    if (cfg.uniqueRows && p.row === c.row) return { reason: 'row', against: p }
    if (cfg.uniqueCols && p.col === c.col) return { reason: 'col', against: p }
    if (cfg.uniqueDiagonals && Math.abs(p.row - c.row) === Math.abs(p.col - c.col)) return { reason: 'diagonal', against: p }
    if (Math.max(Math.abs(p.row - c.row), Math.abs(p.col - c.col)) < cfg.minSeparation)
      return { reason: 'separation', against: p }
  }
  return null
}

const REASON_TEXT: Record<RejectReason, string> = {
  blocked: 'cell is blocked',
  row: 'row already has a camera',
  col: 'column already has a camera',
  diagonal: 'diagonal already has a camera',
  separation: 'too close to another camera',
}

export interface PlacementResult {
  steps: PlacementStep[]
  solution: Cell[] | null
  truncated: boolean
}

/**
 * Recursive backtracking. Camera k is tried on every cell strictly after camera k-1
 * in row-major order (avoids exploring permutations of the same set).
 * Every decision is recorded as a step so the UI can replay it.
 */
export function solvePlacement(cfg: Config): PlacementResult {
  const steps: PlacementStep[] = []
  const placed: Cell[] = []
  const stats: Stats = { tried: 0, conflicts: 0, backtracks: 0 }
  let truncated = false

  const push = (s: Omit<PlacementStep, 'phase' | 'cameras' | 'stats' | 'cameraIndex'>) => {
    steps.push({
      phase: 'placement',
      cameraIndex: placed.length,
      cameras: placed.map((p) => ({ ...p })),
      stats: { ...stats },
      ...s,
    })
  }

  const total = cfg.rows * cfg.cols

  function recurse(start: number): boolean {
    if (placed.length === cfg.cameras) return true
    const remaining = cfg.cameras - placed.length
    // prune: not enough cells left
    for (let idx = start; total - idx >= remaining; idx++) {
      if (steps.length >= MAX_PLACEMENT_STEPS) {
        truncated = true
        return false
      }
      const cell = { row: Math.floor(idx / cfg.cols), col: idx % cfg.cols }
      const k = placed.length + 1
      stats.tried++
      push({ action: 'try', cell, message: `C${k}: trying (${cell.row + 1},${cell.col + 1})` })
      const v = checkPlacement(cfg, placed, cell)
      if (v) {
        stats.conflicts++
        push({
          action: 'reject',
          cell,
          reason: v.reason,
          against: v.against,
          message: `Conflict at (${cell.row + 1},${cell.col + 1}): ${REASON_TEXT[v.reason]}`,
        })
        continue
      }
      placed.push(cell)
      push({ action: 'place', cell, message: `C${k} placed at (${cell.row + 1},${cell.col + 1})` })
      if (recurse(idx + 1)) return true
      if (truncated) return false
      placed.pop()
      stats.backtracks++
      push({
        action: 'backtrack',
        cell,
        message: `Dead end — removing C${k} from (${cell.row + 1},${cell.col + 1}) and backtracking`,
      })
    }
    return false
  }

  const ok = recurse(0)
  if (ok) {
    push({ action: 'solved', message: `All ${cfg.cameras} cameras placed` })
  } else {
    push({
      action: 'fail',
      message: truncated
        ? `Search aborted after ${MAX_PLACEMENT_STEPS} steps — scenario too hard`
        : 'No valid placement exists for this configuration',
    })
  }
  return { steps, solution: ok ? placed.map((p) => ({ ...p })) : null, truncated }
}
