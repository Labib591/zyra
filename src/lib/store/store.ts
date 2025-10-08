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
    (set) => ({
  canvasId: "",
  nodes: [],
  edges: [],
  noteData: {},
  setCanvasId: (canvasId: string) => {
    console.log("Setting canvas ID:", canvasId);
    set({ canvasId });
  },
  setNodes: (newNodes: Node[] | ((prevNodes: Node[]) => Node[])) =>
    set((state) => {
      const updatedNodes = typeof newNodes === "function" ? newNodes(state.nodes) : newNodes;
      console.log("Setting nodes:", updatedNodes.length, "nodes");
      return { nodes: updatedNodes };
    }),
  setEdges: (newEdges: Edge[] | ((prevEdges: Edge[]) => Edge[])) =>
    set((state) => {
      const updatedEdges = typeof newEdges === "function" ? newEdges(state.edges) : newEdges;
      console.log("Setting edges:", updatedEdges.length, "edges");
      return { edges: updatedEdges };
    }),
  deleteNode: (nodeId: string) =>
    set((state) => {
      console.log("Deleting node:", nodeId);
      return {
        nodes: state.nodes.filter((node) => node.id !== nodeId),
      };
    }),
  deleteEdge: (edgeId: string) =>
    set((state) => {
      console.log("Deleting edge:", edgeId);
      return {
        edges: state.edges.filter((edge) => edge.id !== edgeId),
      };
    }),
  setNodeData: (nodeId: string, data: string) =>
    set((state) => {
      console.log(`Setting data for node ${nodeId}:`, data ? `${data.substring(0, 100)}...` : "empty data");
      const newNoteData = { ...state.noteData, [nodeId]: data };
      
      // Try to save to localStorage as backup
      try {
        const currentState = {
          nodes: state.nodes,
          edges: state.edges,
          noteData: newNoteData,
        };
        localStorage.setItem('zyra-canvas-storage-backup', JSON.stringify(currentState));
        console.log(`Backup saved for node ${nodeId}`);
      } catch (error) {
        console.warn(`Failed to save backup for node ${nodeId}:`, error);
      }
      
      return {
        noteData: newNoteData,
      };
    }),    
    }),
    {
      name: "zyra-canvas-storage",
      partialize: (state) => {
        console.log("Partializing state for persistence:", {
          nodes: state.nodes.length,
          edges: state.edges.length,
          noteDataKeys: Object.keys(state.noteData).length,
          noteDataPreview: Object.keys(state.noteData).slice(0, 3)
        });
        return {
          nodes: state.nodes,
          edges: state.edges,
          noteData: state.noteData,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating store:", error);
          
          // Try to recover from backup
          try {
            const backupData = localStorage.getItem('zyra-canvas-storage-backup');
            if (backupData) {
              const parsed = JSON.parse(backupData);
              console.log("Recovering from backup:", parsed);
              // Note: We can't directly set state here, but we can log the recovery
              // The user will need to refresh to see the recovered data
            }
          } catch (recoveryError) {
            console.error("Failed to recover from backup:", recoveryError);
          }
        } else {
          console.log("Store rehydrated successfully:", {
            nodes: state?.nodes.length || 0,
            edges: state?.edges.length || 0,
            noteDataKeys: state?.noteData ? Object.keys(state.noteData).length : 0,
            noteDataContent: state?.noteData ? Object.keys(state.noteData).map(key => ({
              key,
              hasData: !!state.noteData[key],
              dataLength: state.noteData[key]?.length || 0
            })) : []
          });
          
          // If store is empty but backup exists, suggest recovery
          if (state && (!state.noteData || Object.keys(state.noteData).length === 0)) {
            try {
              const backupData = localStorage.getItem('zyra-canvas-storage-backup');
              if (backupData) {
                const parsed = JSON.parse(backupData);
                if (parsed.noteData && Object.keys(parsed.noteData).length > 0) {
                  console.warn("Store is empty but backup data exists. Consider refreshing the page to recover data.");
                }
              }
            } catch {
              // Ignore backup check errors
            }
          }
        }
      },
    }
  )
);

// Factory function to create canvas-specific node store
export const createNodeStore = (canvasId: string) => {
  const storeName = `zyra-canvas-storage-${canvasId}`;
  
  return create<NodeStore>()(persist(
    (set) => ({
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
