import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, Message, Canvas, PDF } from '@/generated/prisma';

// Type definitions
interface CanvasData extends Canvas {
  messages: Message[];
  notes: Note[];
  PDFs: PDF[];
}

interface UpdateCanvasParams {
  canvasId: string;
  nodes?: unknown;
  edges?: unknown;
}

interface CreateNoteParams {
  canvasId: string;
  nodeId: string;
  content: string;
}

interface UpdateNoteParams {
  canvasId: string;
  nodeId: string;
  content: string;
}

interface DeleteNoteParams {
  canvasId: string;
  nodeId: string;
}

interface CreateMessageParams {
  canvasId: string;
  nodeId: string;
  content: string;
  role: 'user' | 'assistant';
}

interface DeleteMessagesParams {
  canvasId: string;
  nodeId: string;
}

interface CreatePDFParams {
  canvasId: string;
  blockId: string;
  file: File;
}

interface DeletePDFParams {
  canvasId: string;
  blockId: string;
}

// Query keys
export const canvasKeys = {
  all: ['canvases'] as const,
  detail: (id: string) => [...canvasKeys.all, id] as const,
  notes: (canvasId: string) => ['notes', canvasId] as const,
  messages: (canvasId: string) => ['messages', canvasId] as const,
};

/**
 * Hook to fetch canvas data including nodes, edges, notes, and messages
 */
export function useCanvasData(canvasId: string) {
  return useQuery<CanvasData>({
    queryKey: canvasKeys.detail(canvasId),
    queryFn: async () => {
      const response = await fetch(`/api/canvases/${canvasId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch canvas');
      }
      return response.json();
    },
    enabled: !!canvasId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update canvas (nodes/edges)
 */
export function useUpdateCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ canvasId, nodes, edges }: UpdateCanvasParams) => {
      const response = await fetch(`/api/canvases/${canvasId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error('Failed to update canvas');
      }

      return response.json();
    },
    onMutate: async ({ canvasId, nodes, edges }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: canvasKeys.detail(canvasId) });

      // Snapshot previous value
      const previousCanvas = queryClient.getQueryData<CanvasData>(canvasKeys.detail(canvasId));

      // Optimistically update to the new value
      if (previousCanvas) {
        queryClient.setQueryData<CanvasData>(canvasKeys.detail(canvasId), {
          ...previousCanvas,
          nodes: nodes ?? previousCanvas.nodes,
          edges: edges ?? previousCanvas.edges,
        });
      }

      return { previousCanvas };
    },
    onError: (_err, { canvasId }, context) => {
      // Rollback on error
      if (context?.previousCanvas) {
        queryClient.setQueryData(canvasKeys.detail(canvasId), context.previousCanvas);
      }
    },
    onSettled: (_data, _error, { canvasId }) => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: canvasKeys.detail(canvasId) });
    },
  });
}

/**
 * Hook to create a new note
 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ canvasId, nodeId, content }: CreateNoteParams) => {
      const response = await fetch(`/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasId, noteId: nodeId, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      return response.json();
    },
    onSuccess: (_data, { canvasId }) => {
      // Invalidate canvas query to refetch with new note
      queryClient.invalidateQueries({ queryKey: canvasKeys.detail(canvasId) });
    },
  });
}

/**
 * Hook to update note content
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ canvasId, nodeId, content }: UpdateNoteParams) => {
      const response = await fetch(`/api/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasId, noteId: nodeId, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      return response.json();
    },
    onMutate: async ({ canvasId, nodeId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: canvasKeys.detail(canvasId) });

      // Snapshot previous value
      const previousCanvas = queryClient.getQueryData<CanvasData>(canvasKeys.detail(canvasId));

      // Optimistically update note content
      if (previousCanvas) {
        const updatedNotes = previousCanvas.notes.map(note =>
          note.id === nodeId ? { ...note, content } : note
        );
        queryClient.setQueryData<CanvasData>(canvasKeys.detail(canvasId), {
          ...previousCanvas,
          notes: updatedNotes,
        });
      }

      return { previousCanvas };
    },
    onError: (_err, { canvasId }, context) => {
      // Rollback on error
      if (context?.previousCanvas) {
        queryClient.setQueryData(canvasKeys.detail(canvasId), context.previousCanvas);
      }
    },
  });
}

/**
 * Hook to delete a note
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ canvasId, nodeId }: DeleteNoteParams) => {
      const response = await fetch(`/api/notes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasId, noteId: nodeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      return response.json();
    },
    onSuccess: (_data, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: canvasKeys.detail(canvasId) });
    },
  });
}

/**
 * Hook to create a message
 */
export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ canvasId, nodeId, content, role }: CreateMessageParams) => {
      const response = await fetch(`/api/canvases/${canvasId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId: nodeId, content, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to create message');
      }

      return response.json();
    },
    onMutate: async ({ canvasId, nodeId, content, role }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: canvasKeys.detail(canvasId) });

      // Snapshot previous value
      const previousCanvas = queryClient.getQueryData<CanvasData>(canvasKeys.detail(canvasId));

      // Optimistically add message
      if (previousCanvas) {
        const newMessage: Message = {
          id: `temp-${Date.now()}`,
          canvasId,
          blockId: nodeId,
          role: role === 'user' ? 'user' : 'assistant',
          content,
          createdAt: new Date(),
        };
        queryClient.setQueryData<CanvasData>(canvasKeys.detail(canvasId), {
          ...previousCanvas,
          messages: [...previousCanvas.messages, newMessage],
        });
      }

      return { previousCanvas };
    },
    onError: (_err, { canvasId }, context) => {
      // Rollback on error
      if (context?.previousCanvas) {
        queryClient.setQueryData(canvasKeys.detail(canvasId), context.previousCanvas);
      }
    },
    onSettled: (_data, _error, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: canvasKeys.detail(canvasId) });
    },
  });
}

/**
 * Helper hook to get notes for a specific canvas from cache
 */
export function useNotesFromCache(canvasId: string) {
  const queryClient = useQueryClient();
  const canvasData = queryClient.getQueryData<CanvasData>(canvasKeys.detail(canvasId));
  return canvasData?.notes || [];
}

/**
 * Helper hook to get messages for a specific canvas from cache
 */
export function useMessagesFromCache(canvasId: string) {
  const queryClient = useQueryClient();
  const canvasData = queryClient.getQueryData<CanvasData>(canvasKeys.detail(canvasId));
  return canvasData?.messages || [];
}

/**
 * Helper to get note content by nodeId
 */
export function useNoteContent(canvasId: string, nodeId: string) {
  const notes = useNotesFromCache(canvasId);
  const note = notes.find(n => n.id === nodeId);
  return note?.content || '';
}

/**
 * Helper to get messages for a specific node (chatBlock)
 */
export function useNodeMessages(canvasId: string) {
  const messages = useMessagesFromCache(canvasId);
  // In the future, you might want to filter messages by nodeId if you add that field
  // For now, returning all messages as per current schema
  return messages;
}

/**
 * Hook to delete all messages for a specific block/node
 */
export function useDeleteMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ canvasId, nodeId }: DeleteMessagesParams) => {
      const response = await fetch(`/api/canvases/${canvasId}/messages`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId: nodeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete messages');
      }

      return response.json();
    },
    onMutate: async ({ canvasId, nodeId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: canvasKeys.detail(canvasId) });

      // Snapshot previous value
      const previousCanvas = queryClient.getQueryData<CanvasData>(canvasKeys.detail(canvasId));

      // Optimistically remove messages for this block
      if (previousCanvas) {
        queryClient.setQueryData<CanvasData>(canvasKeys.detail(canvasId), {
          ...previousCanvas,
          messages: previousCanvas.messages.filter(m => m.blockId !== nodeId),
        });
      }

      return { previousCanvas };
    },
    onError: (_err, { canvasId }, context) => {
      // Rollback on error
      if (context?.previousCanvas) {
        queryClient.setQueryData(canvasKeys.detail(canvasId), context.previousCanvas);
      }
    },
    onSettled: (_data, _error, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: canvasKeys.detail(canvasId) });
    },
  });
}

/**
 * Hook to create/upload a PDF
 */
export function useCreatePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ canvasId, blockId, file }: CreatePDFParams) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('canvasId', canvasId);
      formData.append('blockId', blockId);

      const response = await fetch('/api/pdfs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to upload PDF');
      }

      return response.json();
    },
    onSuccess: (_data, { canvasId }) => {
      // Invalidate canvas query to refetch with new PDF
      queryClient.invalidateQueries({ queryKey: canvasKeys.detail(canvasId) });
    },
  });
}

/**
 * Hook to delete a PDF
 */
export function useDeletePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ canvasId, blockId }: DeletePDFParams) => {
      const response = await fetch('/api/pdfs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasId, blockId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete PDF');
      }

      return response.json();
    },
    onSuccess: (_data, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: canvasKeys.detail(canvasId) });
    },
  });
}

/**
 * Helper hook to get PDFs for a specific canvas from cache
 */
export function usePDFsFromCache(canvasId: string) {
  const queryClient = useQueryClient();
  const canvasData = queryClient.getQueryData<CanvasData>(canvasKeys.detail(canvasId));
  return canvasData?.PDFs || [];
}

/**
 * Helper to get PDF content (extracted text) by blockId
 */
export function usePDFContent(canvasId: string, blockId: string) {
  const pdfs = usePDFsFromCache(canvasId);
  const pdf = pdfs.find(p => p.blockId === blockId);
  return pdf?.extractedText || '';
}

