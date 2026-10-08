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

// States are told apart by border style + fill, not hue alone.
const MARK_STYLE: Record<CellMark, string> = {
  none: 'border-mist bg-cream',
  try: 'border-ink bg-dew border-dashed',
  reject: 'border-sienna bg-marker/25',
  backtrack: 'border-ink bg-marker/40',
  against: 'border-sienna bg-marker/10',
}

export function CameraCell({ blocked, camera, channel, mark, active, ringCells, editable, onClick }: Props) {
  const color = channelColor(channel)
  return (
    <motion.button
      onClick={editable ? onClick : undefined}
      whileHover={editable ? { scale: 1.06 } : undefined}
      animate={mark === 'reject' ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative aspect-square min-h-8 rounded-lg border-[1.5px] transition-colors duration-150 ${
        blocked ? 'border-ink bg-dew [background-image:repeating-linear-gradient(45deg,transparent_0_5px,rgba(23,23,23,0.14)_5px_6px)]' : MARK_STYLE[mark]
      } ${editable ? 'cursor-pointer' : 'cursor-default'}`}
      aria-label={blocked ? 'blocked cell' : camera !== null ? `camera ${camera + 1}` : 'empty cell'}
    >
      {blocked && <Ban className="absolute inset-0 m-auto text-ink" strokeWidth={1.75} style={{ width: '45%', height: '45%' }} />}
      {mark === 'try' && (
        <motion.span
          className="absolute inset-0 rounded-lg border-2 border-marker"
          initial={{ opacity: 0.9, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />
      )}
      <AnimatePresence>
        {active && ringCells > 0 && (
          <motion.span
            key="ring"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full border-2 border-dashed border-ink"
            style={{ width: `${ringCells * 200}%`, height: `${ringCells * 200}%`, background: `${color}40`, translate: '-50% -50%' }}
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
            className="absolute inset-[8%] z-20 grid place-items-center rounded-md border-[1.5px] border-ink"
            style={{ background: color }}
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: active ? 1.12 : 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          >
            <Cctv className="text-ink" strokeWidth={1.75} style={{ width: '55%', height: '55%' }} />
            <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border border-ink bg-white px-1 text-[10px] font-semibold leading-none text-ink tabular-nums">
              {camera + 1}
            </span>
            {channel && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 rounded-full border border-ink bg-white px-1.5 text-[10px] font-semibold leading-4 text-ink tabular-nums"
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
