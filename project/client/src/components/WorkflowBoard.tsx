import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import type { StepResult } from "../api";

interface WorkflowBoardProps {
  steps: StepResult[];
  progress: number;
  onOpenNode: (step: StepResult) => void;
}

export function WorkflowBoard({ steps, progress, onOpenNode }: WorkflowBoardProps) {
  const nodes: Node[] = steps.map((step, index) => {
    const x = 60 + index * 210;
    const status = index < progress ? "done" : index === progress ? "running" : "pending";
    const background = status === "done" ? "#52c41a" : status === "running" ? "#1677ff" : "#d9d9d9";
    const label = status === "done" ? `${step.name} ✓` : status === "running" ? `${step.name} ...` : step.name;
    return {
      id: step.key,
      position: { x, y: 90 },
      data: { label },
      style: {
        width: 150,
        borderRadius: 10,
        border: "none",
        color: "#fff",
        textAlign: "center",
        fontWeight: 600,
        background
      }
    };
  });

  const edges: Edge[] = steps.slice(0, -1).map((step, index) => {
    const active = index < progress;
    return {
      id: `${step.key}->${steps[index + 1].key}`,
      source: step.key,
      target: steps[index + 1].key,
      animated: index === progress - 1,
      markerEnd: { type: MarkerType.ArrowClosed, color: active ? "#52c41a" : "#bfbfbf" },
      style: {
        stroke: active ? "#52c41a" : "#bfbfbf",
        strokeWidth: 3
      }
    };
  });

  return (
    <div style={{ height: 300, border: "1px solid #f0f0f0", borderRadius: 12 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ minZoom: 0.4, maxZoom: 1.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, node) => {
          const current = steps.find((item) => item.key === node.id);
          const index = steps.findIndex((item) => item.key === node.id);
          if (current && index < progress) {
            onOpenNode(current);
          }
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
