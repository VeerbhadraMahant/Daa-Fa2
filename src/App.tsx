import { useEffect } from 'react'
import { Header } from './components/Header'
import { PhaseStepper } from './components/PhaseStepper'
import { ConfigurationPanel } from './components/ConfigurationPanel'
import { AlgorithmControls } from './components/AlgorithmControls'
import { BuildingGrid } from './components/BuildingGrid'
import { ConflictGraph } from './components/ConflictGraph'
import { ColoringPanel } from './components/ColoringPanel'
import { AlgorithmStats } from './components/AlgorithmStats'
import { StepLog } from './components/StepLog'
import { ResultsPanel } from './components/ResultsPanel'
import { stepDelay, useSimulation } from './store/simulationStore'

function usePlayer() {
  const playing = useSimulation((s) => s.playing)
  const speed = useSimulation((s) => s.speed)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => useSimulation.getState().tick(), stepDelay(speed))
    return () => clearInterval(id)
  }, [playing, speed])
}

export default function App() {
  usePlayer()
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6">
      <Header />
      <PhaseStepper />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-3">
          <AlgorithmControls />
          <ConfigurationPanel />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <BuildingGrid />
          <StepLog />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <ConflictGraph />
          <ColoringPanel />
        </div>
      </div>
      <AlgorithmStats />
      <ResultsPanel />
      <footer className="pb-4 text-center text-[11px] text-slate-500">
        Educational DAA simulation — a simplified grid/distance model, not RF engineering or a production CCTV planner.
      </footer>
    </div>
  )
}
