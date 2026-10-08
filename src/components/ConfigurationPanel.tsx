import { Minus, Plus, Settings2, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSimulation } from '../store/simulationStore'
import { presets } from '../data/defaultScenario'

function Stepper({ label, value, min, max, step = 1, onChange, suffix }: {
  label: string; value: number; min: number; max: number; step?: number; suffix?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-300">{label}</span>
      <div className="flex items-center gap-1.5">
        <button className="btn !p-1.5" disabled={value <= min} onClick={() => onChange(value - step)} aria-label={`decrease ${label}`}>
          <Minus size={12} />
        </button>
        <span className="min-w-16 whitespace-nowrap text-center font-mono text-sm tabular-nums">{value}{suffix}</span>
        <button className="btn !p-1.5" disabled={value >= max} onClick={() => onChange(value + step)} aria-label={`increase ${label}`}>
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }): ReactNode {
  return (
    <button onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 text-left" title={hint}>
      <span className="text-xs text-slate-300">{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? 'bg-cyan-500' : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

export function ConfigurationPanel() {
  const { config, setConfig, loadConfig } = useSimulation()
  return (
    <section className="panel space-y-4 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Settings2 size={16} className="text-cyan-300" /> Configuration
      </div>
      <div className="space-y-2.5">
        <Stepper label="Rows" value={config.rows} min={3} max={12} onChange={(v) => setConfig({ rows: v })} />
        <Stepper label="Columns" value={config.cols} min={3} max={12} onChange={(v) => setConfig({ cols: v })} />
        <Stepper label="Cameras" value={config.cameras} min={1} max={12} onChange={(v) => setConfig({ cameras: v })} />
        <Stepper label="Channels" value={config.channels} min={1} max={8} onChange={(v) => setConfig({ channels: v })} />
        <Stepper label="Interference range" value={config.interferenceRange} min={1} max={8} step={0.5} suffix=" cells" onChange={(v) => setConfig({ interferenceRange: v })} />
        <Stepper label="Min. separation" value={config.minSeparation} min={1} max={4} suffix=" cells" onChange={(v) => setConfig({ minSeparation: v })} />
      </div>
      <div className="space-y-2.5 border-t border-slate-700/50 pt-3">
        <Toggle label="One camera per row" hint="N-Queens-style row constraint" on={config.uniqueRows} onChange={(v) => setConfig({ uniqueRows: v })} />
        <Toggle label="One camera per column" hint="N-Queens-style column constraint" on={config.uniqueCols} onChange={(v) => setConfig({ uniqueCols: v })} />
        <Toggle label="One camera per diagonal" hint="N-Queens-style diagonal constraint" on={config.uniqueDiagonals} onChange={(v) => setConfig({ uniqueDiagonals: v })} />
      </div>
      <p className="rounded-lg bg-slate-900/60 p-2 text-[11px] leading-relaxed text-slate-400">
        Click grid cells to block / unblock them (walls, pillars, restricted areas). Cameras within{' '}
        <b className="text-slate-200">{config.interferenceRange}</b> cells (Euclidean) of each other get a conflict edge.
      </p>
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sparkles size={13} className="text-violet-300" /> Scenarios
        </div>
        <div className="grid gap-1.5">
          {presets.map((p) => (
            <button key={p.name} className="btn !justify-between !px-3 !py-2 text-left" onClick={() => loadConfig(p.config)}>
              <span>{p.name}</span>
              <span className="text-[10px] font-normal text-slate-400">{p.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
