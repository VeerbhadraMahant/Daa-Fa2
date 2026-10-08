# Intelligent Security Camera Placement & Interference Management

Interactive DAA simulator: **Backtracking** finds valid camera positions on a building grid, a **conflict graph** is built from the interference rule, and **Graph Coloring** (also backtracking) assigns communication channels so interfering cameras never share one.

> Educational model inspired by N-Queens style grid placement. It is *not* an RF-engineering or production CCTV planning tool (no field-of-view, mounting, bandwidth or propagation modelling).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # algorithm unit tests (vitest)
npm run build    # type-check + production build (static Vite app, deployable to Vercel)
```

## Fixed, documented model (so runs are reproducible)

**Placement constraints** (camera *k* is tried on cells after camera *k-1* in row-major order, so cells never repeat):

1. Cell is not blocked
2. One camera per row *(toggle)*
3. One camera per column *(toggle)*
4. One camera per diagonal *(toggle)*
5. Chebyshev distance between any two cameras ≥ *min separation*

**Interference rule:** two cameras get an edge iff their Euclidean distance ≤ *interference range* (cells).

**Coloring:** exact backtracking with *m* channels; vertices ordered by descending degree, channels tried 1..m. If no proper coloring exists the app says so (add channels or reduce the range).

Both searches log every decision (`try / reject / place / backtrack / assign / conflict`) into a step list; the UI just replays it. Searches are capped at 60 000 steps so impossible scenarios cannot freeze the browser.

## Architecture

```
src/
  algorithms/   backtracking.ts · conflictGraph.ts · graphColoring.ts   (pure TS, no React)
  store/        simulationStore.ts   Zustand: config, compiled step list, player
  components/   Header, PhaseStepper, ConfigurationPanel, AlgorithmControls, BuildingGrid, CameraCell,
                ConflictGraph (React Flow), ColoringPanel, AlgorithmStats, StepLog, ResultsPanel (Recharts)
  data/         defaultScenario.ts  (demo 8x8 / 6 cameras / 3 channels + presets)
  types/        simulation.ts
```

## Features

Configurable grid / cameras / channels / range / constraints, click-to-block cells, Run / Pause / Next / Prev / Skip phase / Jump to result / Reset, speed slider and scrubbable timeline, animated candidate / conflict / backtrack cells, conflict edges on the floor plan and in a draggable React Flow graph, channel colours appearing as coloring proceeds, live counters, narration log, results dashboard (table, chart, JSON export), and preset scenarios (including a no-solution case and an "insufficient channels" case).

## Complexity

| Stage | Time | Space |
|---|---|---|
| Placement (backtracking) | exponential worst case; depends on grid, cameras, constraints | O(K) recursion |
| Graph construction (pairwise) | O(V²) | O(V+E) adjacency list |
| Coloring (backtracking) | O(mᵛ) worst case | O(V) |

## Not implemented from the proposal

shadcn/ui (plain Tailwind components used instead), side-by-side scenario comparison, Vercel config (the static `dist/` works as-is).
