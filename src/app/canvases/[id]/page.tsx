'use client'
import Canvas from '@/components/canvas/Canvas';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNodeStore } from '@/lib/store/store';

export default function CanvasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { setNodes, setEdges } = useNodeStore();
  
  const canvasId = params?.id as string;

  useEffect(() => {
    if (!canvasId) return;

    const fetchCanvas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/canvases/${canvasId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Canvas not found');
            setLoading(false);
          } else if (response.status === 403) {
            setError('You do not have permission to view this canvas');
            setLoading(false);
          } else if (response.status === 401) {
            router.push('/login');
            return;
          } else {
            setError('Failed to load canvas');
          }
          return;
        }

        const canvas = await response.json();
        
        // Load canvas data into the store
        setNodes(canvas.nodes || []);
        setEdges(canvas.edges || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching canvas:', err);
        setError('Failed to load canvas');
        setLoading(false);
      }
    };

    fetchCanvas();
  }, [canvasId, router, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading canvas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-lg text-red-500">{error}</div>
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