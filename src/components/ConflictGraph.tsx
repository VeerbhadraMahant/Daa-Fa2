import { useEffect } from 'react'
import { Background, BackgroundVariant, Controls, Handle, Position, ReactFlow, useEdgesState, useNodesState, type Edge, type Node, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Network } from 'lucide-react'
import { useSimulation, useView } from '../store/simulationStore'
import { channelColor } from './palette'

type CamData = { label: string; channel: number | null; active: boolean; clash: boolean; [k: string]: unknown }

function CameraNode({ data }: NodeProps<Node<CamData>>) {
  const color = channelColor(data.channel)
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: data.active ? 1.2 : 1, backgroundColor: data.channel ? color : '#1e293b' }}
      transition={{ type: 'spring', stiffness: 300, damping: 16 }}
      className="grid h-12 w-12 place-items-center rounded-full text-sm font-bold"
      style={{
        color: data.channel ? '#020617' : '#e2e8f0',
        border: `2px solid ${data.clash ? '#fb7185' : data.channel ? color : '#64748b'}`,
        boxShadow: data.active ? `0 0 26px ${data.clash ? '#fb7185' : '#22d3ee'}` : data.channel ? `0 0 14px ${color}77` : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="text-center leading-none">
        {data.label}
        {data.channel && <div className="mt-0.5 text-[9px] font-semibold">CH{data.channel}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </motion.div>
  )
}
const nodeTypes = { camera: CameraNode }

export function ConflictGraph() {
  const { config } = useSimulation()
  const v = useView()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CamData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const n = Math.max(config.cameras, 1)

  useEffect(() => {
    const R = 115
    setNodes((prev) =>
      v.cameras.map((_, i) => {
        const old = prev.find((p) => p.id === `c${i}`)
        const ang = (2 * Math.PI * i) / n - Math.PI / 2
        const cv = v.coloring
        return {
          id: `c${i}`,
          type: 'camera',
          position: old?.position ?? { x: 200 + R * Math.cos(ang), y: 150 + R * Math.sin(ang) },
          data: {
            label: `C${i + 1}`,
            channel: v.assignments[i] ?? null,
            active: cv?.vertex === i,
            clash: cv?.action === 'conflict' && (cv.vertex === i || cv.against === i),
          },
        }
      }),
    )
    setEdges(
      v.edges.map((e) => {
        const cv = v.coloring
        const clash = cv?.action === 'conflict' && ((cv.vertex === e.a && cv.against === e.b) || (cv.vertex === e.b && cv.against === e.a))
        return {
          id: `e${e.a}-${e.b}`,
          source: `c${e.a}`,
          target: `c${e.b}`,
          animated: true,
          label: e.distance.toFixed(1),
          labelStyle: { fill: '#94a3b8', fontSize: 9 },
          labelBgStyle: { fill: '#0f172a' },
          style: { stroke: clash ? '#fb7185' : '#64748b', strokeWidth: clash ? 3 : 1.6 },
        }
      }),
    )
  }, [v.cameras, v.edges, v.assignments, v.coloring, n, setNodes, setEdges])

  return (
    <section className="panel flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Network size={16} className="text-violet-300" /> Conflict graph
        </div>
        <span className="font-mono text-[11px] text-slate-400">V={v.cameras.length} · E={v.edges.length}</span>
      </div>
      <div className="relative h-[340px] overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950/60">
        {v.cameras.length === 0 && (
          <div className="absolute inset-0 z-10 grid place-items-center text-center text-xs text-slate-500">
            Vertices appear here as Backtracking places cameras
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 0, y: 10, zoom: 0.95 }}
          minZoom={0.4}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} color="#1e293b" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Drag nodes to rearrange · edge labels show camera distance</p>
    </section>
  )
}
