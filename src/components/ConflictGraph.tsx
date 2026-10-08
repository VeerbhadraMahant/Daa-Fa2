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
      animate={{ scale: data.active ? 1.15 : 1, backgroundColor: data.channel ? color : '#fdfbf9' }}
      transition={{ type: 'spring', stiffness: 300, damping: 16 }}
      className="grid h-12 w-12 place-items-center rounded-full text-sm font-semibold"
      style={{
        color: '#171717',
        border: `${data.clash || data.active ? 3 : 1.5}px solid ${data.clash ? '#ff6f1e' : '#171717'}`,
        boxShadow: data.active ? '0 0 0 4px #fdfbf9, 0 0 0 5.5px #171717' : 'none',
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
          labelStyle: { fill: '#171717', fontSize: 11, fontWeight: 500 },
          labelBgStyle: { fill: '#ffffff', stroke: '#171717', strokeWidth: 1 },
          labelBgBorderRadius: 8,
          style: { stroke: clash ? '#ff6f1e' : '#171717', strokeWidth: clash ? 3 : 1.5 },
        }
      }),
    )
  }, [v.cameras, v.edges, v.assignments, v.coloring, n, setNodes, setEdges])

  return (
    <section className="panel flex flex-col p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="panel-title">
          <Network size={20} strokeWidth={1.75} /> conflict graph
        </div>
        <span className="tag tabular-nums">V={v.cameras.length} · E={v.edges.length}</span>
      </div>
      <div className="relative h-[340px] overflow-hidden rounded-lg border-[1.5px] border-ink bg-dew">
        {v.cameras.length === 0 && (
          <div className="absolute inset-0 z-10 grid place-items-center px-6 text-center text-sm text-pencil">
            Vertices appear here as backtracking places cameras
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
          <Background variant={BackgroundVariant.Dots} gap={18} color="#bebcbb" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <p className="hand mt-3 text-lg">drag nodes around — edge labels show camera distance</p>
    </section>
  )
}
