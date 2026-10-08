import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'
import { CameraCell, type CellMark } from './CameraCell'
import { channelColor } from './palette'

const LEGEND = [
  ['border-ink border-dashed bg-dew', 'candidate'],
  ['border-sienna bg-marker/25', 'conflict'],
  ['border-ink bg-marker/40', 'backtracked'],
  ['border-ink bg-[#b9d9a3]', 'placed camera'],
  ['border-ink bg-dew [background-image:repeating-linear-gradient(45deg,transparent_0_3px,rgba(23,23,23,0.2)_3px_4px)]', 'blocked'],
]

export function BuildingGrid() {
  const { config, toggleBlocked } = useSimulation()
  const v = useView()
  const { rows, cols } = config
  const editable = !v.started

  const cellAt = (r: number, c: number) => v.cameras.findIndex((p) => p.row === r && p.col === c)
  const pl = v.placement
  const activeVertex = v.coloring?.vertex ?? -1

  return (
    <section className="panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="panel-title">
          <Building2 size={20} strokeWidth={1.75} /> building floor plan
          <span className="tag">{rows}×{cols}</span>
        </div>
        {editable && <span className="hand text-xl">click a cell to block it ↓</span>}
      </div>

      <div className="relative mx-auto w-full" style={{ maxWidth: `${Math.min(620, cols * 76)}px` }}>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: rows * cols }, (_, i) => {
            const r = Math.floor(i / cols)
            const c = i % cols
            const blocked = config.blocked.some((b) => b.row === r && b.col === c)
            const cam = cellAt(r, c)
            let mark: CellMark = 'none'
            if (pl?.cell && pl.cell.row === r && pl.cell.col === c) {
              mark = pl.action === 'try' ? 'try' : pl.action === 'reject' ? 'reject' : pl.action === 'backtrack' ? 'backtrack' : 'none'
            }
            if (pl?.action === 'reject' && pl.against && pl.against.row === r && pl.against.col === c) mark = 'against'
            return (
              <CameraCell
                key={i}
                blocked={blocked}
                camera={cam >= 0 ? cam : null}
                channel={cam >= 0 ? (v.assignments[cam] ?? null) : null}
                mark={mark}
                active={cam >= 0 && cam === activeVertex}
                ringCells={config.interferenceRange}
                editable={editable}
                onClick={() => toggleBlocked({ row: r, col: c })}
              />
            )
          })}
        </div>

        {/* conflict edges drawn over the floor plan */}
        <svg
          className="pointer-events-none absolute inset-0 z-30 h-full w-full"
          viewBox={`0 0 ${cols} ${rows}`}
          preserveAspectRatio="none"
        >
          {v.edges.map((e) => {
            const a = v.cameras[e.a]
            const b = v.cameras[e.b]
            if (!a || !b) return null
            const clash = v.coloring?.action === 'conflict' &&
              ((v.coloring.vertex === e.a && v.coloring.against === e.b) || (v.coloring.vertex === e.b && v.coloring.against === e.a))
            const ca = v.assignments[e.a]
            const cb = v.assignments[e.b]
            return (
              <motion.line
                key={`${e.a}-${e.b}`}
                x1={a.col + 0.5} y1={a.row + 0.5} x2={b.col + 0.5} y2={b.row + 0.5}
                stroke={clash ? '#ff6f1e' : '#171717'}
                strokeWidth={clash ? 0.09 : 0.04}
                strokeDasharray={ca && cb && !clash ? undefined : '0.18 0.14'}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: clash ? 1 : 0.7 }}
                transition={{ duration: 0.5 }}
              />
            )
          })}
        </svg>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t-[1.5px] border-ink pt-4 text-sm text-pencil">
        {LEGEND.map(([cls, label]) => (
          <span key={label} className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded border-[1.5px] ${cls}`} /> {label}
          </span>
        ))}
        {v.assignments.some(Boolean) && (
          <span className="flex items-center gap-2">
            {Array.from({ length: config.channels }, (_, i) => (
              <span key={i} className="h-4 w-4 rounded-full border-[1.5px] border-ink" style={{ background: channelColor(i + 1) }} title={`Channel ${i + 1}`} />
            ))}
            channels
          </span>
        )}
      </div>
    </section>
  )
}
