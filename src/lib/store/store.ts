import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NodeStore {
  nodes: any[];
  setNodes: (nodes: any[] | ((prevNodes: any[]) => any[])) => void;
  edges: any[];
  setEdges: (edges: any[] | ((prevEdges: any[]) => any[])) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  noteData: Record<string, any>;
  setNodeData: (nodeId: string, data: any) => void;
}

export const useNodeStore = create<NodeStore>()(
  persist(
    (set) => ({
  nodes: [],
  edges: [],
  noteData: {},
  setNodes: (newNodes: any[] | ((prevNodes: any[]) => any[])) =>
    set((state) => ({
      nodes: typeof newNodes === "function" ? newNodes(state.nodes) : newNodes,
    })),
  setEdges: (newEdges: any[] | ((prevEdges: any[]) => any[])) =>
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
  setNodeData: (nodeId: string, data: any) =>
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
