import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'
import { CameraCell, type CellMark } from './CameraCell'
import { channelColor } from './palette'

const LEGEND = [
  ['border-cyan-300 bg-cyan-400/40', 'Candidate'],
  ['border-rose-400 bg-rose-500/40', 'Conflict'],
  ['border-amber-300 bg-amber-400/40', 'Backtracked'],
  ['border-emerald-400 bg-emerald-400/30', 'Placed camera'],
  ['border-slate-500 bg-slate-600', 'Blocked'],
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
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Building2 size={16} className="text-cyan-300" /> Building floor plan
          <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">{rows}×{cols}</span>
        </div>
        {editable && <span className="text-[11px] text-slate-400">click cells to block / unblock</span>}
      </div>

      <div className="relative mx-auto w-full" style={{ maxWidth: `${Math.min(620, cols * 76)}px` }}>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
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
                stroke={clash ? '#fb7185' : ca && cb ? '#34d399' : '#94a3b8'}
                strokeWidth={clash ? 0.07 : 0.045}
                strokeDasharray="0.18 0.14"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: clash ? 1 : 0.75 }}
                transition={{ duration: 0.5 }}
              />
            )
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
        {LEGEND.map(([cls, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded border ${cls}`} /> {label}
          </span>
        ))}
        {v.assignments.some(Boolean) && (
          <span className="flex items-center gap-1.5">
            {Array.from({ length: config.channels }, (_, i) => (
              <span key={i} className="h-3 w-3 rounded-full" style={{ background: channelColor(i + 1) }} title={`Channel ${i + 1}`} />
            ))}
            Channels
          </span>
        )}
      </div>
    </section>
  )
}
