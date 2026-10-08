import { motion } from 'framer-motion'
import { Palette } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'
import { channelColor } from './palette'

export function ColoringPanel() {
  const { config } = useSimulation()
  const v = useView()
  const active = v.coloring?.vertex
  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Palette size={16} className="text-pink-300" /> Channel assignment</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {Array.from({ length: config.channels }, (_, i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[11px]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: channelColor(i + 1) }} /> Channel {i + 1}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {v.cameras.length === 0 && <div className="col-span-full text-xs text-slate-500">Waiting for camera positions…</div>}
        {v.cameras.map((c, i) => {
          const ch = v.assignments[i] ?? null
          return (
            <motion.div
              key={i}
              layout
              animate={{ scale: active === i ? 1.04 : 1, borderColor: active === i ? '#22d3ee' : 'rgba(51,65,85,0.7)' }}
              className="flex items-center justify-between rounded-lg border bg-slate-900/60 px-2.5 py-1.5 text-xs"
            >
              <span><b>C{i + 1}</b> <span className="text-slate-500">({c.row + 1},{c.col + 1})</span></span>
              <motion.span
                key={ch ?? 'none'}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                style={ch ? { background: channelColor(ch), color: '#020617' } : { color: '#64748b' }}
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
