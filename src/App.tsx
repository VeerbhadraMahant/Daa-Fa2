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
    <>
      <div className="mx-auto max-w-[1400px] space-y-12 px-4 pb-16 pt-8 sm:px-8 lg:space-y-16 lg:px-12 lg:pt-12">
        <Header />
        <PhaseStepper />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-3">
            <AlgorithmControls />
            <ConfigurationPanel />
          </div>
          <div className="space-y-6 lg:col-span-5">
            <BuildingGrid />
            <StepLog />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <ConflictGraph />
            <ColoringPanel />
          </div>
        </div>
        <AlgorithmStats />
        <ResultsPanel />
      </div>
      <footer className="rounded-t-[56px] border-t-[1.5px] border-ink bg-marker px-6 py-12 text-center">
        <p className="display mx-auto max-w-2xl text-2xl text-ink">
          educational daa simulation — a simplified grid and distance model, not rf engineering or a production cctv planner.
        </p>
      </footer>
    </>
  )
}
