import { motion } from 'framer-motion'
import { Cctv } from 'lucide-react'

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 pt-2"
    >
      <div className="min-w-0 max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="sticker grid h-11 w-11 -rotate-6 place-items-center shadow-[rgba(0,0,0,0.06)_0_2px_20px_0]">
            <Cctv size={22} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="hand rotate-[-2deg] text-2xl sm:text-[26px]">camplan — a daa simulator</span>
        </div>
        <h1 className="display text-[28px] sm:text-[36px] lg:text-[46px]">
          where do the cameras go,{' '}
          <span className="marker">and who talks on which channel?</span>
        </h1>
      </div>
      <p className="max-w-sm text-base leading-normal text-pencil">
        <b className="font-semibold text-ink">backtracking</b> decides <em className="not-italic underline decoration-marker decoration-2 underline-offset-4">where</em> cameras
        go. <b className="font-semibold text-ink">graph coloring</b> decides <em className="not-italic underline decoration-marker decoration-2 underline-offset-4">which channel</em> each one uses.
      </p>
    </motion.header>
  )
}
