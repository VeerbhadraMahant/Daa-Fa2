import type { Cell, Config, PlacementStep, RejectReason, Stats } from '../types/simulation'

/** Only the first N decisions are recorded for replay; the search itself keeps going unrecorded. */
export const MAX_PLACEMENT_STEPS = 60000
/** Hard cap on candidate positions examined, so a hopeless scenario cannot freeze the browser. */
export const MAX_SEARCH_NODES = 5_000_000

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
export const blockedKeys = (cfg: Config): Set<number> => new Set(cfg.blocked.map((b) => b.row * cfg.cols + b.col))

export function checkPlacement(cfg: Config, placed: Cell[], c: Cell, blocked: Set<number> = blockedKeys(cfg)): Violation | null {
  if (blocked.has(c.row * cfg.cols + c.col)) return { reason: 'blocked' }
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
  /** true only if the search budget ran out, i.e. the answer is unknown */
  truncated: boolean
  /** decisions made after the replay log filled up (not recorded) */
  skipped: number
}

/**
 * Recursive backtracking. Camera k is tried on every cell strictly after camera k-1
 * in row-major order (avoids exploring permutations of the same set).
 *
 * Pruning: (a) not enough cells left, (b) with one-camera-per-row, not enough rows left,
 * (c) up-front pigeonhole check (more cameras than rows/columns => impossible),
 * (d) forward checking: with one-camera-per-row and no spare rows, every row below the last
 *     camera must still have at least one legal cell, otherwise this branch is dead.
 *
 * Replay log vs. search: decisions are recorded as steps for the UI only until
 * MAX_PLACEMENT_STEPS; after that the search continues unrecorded ("fast-forward"),
 * so the answer is always exact unless MAX_SEARCH_NODES is exhausted.
 */
export function solvePlacement(cfg: Config): PlacementResult {
  const steps: PlacementStep[] = []
  const placed: Cell[] = []
  const stats: Stats = { tried: 0, conflicts: 0, backtracks: 0 }
  const blocked = blockedKeys(cfg)
  let truncated = false
  let logging = true
  let skipped = 0
  // steps share one immutable snapshot until a camera is placed/removed (saves O(steps*K) memory)
  let snapshot: Cell[] = []

  const push = (s: Omit<PlacementStep, 'phase' | 'cameras' | 'stats' | 'cameraIndex'>) => {
    steps.push({
      phase: 'placement',
      cameraIndex: placed.length,
      cameras: snapshot,
      stats: { ...stats },
      ...s,
    })
  }
  // record a decision; callers count unrecorded ones in `skipped` once the log is full
  const log = (s: Parameters<typeof push>[0]) => {
    push(s)
    if (steps.length >= MAX_PLACEMENT_STEPS) {
      logging = false
      push({ action: 'skip', message: 'Replay log full — the search continues without recording every step (fast-forward)' })
    }
  }

  const total = cfg.rows * cfg.cols
  const fail = (message: string): PlacementResult => {
    push({ action: 'fail', message })
    return { steps, solution: null, truncated, skipped }
  }

  if (cfg.uniqueRows && cfg.cameras > cfg.rows)
    return fail(`Impossible: ${cfg.cameras} cameras but only ${cfg.rows} rows, and each row may hold one camera`)
  if (cfg.uniqueCols && cfg.cameras > cfg.cols)
    return fail(`Impossible: ${cfg.cameras} cameras but only ${cfg.cols} columns, and each column may hold one camera`)

  /** (d) true if some row below the last camera has no legal cell although every row is still needed */
  function starvedRow(remaining: number): boolean {
    if (!cfg.uniqueRows || placed.length === 0) return false
    const lastRow = placed[placed.length - 1].row
    if (cfg.rows - 1 - lastRow !== remaining) return false
    for (let r = lastRow + 1; r < cfg.rows; r++) {
      let any = false
      for (let c = 0; c < cfg.cols && !any; c++) any = checkPlacement(cfg, placed, { row: r, col: c }, blocked) === null
      if (!any) return true
    }
    return false
  }

  function recurse(start: number): boolean {
    if (placed.length === cfg.cameras) return true
    const remaining = cfg.cameras - placed.length
    if (starvedRow(remaining)) return false
    // last usable index: enough cells left, and (one-per-row) enough rows left below this camera
    let last = total - remaining
    if (cfg.uniqueRows) last = Math.min(last, (cfg.rows - remaining + 1) * cfg.cols - 1)
    for (let idx = start; idx <= last; idx++) {
      if (stats.tried >= MAX_SEARCH_NODES) {
        truncated = true
        return false
      }
      const cell = { row: Math.floor(idx / cfg.cols), col: idx % cfg.cols }
      const k = placed.length + 1
      stats.tried++
      if (logging) log({ action: 'try', cell, message: `C${k}: trying (${cell.row + 1},${cell.col + 1})` })
      else skipped++
      const v = checkPlacement(cfg, placed, cell, blocked)
      if (v) {
        stats.conflicts++
        if (logging)
          log({
            action: 'reject',
            cell,
            reason: v.reason,
            against: v.against,
            message: `Conflict at (${cell.row + 1},${cell.col + 1}): ${REASON_TEXT[v.reason]}`,
          })
        else skipped++
        continue
      }
      placed.push(cell)
      if (logging) {
        snapshot = placed.map((p) => ({ ...p }))
        log({ action: 'place', cell, message: `C${k} placed at (${cell.row + 1},${cell.col + 1})` })
      } else skipped++
      if (recurse(idx + 1)) return true
      if (truncated) return false
      placed.pop()
      stats.backtracks++
      if (logging) {
        snapshot = placed.map((p) => ({ ...p }))
        log({
          action: 'backtrack',
          cell,
          message: `Dead end — removing C${k} from (${cell.row + 1},${cell.col + 1}) and backtracking`,
        })
      } else skipped++
    }
    return false
  }

  const ok = recurse(0)
  snapshot = placed.map((p) => ({ ...p }))
  const ff = skipped ? ` (${skipped.toLocaleString()} decisions fast-forwarded)` : ''
  if (ok) {
    push({ action: 'solved', message: `All ${cfg.cameras} cameras placed${ff}` })
    return { steps, solution: placed.map((p) => ({ ...p })), truncated, skipped }
  }
  return fail(
    truncated
      ? `Search aborted after ${MAX_SEARCH_NODES.toLocaleString()} positions — scenario too hard`
      : `No valid placement exists for this configuration${ff}`,
  )
}
