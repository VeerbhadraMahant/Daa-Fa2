import { motion } from 'framer-motion'
import { Check, Grid3x3, Network, Palette, PartyPopper } from 'lucide-react'
import { useView } from '../store/simulationStore'

const PHASES = [
  { key: 'placement', label: 'Backtracking', sub: 'Place cameras', Icon: Grid3x3 },
  { key: 'graph', label: 'Conflict Graph', sub: 'Build interference edges', Icon: Network },
  { key: 'coloring', label: 'Graph Coloring', sub: 'Assign channels', Icon: Palette },
  { key: 'done', label: 'Final Config', sub: 'Review result', Icon: PartyPopper },
] as const

export function PhaseStepper() {
  const v = useView()
  const cur = v.phase === 'idle' ? -1 : PHASES.findIndex((p) => p.key === v.phase)
  return (
    <div className="panel p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PHASES.map((p, i) => {
          const done = i < cur || (v.phase === 'done' && i === 3)
          const active = i === cur && !done
          return (
            <motion.div
              key={p.key}
              animate={{ scale: active ? 1.02 : 1 }}
              className={`relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2 transition-colors ${
                active
                  ? 'border-cyan-400/60 bg-cyan-400/10'
                  : done
                    ? 'border-emerald-400/40 bg-emerald-400/5'
                    : 'border-slate-700/60 bg-slate-900/40'
              }`}
            >
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                  done ? 'bg-emerald-400/20 text-emerald-300' : active ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {done ? <Check size={18} /> : <p.Icon size={18} />}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.label}</div>
                <div className="truncate text-[11px] text-slate-400">{p.sub}</div>
              </div>
              {active && (
                <motion.div
                  layoutId="phase-glow"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-400"
                />
              )}
            </motion.div>
          )
        })}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400"
          animate={{ width: `${v.progress * 100}%` }}
          transition={{ ease: 'linear', duration: 0.12 }}
        />
      </div>
    </div>
  )
}
