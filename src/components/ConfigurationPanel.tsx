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
      <span className="text-base">{label}</span>
      <div className="flex items-center gap-1.5">
        <button className="btn btn-icon" disabled={value <= min} onClick={() => onChange(value - step)} aria-label={`decrease ${label}`}>
          <Minus size={14} />
        </button>
        <span className="min-w-[4.5rem] whitespace-nowrap text-center text-base font-semibold tabular-nums">{value}{suffix}</span>
        <button className="btn btn-icon" disabled={value >= max} onClick={() => onChange(value + step)} aria-label={`increase ${label}`}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }): ReactNode {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left" title={hint}>
      <span className="text-base">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="w-6 text-right text-sm font-medium text-pencil">{on ? 'on' : 'off'}</span>
        <span className={`relative h-6 w-11 rounded-full border-[1.5px] border-ink transition-colors ${on ? 'bg-marker' : 'bg-cream'}`}>
          <span className={`absolute top-[2px] h-4 w-4 rounded-full border-[1.5px] border-ink bg-white transition-all ${on ? 'left-[22px]' : 'left-[2px]'}`} />
        </span>
      </span>
    </button>
  )
}

export function ConfigurationPanel() {
  const { config, setConfig, loadConfig } = useSimulation()
  return (
    <section className="panel space-y-5 p-6">
      <div className="panel-title">
        <Settings2 size={20} strokeWidth={1.75} /> configuration
      </div>
      <div className="space-y-3">
        <Stepper label="Rows" value={config.rows} min={3} max={12} onChange={(v) => setConfig({ rows: v })} />
        <Stepper label="Columns" value={config.cols} min={3} max={12} onChange={(v) => setConfig({ cols: v })} />
        <Stepper label="Cameras" value={config.cameras} min={1} max={12} onChange={(v) => setConfig({ cameras: v })} />
        <Stepper label="Channels" value={config.channels} min={1} max={8} onChange={(v) => setConfig({ channels: v })} />
        <Stepper label="Interference range" value={config.interferenceRange} min={1} max={8} step={0.5} suffix=" cells" onChange={(v) => setConfig({ interferenceRange: v })} />
        <Stepper label="Min. separation" value={config.minSeparation} min={1} max={4} suffix=" cells" onChange={(v) => setConfig({ minSeparation: v })} />
      </div>
      <div className="space-y-1 border-t-[1.5px] border-ink pt-3">
        <Toggle label="One camera per row" hint="N-Queens-style row constraint" on={config.uniqueRows} onChange={(v) => setConfig({ uniqueRows: v })} />
        <Toggle label="One camera per column" hint="N-Queens-style column constraint" on={config.uniqueCols} onChange={(v) => setConfig({ uniqueCols: v })} />
        <Toggle label="One camera per diagonal" hint="N-Queens-style diagonal constraint" on={config.uniqueDiagonals} onChange={(v) => setConfig({ uniqueDiagonals: v })} />
      </div>
      <p className="inset p-4 text-sm leading-relaxed text-pencil">
        Click grid cells to block / unblock them (walls, pillars, restricted areas). Cameras within{' '}
        <b className="font-semibold text-ink">{config.interferenceRange}</b> cells (Euclidean) of each other get a conflict edge.
      </p>
      <div>
        <div className="panel-title mb-3">
          <Sparkles size={18} strokeWidth={1.75} /> scenarios
        </div>
        <div className="grid gap-2">
          {presets.map((p) => (
            <button key={p.name} className="btn !h-auto !flex-col !items-start !gap-0 !rounded-[12px] !px-4 !py-2.5 text-left" onClick={() => loadConfig(p.config)}>
              <span>{p.name}</span>
              <span className="text-sm font-normal text-pencil">{p.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
