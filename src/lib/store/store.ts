import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  noteData: Record<string, string>;
  setNodeData: (nodeId: string, data: string) => void;
  setCanvasId: (canvasId: string) => void;
}

export const useNodeStore = create<NodeStore>()(
  persist(
    (set, get) => ({
  canvasId: "",
  nodes: [],
  edges: [],
  noteData: {},
  setCanvasId: (canvasId: string) => {
    set({ canvasId });
  },
  setNodes: (newNodes: Node[] | ((prevNodes: Node[]) => Node[])) =>
    set((state) => ({
      nodes: typeof newNodes === "function" ? newNodes(state.nodes) : newNodes,
    })),
  setEdges: (newEdges: Edge[] | ((prevEdges: Edge[]) => Edge[])) =>
    set((state) => ({
      edges: typeof newEdges === "function" ? newEdges(state.edges) : newEdges,
    })),
  deleteNode: (nodeId: string) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
    })),
  deleteEdge: (edgeId: string) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    })),
  setNodeData: (nodeId: string, data: string) =>
    set((state) => ({
      noteData: { ...state.noteData, [nodeId]: data },
    })),    
    }),
    {
      name: "zyra-canvas-storage",
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        noteData: state.noteData,
      }),
    }
  )
);

// Factory function to create canvas-specific node store
export const createNodeStore = (canvasId: string) => {
  const storeName = `zyra-canvas-storage-${canvasId}`;
  
  return create<NodeStore>()(persist(
    (set, get) => ({
    canvasId: canvasId,
    nodes: [],
    edges: [],
    noteData: {},
    setCanvasId: (newCanvasId: string) => {
      set({ canvasId: newCanvasId });
    },
    setNodes: (newNodes: Node[] | ((prevNodes: Node[]) => Node[])) =>
      set((state) => ({
        nodes: typeof newNodes === "function" ? newNodes(state.nodes) : newNodes,
      })),
    setEdges: (newEdges: Edge[] | ((prevEdges: Edge[]) => Edge[])) =>
      set((state) => ({
        edges: typeof newEdges === "function" ? newEdges(state.edges) : newEdges,
      })),
    deleteNode: (nodeId: string) =>
      set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== nodeId),
      })),
    deleteEdge: (edgeId: string) =>
      set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== edgeId),
      })),
    setNodeData: (nodeId: string, data: string) =>
      set((state) => ({
        noteData: { ...state.noteData, [nodeId]: data },
      })),    
    }), {
      name: storeName,
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        noteData: state.noteData,
      }),
    }
  ));
};
