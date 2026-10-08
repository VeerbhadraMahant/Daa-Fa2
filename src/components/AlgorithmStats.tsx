import { Activity, Cpu, Radio, Undo2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useSimulation, useView } from '../store/simulationStore'
import { AnimatedNumber } from './AnimatedNumber'

function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
      <div className={`mb-1 flex items-center gap-1.5 text-[11px] ${tone}`}>{icon}{label}</div>
      <div className="font-mono text-2xl font-bold tabular-nums"><AnimatedNumber value={value} /></div>
    </div>
  )
}

const STATUS: Record<string, string> = {
  try: 'CHECKING', reject: 'CONFLICT', place: 'PLACED', backtrack: 'BACKTRACKING', solved: 'SOLVED', fail: 'NO SOLUTION',
  edge: 'LINKING', complete: 'GRAPH READY', conflict: 'CLASH', assign: 'ASSIGNED',
}

export function AlgorithmStats() {
  const { compiled } = useSimulation()
  const v = useView()
  const isColoring = v.phase === 'coloring' || (v.phase === 'done' && !!v.coloring)
  const stats = isColoring ? v.coloring!.stats : (v.placement?.stats ?? { tried: 0, conflicts: 0, backtracks: 0 })
  // when past placement show final placement stats
  const placementFinal = compiled?.steps.filter((s) => s.phase === 'placement').at(-1)
  const shown = v.phase === 'graph' && placementFinal?.phase === 'placement' ? placementFinal.stats : stats
  const algo = v.phase === 'idle' ? '—' : isColoring || v.phase === 'done' ? 'GRAPH COLORING' : v.phase === 'graph' ? 'GRAPH BUILD' : 'BACKTRACKING'
  const action = v.step && 'action' in v.step ? v.step.action : ''
  const current =
    v.phase === 'placement' && v.placement ? `C${v.placement.cameraIndex + (v.placement.action === 'place' || v.placement.action === 'solved' ? 0 : 1)}` :
    v.coloring?.vertex !== undefined ? `C${v.coloring.vertex + 1}` : '—'
  const pos = v.placement?.cell ? `(${v.placement.cell.row + 1},${v.placement.cell.col + 1})` : '—'

  return (
    <section className="panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold"><Activity size={16} className="text-emerald-300" /> Live algorithm state</div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="rounded bg-slate-800 px-2 py-1 text-slate-300">ALGO: {algo}</span>
          <span className="rounded bg-slate-800 px-2 py-1 text-slate-300">CAMERA: {current}</span>
          {v.phase === 'placement' && <span className="rounded bg-slate-800 px-2 py-1 text-slate-300">POS: {pos}</span>}
          <motion.span
            key={action}
            initial={{ scale: 1.3, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded px-2 py-1 font-bold ${
              action === 'reject' || action === 'conflict' || action === 'fail' ? 'bg-rose-500/20 text-rose-300'
              : action === 'backtrack' ? 'bg-amber-400/20 text-amber-300'
              : action === 'place' || action === 'assign' || action === 'solved' || action === 'complete' ? 'bg-emerald-400/20 text-emerald-300'
              : 'bg-cyan-400/20 text-cyan-300'
            }`}
          >
            {STATUS[action] ?? 'IDLE'}
          </motion.span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={<Cpu size={13} />} label={isColoring ? 'Channels tried' : 'Positions tried'} value={shown.tried} tone="text-cyan-300" />
        <Stat icon={<Zap size={13} />} label="Conflicts" value={shown.conflicts} tone="text-rose-300" />
        <Stat icon={<Undo2 size={13} />} label="Backtracks" value={shown.backtracks} tone="text-amber-300" />
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><Radio size={12} /> Counters show the active algorithm; both are summarized in the results panel.</div>
    </section>
  )
}
