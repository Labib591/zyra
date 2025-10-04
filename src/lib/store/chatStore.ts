import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatStore {
  nodeChats: Record<string, Message[]>;
  nodeLoadingStates: Record<string, boolean>;
  getMessages: (nodeId: string) => Message[];
  initializeNodeChat: (nodeId: string) => void;
  addMessage: (nodeId: string, message: Message) => void;
  isLoading: (nodeId: string) => boolean;
  setIsLoading: (nodeId: string, loading: boolean) => void;
  clearNodeChat: (nodeId: string) => void;
}

const getInitialMessage = (): Message => ({
  id: Math.random().toString(36).substring(2, 15),
  role: "assistant",
  content: "Hello! I'm your AI assistant. How can I help you today?",
  timestamp: new Date(),
});

export const useChatStore = create<ChatStore>()(persist(
  (set, get) => ({
  nodeChats: {},
  nodeLoadingStates: {},
  getMessages: (nodeId: string) => {
    const state = get();
    if (!state.nodeChats[nodeId]) {
      // Return empty array if not initialized - initialization will happen elsewhere
      return [];
    }
    return state.nodeChats[nodeId];
  },
  initializeNodeChat: (nodeId: string) => {
    const state = get();
    if (!state.nodeChats[nodeId]) {
      set((state) => ({
        nodeChats: {
          ...state.nodeChats,
          [nodeId]: [getInitialMessage()]
        }
      }));
    }
  },
  addMessage: (nodeId: string, message: Message) =>
    set((state) => ({
      nodeChats: {
        ...state.nodeChats,
        [nodeId]: [...(state.nodeChats[nodeId] || []), message]
      }
    })),
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
  clearNodeChat: (nodeId: string) =>
    set((state) => {
      const newNodeChats = { ...state.nodeChats };
      const newNodeLoadingStates = { ...state.nodeLoadingStates };
      delete newNodeChats[nodeId];
      delete newNodeLoadingStates[nodeId];
      return {
        nodeChats: newNodeChats,
        nodeLoadingStates: newNodeLoadingStates
      };
    }),
}), {
  name: "zyra-chat-storage",
  partialize: (state) => ({
    nodeChats: state.nodeChats,
    nodeLoadingStates: state.nodeLoadingStates,
  }),
  onRehydrateStorage: () => (state) => {
    if (state?.nodeChats) {
      // Convert timestamp strings back to Date objects
      Object.keys(state.nodeChats).forEach(nodeId => {
        state.nodeChats[nodeId] = state.nodeChats[nodeId].map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      });
    }
  },
}));
