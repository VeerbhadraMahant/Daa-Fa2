import { motion } from 'framer-motion'
import { Palette } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'
import { channelColor } from './palette'

export function ColoringPanel() {
  const { config } = useSimulation()
  const v = useView()
  const active = v.coloring?.vertex
  return (
    <section className="panel p-6">
      <div className="panel-title mb-4"><Palette size={20} strokeWidth={1.75} /> channel assignment</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: config.channels }, (_, i) => (
          <span key={i} className="tag">
            <span className="h-3 w-3 rounded-full border border-ink" style={{ background: channelColor(i + 1) }} /> Channel {i + 1}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {v.cameras.length === 0 && <div className="col-span-full text-sm text-pencil">Waiting for camera positions…</div>}
        {v.cameras.map((c, i) => {
          const ch = v.assignments[i] ?? null
          return (
            <motion.div
              key={i}
              layout
              animate={{ scale: active === i ? 1.03 : 1, borderColor: active === i ? '#ff6f1e' : '#bebcbb' }}
              className="flex items-center justify-between rounded-lg border-[1.5px] bg-cream px-3 py-2 text-sm"
            >
              <span><b className="font-semibold">C{i + 1}</b> <span className="tabular-nums text-pencil">({c.row + 1},{c.col + 1})</span></span>
              <motion.span
                key={ch ?? 'none'}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-full border border-ink px-2 py-0.5 text-xs font-semibold tabular-nums"
                style={ch ? { background: channelColor(ch), color: '#171717' } : { color: '#5c564f', borderColor: '#bebcbb' }}
              >
                {ch ? `CH${ch}` : active === i ? `CH${v.coloring?.channel}?` : '—'}
              </motion.span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
