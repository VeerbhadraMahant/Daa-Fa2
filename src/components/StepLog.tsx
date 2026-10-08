import { AnimatePresence, motion } from 'framer-motion'
import { NotebookPen } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'

// Meaning is carried by a leading glyph as well as weight, never hue alone.
const MARK: Record<string, string> = {
  reject: '✕', conflict: '✕', fail: '✕',
  backtrack: '↩',
  place: '✓', assign: '✓', solved: '✓', complete: '✓',
}
const STRONG = new Set(['reject', 'conflict', 'fail', 'backtrack'])

export function StepLog() {
  const { compiled, index } = useSimulation()
  const v = useView()
  const recent = compiled ? compiled.steps.slice(Math.max(0, index - 6), index + 1).map((s, i, a) => ({ s, key: index - (a.length - 1 - i) })) : []
  return (
    <section className="panel p-6">
      <div className="panel-title mb-4"><NotebookPen size={20} strokeWidth={1.75} /> narration</div>
      <div className="inset h-[200px] space-y-1 overflow-hidden p-3 text-sm" aria-live="polite">
        {!v.started && <div className="text-pencil">Press <b className="text-ink">Start simulation</b> — every decision the algorithm makes will be narrated here.</div>}
        <AnimatePresence initial={false}>
          {recent.map(({ s, key }, i) => {
            const action = (s as { action: string }).action
            const last = i === recent.length - 1
            return (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: last ? 1 : 0.5 + (i / recent.length) * 0.3, x: 0 }}
                exit={{ opacity: 0 }}
                className={`truncate rounded-md px-2 py-1 ${last ? 'border border-ink bg-cream' : 'border border-transparent'} ${STRONG.has(action) ? 'font-medium text-sienna' : 'text-ink'}`}
              >
                <span className="mr-2 tabular-nums text-pencil">{String(key + 1).padStart(3, '0')}</span>
                <span className="mr-1.5" aria-hidden="true">{MARK[action] ?? '·'}</span>
                {s.message}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}
