import { describe, expect, it } from 'vitest'
import { solvePlacement, checkPlacement } from './backtracking'
import { buildConflictGraph } from './conflictGraph'
import { colorGraph } from './graphColoring'
import { defaultConfig } from '../data/defaultScenario'
import { compile } from '../store/simulationStore'

describe('backtracking', () => {
  it('solves the demo scenario with valid placements', () => {
    const cfg = defaultConfig()
    const r = solvePlacement(cfg)
    expect(r.solution).not.toBeNull()
    const s = r.solution!
    expect(s).toHaveLength(cfg.cameras)
    s.forEach((c, i) => expect(checkPlacement(cfg, s.slice(0, i), c)).toBeNull())
    expect(r.steps.at(-1)!.action).toBe('solved')
  })
  it('reports no solution when impossible', () => {
    const r = solvePlacement({ ...defaultConfig(), rows: 3, cols: 3, cameras: 4 })
    expect(r.solution).toBeNull()
    expect(r.steps.at(-1)!.action).toBe('fail')
  })
  it('respects blocked cells', () => {
    const cfg = { ...defaultConfig(), rows: 2, cols: 2, cameras: 1, blocked: [{ row: 0, col: 0 }] }
    expect(solvePlacement(cfg).solution![0]).toEqual({ row: 0, col: 1 })
  })
  it('rejects shared diagonals when enabled', () => {
    const cfg = { ...defaultConfig(), blocked: [] }
    expect(checkPlacement(cfg, [{ row: 0, col: 0 }], { row: 3, col: 3 })?.reason).toBe('diagonal')
    expect(checkPlacement({ ...cfg, uniqueDiagonals: false }, [{ row: 0, col: 0 }], { row: 3, col: 3 })).toBeNull()
  })
  it('backtracks on a tight board', () => {
    const r = solvePlacement({ ...defaultConfig(), rows: 6, cols: 6, cameras: 6 })
    expect(r.steps.some((s) => s.action === 'backtrack')).toBe(true)
  })
})

describe('graph + coloring', () => {
  it('connects only cameras within range', () => {
    const e = buildConflictGraph([{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 5, col: 5 }], 2)
    expect(e).toHaveLength(1)
  })
  it('produces a proper coloring', () => {
    const cfg = defaultConfig()
    const cams = solvePlacement(cfg).solution!
    const edges = buildConflictGraph(cams, cfg.interferenceRange)
    const r = colorGraph(cams.length, edges, cfg.channels)
    expect(r.assignments).not.toBeNull()
    edges.forEach((e) => expect(r.assignments![e.a]).not.toBe(r.assignments![e.b]))
  })
  it('fails when channels are insufficient (triangle, 2 colors)', () => {
    const edges = [{ a: 0, b: 1, distance: 1 }, { a: 1, b: 2, distance: 1 }, { a: 0, b: 2, distance: 1 }]
    const r = colorGraph(3, edges, 2)
    expect(r.assignments).toBeNull()
    expect(r.steps.at(-1)!.action).toBe('fail')
  })
  it('breaks channel symmetry: K6 with 5 channels fails fast, never trying channel > used+1', () => {
    const edges = []
    for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) edges.push({ a, b, distance: 1 })
    const r = colorGraph(6, edges, 5)
    expect(r.assignments).toBeNull()
    expect(r.truncated).toBe(false)
    expect(r.steps.length).toBeLessThan(100)
  })
})

describe('placement snapshots', () => {
  it('shares snapshots between steps without aliasing later placements', () => {
    const r = solvePlacement({ ...defaultConfig(), rows: 6, cols: 6, cameras: 6 })
    r.steps.forEach((s) => {
      if (s.phase === 'placement' && s.action === 'place') expect(s.cameras.at(-1)).toEqual(s.cell)
    })
  })
})

describe('compile', () => {
  it('precomputes final placement stats matching the last placement step', () => {
    const c = compile(defaultConfig())
    const last = c.steps.filter((s) => s.phase === 'placement').at(-1)!
    expect(last.phase === 'placement' && last.stats).toEqual(c.placementStats)
  })
})
