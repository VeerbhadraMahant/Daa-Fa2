export interface Cell {
  row: number
  col: number
}

export interface Config {
  rows: number
  cols: number
  cameras: number
  channels: number
  /** Euclidean distance (in cells) at or below which two cameras interfere. */
  interferenceRange: number
  /** Minimum Chebyshev distance between any two cameras (1 = may touch). */
  minSeparation: number
  uniqueRows: boolean
  uniqueCols: boolean
  uniqueDiagonals: boolean
  blocked: Cell[]
}

export type Phase = 'placement' | 'graph' | 'coloring' | 'done'

export interface Stats {
  tried: number
  conflicts: number
  backtracks: number
}

export type RejectReason = 'blocked' | 'row' | 'col' | 'diagonal' | 'separation'

export interface PlacementStep {
  phase: 'placement'
  action: 'try' | 'reject' | 'place' | 'backtrack' | 'solved' | 'fail'
  cell?: Cell
  reason?: RejectReason
  /** Camera that conflicts with the candidate, when applicable. */
  against?: Cell
  cameraIndex: number
  cameras: Cell[]
  stats: Stats
  message: string
}

export interface Edge {
  a: number
  b: number
  distance: number
}

export interface GraphStep {
  phase: 'graph'
  action: 'edge' | 'complete'
  edge?: Edge
  edges: Edge[]
  cameras: Cell[]
  message: string
}

export interface ColoringStats {
  tried: number
  conflicts: number
  backtracks: number
}

export interface ColoringStep {
  phase: 'coloring'
  action: 'try' | 'conflict' | 'assign' | 'backtrack' | 'solved' | 'fail'
  vertex?: number
  channel?: number
  against?: number
  assignments: (number | null)[]
  stats: ColoringStats
  message: string
}

export type Step = PlacementStep | GraphStep | ColoringStep
