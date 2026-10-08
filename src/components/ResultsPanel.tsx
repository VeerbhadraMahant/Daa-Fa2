import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Download, XCircle } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSimulation, useView } from '../store/simulationStore'
import { channelColor } from './palette'

export function ResultsPanel() {
  const { compiled, config } = useSimulation()
  const v = useView()
  if (!compiled || !v.finished) return null

  const pSteps = compiled.steps.filter((s) => s.phase === 'placement')
  const pStats = pSteps.length ? (pSteps[pSteps.length - 1] as { stats: { tried: number; conflicts: number; backtracks: number } }).stats : { tried: 0, conflicts: 0, backtracks: 0 }
  const cStats = v.coloring?.stats ?? { tried: 0, conflicts: 0, backtracks: 0 }
  const assignments = v.assignments
  const success = compiled.placementOk && compiled.coloringOk
  const used = new Set(assignments.filter(Boolean)).size
  const chart = [
    { name: 'Tried', Backtracking: pStats.tried, Coloring: cStats.tried },
    { name: 'Conflicts', Backtracking: pStats.conflicts, Coloring: cStats.conflicts },
    { name: 'Backtracks', Backtracking: pStats.backtracks, Coloring: cStats.backtracks },
  ]

  const exportJson = () => {
    const data = {
      config,
      success,
      cameras: compiled.cameras.map((c, i) => ({ id: `C${i + 1}`, row: c.row + 1, column: c.col + 1, channel: assignments[i] ?? null })),
      edges: compiled.edges.map((e) => ({ a: `C${e.a + 1}`, b: `C${e.b + 1}`, distance: +e.distance.toFixed(3) })),
      stats: { backtracking: pStats, graphColoring: cStats },
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'camera-configuration.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const checks = [
    ['Camera placement completed', compiled.placementOk],
    ['Conflict graph generated', compiled.placementOk],
    ['Graph coloring completed', compiled.coloringOk],
    ['Channel conflicts resolved', compiled.coloringOk],
  ] as const

  return (
    <AnimatePresence>
      <motion.section
        key="results"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        className={`panel relative overflow-hidden p-5 ${success ? '!border-emerald-400/40' : '!border-rose-400/40'}`}
      >
        <motion.div
          className={`pointer-events-none absolute -inset-x-10 -top-24 h-48 rounded-full blur-3xl ${success ? 'bg-emerald-400/15' : 'bg-rose-400/15'}`}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className={`flex items-center gap-2 text-lg font-bold ${success ? 'text-emerald-300' : 'text-rose-300'}`}>
            {success ? <CheckCircle2 /> : <XCircle />}
            {success ? 'SECURITY CONFIGURATION COMPLETE' : compiled.placementOk ? 'CHANNEL ASSIGNMENT FAILED' : 'NO VALID CAMERA PLACEMENT'}
          </h2>
          {compiled.placementOk && (
            <button className="btn" onClick={exportJson}><Download size={14} /> Export JSON</button>
          )}
        </div>

        <div className="relative grid gap-5 lg:grid-cols-3">
          <div className="space-y-2">
            {[
              ['Cameras placed', compiled.cameras.length],
              ['Channels used', used],
              ['Positions tried', pStats.tried],
              ['Conflicts detected', pStats.conflicts + cStats.conflicts],
              ['Backtracks', pStats.backtracks + cStats.backtracks],
            ].map(([k, val], i) => (
              <motion.div key={k} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                className="flex justify-between border-b border-slate-700/40 pb-1 text-sm">
                <span className="text-slate-400">{k}</span><b className="font-mono">{val}</b>
              </motion.div>
            ))}
            <div className="space-y-1 pt-2">
              {checks.map(([t, ok], i) => (
                <motion.div key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.15 }}
                  className={`flex items-center gap-2 text-xs ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {t}
                </motion.div>
              ))}
            </div>
            {!success && (
              <p className="pt-2 text-xs text-rose-200/80">{(v.step as { message: string }).message}</p>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr><th className="px-3 py-2">Camera</th><th>Row</th><th>Col</th><th>Channel</th></tr>
              </thead>
              <tbody>
                {compiled.cameras.map((c, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.08 }} className="border-t border-slate-800">
                    <td className="px-3 py-1.5 font-semibold">C{i + 1}</td><td>{c.row + 1}</td><td>{c.col + 1}</td>
                    <td>
                      {assignments[i] ? (
                        <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-950" style={{ background: channelColor(assignments[i]) }}>CH{assignments[i]}</span>
                      ) : '—'}
                    </td>
                  </motion.tr>
                ))}
                {compiled.cameras.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-slate-500">No cameras could be placed.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ left: -20, right: 4, top: 8 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} cursor={{ fill: '#1e293b66' }} />
                <Bar dataKey="Backtracking" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Coloring" fill="#f472b6" radius={[4, 4, 0, 0]}>
                  {chart.map((_, i) => <Cell key={i} fill="#f472b6" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-cyan-400" /> Backtracking</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-pink-400" /> Graph coloring</span>
            </div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  )
}
