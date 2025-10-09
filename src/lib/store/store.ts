import { create } from "zustand";

interface Node {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

interface NodeStore {
  canvasId: string;
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void;
  edges: Edge[];
  setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  setCanvasId: (canvasId: string) => void;
  reset: () => void;
}

// UI state only - no persistence
export const useNodeStore = create<NodeStore>()((set) => ({
  canvasId: "",
  nodes: [],
  edges: [],
  setCanvasId: (canvasId: string) => set({ canvasId }),
  setNodes: (newNodes: Node[] | ((prevNodes: Node[]) => Node[])) =>
    set((state) => {
      const updatedNodes = typeof newNodes === "function" ? newNodes(state.nodes) : newNodes;
      return { nodes: updatedNodes };
    }),
  setEdges: (newEdges: Edge[] | ((prevEdges: Edge[]) => Edge[])) =>
    set((state) => {
      const updatedEdges = typeof newEdges === "function" ? newEdges(state.edges) : newEdges;
      return { edges: updatedEdges };
    }),
  deleteNode: (nodeId: string) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    })),
  deleteEdge: (edgeId: string) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    })),
  reset: () => set({ canvasId: "", nodes: [], edges: [] }),
}));
