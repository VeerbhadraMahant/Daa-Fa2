import { AnimatePresence, motion } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'

const TONE: Record<string, string> = {
  reject: 'text-rose-300', conflict: 'text-rose-300', fail: 'text-rose-300',
  backtrack: 'text-amber-300',
  place: 'text-emerald-300', assign: 'text-emerald-300', solved: 'text-emerald-300', complete: 'text-emerald-300',
}

export function StepLog() {
  const { compiled, index } = useSimulation()
  const v = useView()
  const recent = compiled ? compiled.steps.slice(Math.max(0, index - 6), index + 1).map((s, i, a) => ({ s, key: index - (a.length - 1 - i) })) : []
  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Terminal size={16} className="text-cyan-300" /> Narration</div>
      <div className="h-[168px] space-y-1 overflow-hidden font-mono text-xs">
        {!v.started && <div className="text-slate-500">Press <b>Start simulation</b> — every decision the algorithm makes will be narrated here.</div>}
        <AnimatePresence initial={false}>
          {recent.map(({ s, key }, i) => (
            <motion.div
              key={key}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: i === recent.length - 1 ? 1 : 0.35 + (i / recent.length) * 0.4, x: 0 }}
              exit={{ opacity: 0 }}
              className={`truncate rounded px-2 py-1 ${i === recent.length - 1 ? 'bg-slate-800/80' : ''} ${TONE[(s as { action: string }).action] ?? 'text-slate-300'}`}
            >
              <span className="mr-2 text-slate-600">{String(key + 1).padStart(4, '0')}</span>{s.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
