import { motion } from 'framer-motion'
import { Cctv } from 'lucide-react'

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex items-center gap-4"
    >
      <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-cyan-400/30 bg-slate-900/70">
        <svg viewBox="0 0 100 100" className="radar absolute inset-0 h-full w-full opacity-70">
          <defs>
            <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <path d="M50 50 L50 6 A44 44 0 0 1 94 50 Z" fill="url(#sweep)" />
        </svg>
        <Cctv className="relative text-cyan-300" size={26} />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Intelligent Security Camera Placement
          <span className="ml-2 bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
            & Interference Management
          </span>
        </h1>
        <p className="text-xs text-slate-400 sm:text-sm">
          Backtracking finds <em>where</em> cameras go · Graph Coloring decides <em>which channel</em> each one uses
        </p>
      </div>
    </motion.header>
  )
}
