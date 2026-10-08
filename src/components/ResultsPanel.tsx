import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Download, XCircle } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="panel relative p-8"
      >
        {success && (
          <span className="sticker absolute -top-3 right-8 inline-flex items-center gap-1 whitespace-nowrap rotate-[4deg]">
            <CheckCircle2 size={14} strokeWidth={2} /> all clear
          </span>
        )}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="display flex items-center gap-3 text-3xl">
            {success ? <CheckCircle2 size={28} strokeWidth={1.75} /> : <XCircle size={28} strokeWidth={1.75} className="text-sienna" />}
            {success
              ? <span className="marker">security configuration complete</span>
              : compiled.placementOk ? 'channel assignment failed' : 'no valid camera placement'}
          </h2>
          {compiled.placementOk && (
            <button className="btn" onClick={exportJson}><Download size={16} /> Export JSON</button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-2">
            {[
              ['Cameras placed', compiled.cameras.length],
              ['Channels used', used],
              ['Positions tried', pStats.tried],
              ['Conflicts detected', pStats.conflicts + cStats.conflicts],
              ['Backtracks', pStats.backtracks + cStats.backtracks],
            ].map(([k, val], i) => (
              <motion.div key={k} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                className="flex justify-between border-b border-mist pb-2 text-base">
                <span className="text-pencil">{k}</span><b className="font-semibold tabular-nums">{val}</b>
              </motion.div>
            ))}
            <div className="space-y-1.5 pt-3">
              {checks.map(([t, ok], i) => (
                <motion.div key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.15 }}
                  className={`flex items-center gap-2 text-sm ${ok ? 'text-ink' : 'font-medium text-sienna'}`}>
                  {ok ? <CheckCircle2 size={16} strokeWidth={1.75} /> : <XCircle size={16} strokeWidth={1.75} />} {t}
                </motion.div>
              ))}
            </div>
            {!success && (
              <p className="inset mt-2 p-3 text-sm text-sienna">{(v.step as { message: string }).message}</p>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border-[1.5px] border-ink">
            <table className="w-full text-left text-sm">
              <thead className="bg-dew text-pencil">
                <tr><th className="px-3 py-2 font-medium">Camera</th><th className="font-medium">Row</th><th className="font-medium">Col</th><th className="font-medium">Channel</th></tr>
              </thead>
              <tbody className="tabular-nums">
                {compiled.cameras.map((c, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.08 }} className="border-t border-mist">
                    <td className="px-3 py-1.5 font-semibold">C{i + 1}</td><td>{c.row + 1}</td><td>{c.col + 1}</td>
                    <td>
                      {assignments[i] ? (
                        <span className="rounded-full border border-ink px-2 py-0.5 text-xs font-semibold text-ink" style={{ background: channelColor(assignments[i]) }}>CH{assignments[i]}</span>
                      ) : '—'}
                    </td>
                  </motion.tr>
                ))}
                {compiled.cameras.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-pencil">No cameras could be placed.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chart} margin={{ left: -20, right: 4, top: 8 }}>
                <CartesianGrid stroke="#bebcbb" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#171717', fontSize: 12 }} stroke="#171717" />
                <YAxis tick={{ fill: '#171717', fontSize: 12 }} allowDecimals={false} stroke="#171717" />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #171717', borderRadius: 8, fontSize: 13, boxShadow: 'none' }} cursor={{ fill: '#f7efe9' }} />
                <Bar dataKey="Backtracking" fill="#fdfbf9" stroke="#171717" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Coloring" fill="#ff6f1e" stroke="#171717" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-5 text-sm text-pencil">
              <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm border-[1.5px] border-ink bg-cream" /> Backtracking</span>
              <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm border-[1.5px] border-ink bg-marker" /> Graph coloring</span>
            </div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  )
}
