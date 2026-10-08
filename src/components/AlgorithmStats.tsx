import { Activity, Cpu, Undo2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useSimulation, useView } from '../store/simulationStore'
import { AnimatedNumber } from './AnimatedNumber'

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="inset p-5">
      <div className="mb-2 flex items-center gap-2 text-base text-pencil">{icon}{label}</div>
      <div className="font-display text-5xl font-semibold tabular-nums text-cocoa"><AnimatedNumber value={value} /></div>
    </div>
  )
}

const STATUS: Record<string, string> = {
  try: 'checking', reject: 'conflict', place: 'placed', backtrack: 'backtracking', solved: 'solved', fail: 'no solution',
  edge: 'linking', complete: 'graph ready', conflict: 'clash', assign: 'assigned',
}
const BAD = new Set(['reject', 'conflict', 'fail', 'backtrack'])

export function AlgorithmStats() {
  const { compiled } = useSimulation()
  const v = useView()
  const isColoring = v.phase === 'coloring' || (v.phase === 'done' && !!v.coloring)
  const stats = isColoring ? v.coloring!.stats : (v.placement?.stats ?? { tried: 0, conflicts: 0, backtracks: 0 })
  // when past placement show final placement stats
  const placementFinal = compiled?.steps.filter((s) => s.phase === 'placement').at(-1)
  const shown = v.phase === 'graph' && placementFinal?.phase === 'placement' ? placementFinal.stats : stats
  const algo = v.phase === 'idle' ? '—' : isColoring || v.phase === 'done' ? 'graph coloring' : v.phase === 'graph' ? 'graph build' : 'backtracking'
  const action = v.step && 'action' in v.step ? v.step.action : ''
  const current =
    v.phase === 'placement' && v.placement ? `C${v.placement.cameraIndex + (v.placement.action === 'place' || v.placement.action === 'solved' ? 0 : 1)}` :
    v.coloring?.vertex !== undefined ? `C${v.coloring.vertex + 1}` : '—'
  const pos = v.placement?.cell ? `(${v.placement.cell.row + 1},${v.placement.cell.col + 1})` : '—'

  return (
    <section className="panel p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="panel-title"><Activity size={20} strokeWidth={1.75} /> live algorithm state</div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="tag">algo: {algo}</span>
          <span className="tag tabular-nums">camera: {current}</span>
          {v.phase === 'placement' && <span className="tag tabular-nums">pos: {pos}</span>}
          <motion.span
            key={action}
            initial={{ scale: 1.2, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`tag font-semibold ${BAD.has(action) ? '!border-sienna !bg-marker/20 !text-sienna' : '!bg-dew'}`}
          >
            {STATUS[action] ?? 'idle'}
          </motion.span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={<Cpu size={16} strokeWidth={1.75} />} label={isColoring ? 'Channels tried' : 'Positions tried'} value={shown.tried} />
        <Stat icon={<Zap size={16} strokeWidth={1.75} />} label="Conflicts" value={shown.conflicts} />
        <Stat icon={<Undo2 size={16} strokeWidth={1.75} />} label="Backtracks" value={shown.backtracks} />
      </div>
      <p className="hand mt-4 text-xl">counters follow the active algorithm — both are summed up in the results.</p>
    </section>
  )
}
