import { ChevronsRight, Gauge, Pause, Play, RotateCcw, SkipBack, SkipForward, StepForward } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'

export function AlgorithmControls() {
  const s = useSimulation()
  const v = useView()
  const running = s.playing && !v.finished
  return (
    <section className="panel space-y-3 p-4">
      <div className="grid grid-cols-2 gap-2">
        {running ? (
          <button className="btn btn-primary col-span-2" onClick={s.pause}>
            <Pause size={15} /> Pause
          </button>
        ) : (
          <button className="btn btn-primary col-span-2" onClick={() => (v.started ? s.play() : s.start())}>
            <Play size={15} /> {!v.started ? 'Start simulation' : v.finished ? 'Replay' : 'Run'}
          </button>
        )}
        <button className="btn" onClick={s.next} disabled={v.finished}>
          <StepForward size={14} /> Next step
        </button>
        <button className="btn" onClick={s.prev} disabled={!v.started || s.index <= 0}>
          <SkipBack size={14} /> Prev
        </button>
        <button className="btn" onClick={s.skipPhase} disabled={!v.started || v.finished}>
          <ChevronsRight size={14} /> Skip phase
        </button>
        <button className="btn" onClick={s.finish}>
          <SkipForward size={14} /> Jump to result
        </button>
        <button className="btn col-span-2" onClick={s.reset} disabled={!v.started}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      <label className="block">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5"><Gauge size={13} /> Speed</span>
          <span className="font-mono">{s.speed}×</span>
        </div>
        <input type="range" min={1} max={10} value={s.speed} onChange={(e) => s.setSpeed(+e.target.value)} className="w-full" />
      </label>
      {v.started && (
        <label className="block">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>Timeline</span>
            <span className="font-mono">{s.index + 1} / {v.total}</span>
          </div>
          <input type="range" min={0} max={v.total - 1} value={s.index} onChange={(e) => s.seek(+e.target.value)} className="w-full" />
        </label>
      )}
    </section>
  )
}
