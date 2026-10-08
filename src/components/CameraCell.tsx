import { AnimatePresence, motion } from 'framer-motion'
import { Cctv, Ban } from 'lucide-react'
import { channelColor } from './palette'

export type CellMark = 'none' | 'try' | 'reject' | 'backtrack' | 'against'

interface Props {
  blocked: boolean
  camera: number | null // camera index
  channel: number | null
  mark: CellMark
  active: boolean // camera is the vertex currently being processed
  ringCells: number // interference radius in cells (drawn when active)
  editable: boolean
  onClick: () => void
}

const MARK_STYLE: Record<CellMark, string> = {
  none: 'border-slate-700/50 bg-slate-900/50',
  try: 'border-cyan-300 bg-cyan-400/25',
  reject: 'border-rose-400 bg-rose-500/30',
  backtrack: 'border-amber-300 bg-amber-400/30',
  against: 'border-rose-400/80 bg-rose-500/10',
}

export function CameraCell({ blocked, camera, channel, mark, active, ringCells, editable, onClick }: Props) {
  const color = channelColor(channel)
  return (
    <motion.button
      onClick={editable ? onClick : undefined}
      whileHover={editable ? { scale: 1.08 } : undefined}
      animate={mark === 'reject' ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative aspect-square rounded-md border transition-colors duration-150 ${
        blocked ? 'border-slate-600 bg-slate-700/60' : MARK_STYLE[mark]
      } ${editable ? 'cursor-pointer' : 'cursor-default'}`}
      aria-label={blocked ? 'blocked cell' : camera !== null ? `camera ${camera + 1}` : 'empty cell'}
    >
      {blocked && <Ban className="absolute inset-0 m-auto text-slate-400/70" style={{ width: '45%', height: '45%' }} />}
      {mark === 'try' && (
        <motion.span
          className="absolute inset-0 rounded-md border-2 border-cyan-300"
          initial={{ opacity: 0.9, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />
      )}
      <AnimatePresence>
        {active && ringCells > 0 && (
          <motion.span
            key="ring"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full border-2 border-dashed"
            style={{ width: `${ringCells * 200}%`, height: `${ringCells * 200}%`, borderColor: color, background: `${color}14`, translate: '-50% -50%' }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {camera !== null && (
          <motion.div
            key="cam"
            className="absolute inset-[8%] z-20 grid place-items-center rounded-md"
            style={{ background: `${color}33`, border: `2px solid ${color}`, boxShadow: channel ? `0 0 18px ${color}88` : '0 0 12px #64748b55' }}
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: active ? 1.12 : 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          >
            <Cctv style={{ color, width: '55%', height: '55%' }} />
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-slate-950 px-1 text-[9px] font-bold leading-none ring-1 ring-slate-600">
              {camera + 1}
            </span>
            {channel && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1.5 rounded px-1 text-[9px] font-bold leading-4 text-slate-950"
                style={{ background: color }}
              >
                CH{channel}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
