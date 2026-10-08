import { create } from 'zustand'
import { useMemo } from 'react'
import type { Cell, Config, Edge, Phase, PlacementStep, ColoringStep, Step } from '../types/simulation'
import { solvePlacement } from '../algorithms/backtracking'
import { buildConflictGraph, graphSteps } from '../algorithms/conflictGraph'
import { colorGraph } from '../algorithms/graphColoring'
import { defaultConfig } from '../data/defaultScenario'

interface Compiled {
  steps: Step[]
  cameras: Cell[]
  edges: Edge[]
  placementOk: boolean
  coloringOk: boolean
  truncated: boolean
}

export function compile(cfg: Config): Compiled {
  const p = solvePlacement(cfg)
  const steps: Step[] = [...p.steps]
  if (!p.solution) {
    return { steps, cameras: [], edges: [], placementOk: false, coloringOk: false, truncated: p.truncated }
  }
  const edges = buildConflictGraph(p.solution, cfg.interferenceRange)
  steps.push(...graphSteps(p.solution, edges))
  const c = colorGraph(p.solution.length, edges, cfg.channels)
  steps.push(...c.steps)
  return { steps, cameras: p.solution, edges, placementOk: true, coloringOk: !!c.assignments, truncated: false }
}

interface SimState {
  config: Config
  compiled: Compiled | null
  index: number // -1 = not started
  playing: boolean
  speed: number // 1..10
  setConfig: (patch: Partial<Config>) => void
  loadConfig: (cfg: Config) => void
  toggleBlocked: (c: Cell) => void
  start: () => void
  play: () => void
  pause: () => void
  next: () => void
  tick: () => void
  prev: () => void
  seek: (i: number) => void
  skipPhase: () => void
  finish: () => void
  reset: () => void
  setSpeed: (s: number) => void
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export const useSimulation = create<SimState>((set, get) => {
  const ensure = () => {
    const s = get()
    if (s.compiled) return s.compiled
    const c = compile(s.config)
    set({ compiled: c })
    return c
  }
  const invalidate = { compiled: null, index: -1, playing: false } as const
  return {
    config: defaultConfig(),
    compiled: null,
    index: -1,
    playing: false,
    speed: 6,
    setConfig: (patch) => {
      const next = { ...get().config, ...patch }
      next.rows = clamp(next.rows, 3, 12)
      next.cols = clamp(next.cols, 3, 12)
      next.cameras = clamp(next.cameras, 1, 12)
      next.channels = clamp(next.channels, 1, 8)
      next.blocked = next.blocked.filter((b) => b.row < next.rows && b.col < next.cols)
      set({ config: next, ...invalidate })
    },
    loadConfig: (cfg) => set({ config: structuredClone(cfg), ...invalidate }),
    toggleBlocked: (c) => {
      const { config } = get()
      const has = config.blocked.some((b) => b.row === c.row && b.col === c.col)
      set({
        config: {
          ...config,
          blocked: has ? config.blocked.filter((b) => !(b.row === c.row && b.col === c.col)) : [...config.blocked, c],
        },
        ...invalidate,
      })
    },
    start: () => {
      const c = ensure()
      set({ index: c.steps.length ? 0 : -1, playing: true })
    },
    play: () => {
      const c = ensure()
      const { index } = get()
      if (index >= c.steps.length - 1) set({ index: 0, playing: true })
      else set({ index: Math.max(index, 0), playing: true })
    },
    pause: () => set({ playing: false }),
    next: () => {
      const c = ensure()
      const i = get().index
      set({ index: Math.min(i + 1, c.steps.length - 1), playing: false })
    },
    // advance one step while keeping playback running; stops at the end
    tick: () => {
      const { compiled, index } = get()
      if (!compiled) return
      if (index >= compiled.steps.length - 1) set({ playing: false })
      else set({ index: index + 1 })
    },
    prev: () => set({ index: Math.max(get().index - 1, 0), playing: false }),
    seek: (i) => {
      const c = ensure()
      set({ index: clamp(i, 0, c.steps.length - 1), playing: false })
    },
    // jump to the last step of the current phase
    skipPhase: () => {
      const c = ensure()
      const { index } = get()
      const cur = c.steps[Math.max(index, 0)].phase
      let j = Math.max(index, 0)
      while (j + 1 < c.steps.length && c.steps[j + 1].phase === cur) j++
      set({ index: j, playing: false })
    },
    finish: () => {
      const c = ensure()
      set({ index: c.steps.length - 1, playing: false })
    },
    reset: () => set({ index: -1, playing: false }),
    setSpeed: (speed) => set({ speed }),
  }
})

export const stepDelay = (speed: number) => Math.round(1000 / Math.pow(speed, 1.45))

export interface View {
  started: boolean
  step: Step | null
  phase: Phase | 'idle'
  /** cameras shown on the grid (partial while placing) */
  cameras: Cell[]
  edges: Edge[]
  assignments: (number | null)[]
  placement: PlacementStep | null
  coloring: ColoringStep | null
  finished: boolean
  progress: number
  total: number
}

export function useView(): View {
  const compiled = useSimulation((s) => s.compiled)
  const index = useSimulation((s) => s.index)
  return useMemo(() => deriveView(compiled, index), [compiled, index])
}

export function deriveView(compiled: Compiled | null, index: number): View {
  const total = compiled?.steps.length ?? 0
  if (!compiled || index < 0 || !total) {
    return { started: false, step: null, phase: 'idle', cameras: [], edges: [], assignments: [], placement: null, coloring: null, finished: false, progress: 0, total }
  }
  const step = compiled.steps[index]
  let cameras: Cell[] = []
  let edges: Edge[] = []
  let assignments: (number | null)[] = []
  let placement: PlacementStep | null = null
  let coloring: ColoringStep | null = null
  if (step.phase === 'placement') {
    placement = step
    cameras = step.cameras
  } else {
    cameras = compiled.cameras
    if (step.phase === 'graph') edges = step.edges
    else {
      edges = compiled.edges
      coloring = step
      assignments = step.assignments
    }
  }
  const last = index === total - 1
  const phase: Phase = last && step.phase === 'coloring' ? 'done' : step.phase
  return { started: true, step, phase, cameras, edges, assignments, placement, coloring, finished: last, progress: (index + 1) / total, total }
}
