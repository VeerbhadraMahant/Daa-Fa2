import type { Config } from '../types/simulation'

/** Recommended demo: 8x8 grid, 6 cameras, 3 channels. */
export const defaultConfig = (): Config => ({
  rows: 8,
  cols: 8,
  cameras: 6,
  channels: 3,
  interferenceRange: 3,
  minSeparation: 2,
  uniqueRows: true,
  uniqueCols: true,
  uniqueDiagonals: true,
  blocked: [
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
  ],
})

export interface Preset {
  name: string
  blurb: string
  config: Config
}

export const presets: Preset[] = [
  { name: 'Classroom demo', blurb: '8×8 · 6 cameras · 3 channels', config: defaultConfig() },
  {
    name: 'Heavy backtracking',
    blurb: '6×6 · 6 cameras · ~200 backtracks',
    config: { ...defaultConfig(), rows: 6, cols: 6, cameras: 6, interferenceRange: 3.5, blocked: [] },
  },
  {
    name: 'Needs more channels',
    blurb: '8×8 · 6 cameras · 2 channels · wide range',
    config: { ...defaultConfig(), channels: 2, interferenceRange: 5 },
  },
  {
    name: 'No placement exists',
    blurb: '4×4 · 5 cameras · rows+cols unique',
    config: { ...defaultConfig(), rows: 4, cols: 4, cameras: 5, blocked: [] },
  },
]
