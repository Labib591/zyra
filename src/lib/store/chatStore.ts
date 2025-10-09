import { create } from "zustand";

interface ChatStore {
  nodeLoadingStates: Record<string, boolean>;
  isLoading: (nodeId: string) => boolean;
  setIsLoading: (nodeId: string, loading: boolean) => void;
  clearNodeLoading: (nodeId: string) => void;
}

// UI state only - loading states for chat nodes
export const useChatStore = create<ChatStore>()((set, get) => ({
  nodeLoadingStates: {},
  isLoading: (nodeId: string) => {
    const state = get();
    return state.nodeLoadingStates[nodeId] || false;
  },
  setIsLoading: (nodeId: string, loading: boolean) =>
    set((state) => ({
      nodeLoadingStates: {
        ...state.nodeLoadingStates,
        [nodeId]: loading
      }
    })),
  clearNodeLoading: (nodeId: string) =>
    set((state) => {
      const newNodeLoadingStates = { ...state.nodeLoadingStates };
      delete newNodeLoadingStates[nodeId];
      return {
        nodeLoadingStates: newNodeLoadingStates
      };
    }),
}));
