import { motion } from 'framer-motion'
import { Check, Flag, Grid3x3, Network, Palette } from 'lucide-react'
import { useView } from '../store/simulationStore'

const PHASES = [
  { key: 'placement', label: 'backtracking', sub: 'place cameras', Icon: Grid3x3 },
  { key: 'graph', label: 'conflict graph', sub: 'build interference edges', Icon: Network },
  { key: 'coloring', label: 'graph coloring', sub: 'assign channels', Icon: Palette },
  { key: 'done', label: 'final config', sub: 'review result', Icon: Flag },
] as const

export function PhaseStepper() {
  const v = useView()
  const cur = v.phase === 'idle' ? -1 : PHASES.findIndex((p) => p.key === v.phase)
  return (
    <nav aria-label="Simulation phases" className="space-y-3">
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PHASES.map((p, i) => {
          const done = i < cur || (v.phase === 'done' && i === 3)
          const active = i === cur && !done
          return (
            <li
              key={p.key}
              aria-current={active ? 'step' : undefined}
              className={`relative flex min-h-[64px] items-center gap-3 rounded-[12px] border-[1.5px] px-4 py-3 transition-colors duration-200 ${
                active ? 'border-ink bg-dew shadow-card' : done ? 'border-ink bg-cream' : 'border-mist bg-cream'
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-[1.5px] ${
                  done ? 'border-ink bg-ink text-cream' : active ? 'border-ink bg-cream text-ink' : 'border-mist text-pencil'
                }`}
              >
                {done ? <Check size={17} aria-hidden="true" /> : <p.Icon size={17} aria-hidden="true" />}
              </span>
              <span className="min-w-0">
                <span className={`block font-display text-lg font-semibold leading-tight ${active || done ? 'text-cocoa' : 'text-pencil'}`}>
                  {active ? <span className="marker">{p.label}</span> : p.label}
                </span>
                <span className="block text-sm text-pencil">
                  {i + 1}. {p.sub}
                  <span className="sr-only"> — {done ? 'done' : active ? 'running' : 'pending'}</span>
                </span>
              </span>
            </li>
          )
        })}
      </ol>
      <div
        className="h-2 overflow-hidden rounded-full border-[1.5px] border-ink bg-cream"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v.progress * 100)}
        aria-label="Simulation progress"
      >
        <motion.div className="h-full bg-marker" animate={{ width: `${v.progress * 100}%` }} transition={{ ease: 'linear', duration: 0.12 }} />
      </div>
    </nav>
  )
}
