import { ChevronsRight, Gauge, Pause, Play, RotateCcw, SkipBack, SkipForward, StepForward } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'

export function AlgorithmControls() {
  const s = useSimulation()
  const v = useView()
  const running = s.playing && !v.finished
  return (
    <section className="panel space-y-5 p-6" aria-label="Playback controls">
      <div className="grid grid-cols-2 gap-3">
        {running ? (
          <button className="btn btn-primary col-span-2" onClick={s.pause}>
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button className="btn btn-primary col-span-2" onClick={() => (v.started ? s.play() : s.start())}>
            <Play size={16} /> {!v.started ? 'Start simulation' : v.finished ? 'Replay' : 'Run'}
          </button>
        )}
        <button className="btn !px-3" onClick={s.next} disabled={v.finished}>
          <StepForward size={15} /> Next
        </button>
        <button className="btn !px-3" onClick={s.prev} disabled={!v.started || s.index <= 0}>
          <SkipBack size={15} /> Prev
        </button>
        <button className="btn !px-3" onClick={s.skipPhase} disabled={!v.started || v.finished}>
          <ChevronsRight size={15} /> Skip phase
        </button>
        <button className="btn !px-3" onClick={s.finish}>
          <SkipForward size={15} /> Result
        </button>
        <button className="btn col-span-2" onClick={s.reset} disabled={!v.started}>
          <RotateCcw size={15} /> Reset
        </button>
      </div>
      <label className="block">
        <div className="mb-1 flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Gauge size={16} strokeWidth={1.75} /> Speed</span>
          <span className="font-semibold tabular-nums">{s.speed}×</span>
        </div>
        <input type="range" min={1} max={10} value={s.speed} onChange={(e) => s.setSpeed(+e.target.value)} className="w-full" />
      </label>
      {v.started && (
        <label className="block">
          <div className="mb-1 flex justify-between text-base text-pencil">
            <span>Timeline</span>
            <span className="font-semibold tabular-nums text-ink">{s.index + 1} / {v.total}</span>
          </div>
          <input type="range" min={0} max={v.total - 1} value={s.index} onChange={(e) => s.seek(+e.target.value)} className="w-full" />
        </label>
      )}
    </section>
  )
}
