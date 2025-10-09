'use client'
import Canvas from '@/components/canvas/Canvas';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNodeStore } from '@/lib/store/store';
import { useCanvasData } from '@/hooks/useCanvasQueries';

export default function CanvasPage() {
  const router = useRouter();
  const params = useParams();
  const { setNodes, setEdges, setCanvasId } = useNodeStore();
  
  const canvasId = params?.id as string;

  // Fetch canvas data with TanStack Query
  const { data: canvas, isLoading, error } = useCanvasData(canvasId);

  // Hydrate Zustand store when canvas data is loaded
  useEffect(() => {
    if (canvas && canvasId) {
      setCanvasId(canvasId);
      setNodes(canvas.nodes as never[] || []);
      setEdges(canvas.edges as never[] || []);
    }
  }, [canvas, canvasId, setCanvasId, setNodes, setEdges]);

  // Handle authentication redirect
  useEffect(() => {
    if (error && 'status' in (error as Error) && (error as unknown as { status: number }).status === 401) {
      router.push('/login');
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading canvas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-lg text-red-500">
          {error instanceof Error ? error.message : 'Failed to load canvas'}
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  return <Canvas />;
}