'use client'

import React, { useState } from 'react';
import { useCallback, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Controls, Background, ConnectionMode, useReactFlow, ReactFlowProvider, NodeChange, EdgeChange, Connection, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FaRegNoteSticky } from "react-icons/fa6";
import { RiGeminiFill } from "react-icons/ri";
import { FileText, ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

import NodePalette from './NodePalette';
import { useNodeStore } from '@/lib/store/store';
import ChatBlock from '../blocks/chatBlock';
import NoteBlock from '../blocks/noteBlock';
import PdfBlock from '../blocks/pdfBlock';
import { useUpdateCanvas } from '@/hooks/useCanvasQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
// import { authOptions } from '@/lib/auth';


 
interface CanvasInnerProps {
  title: string;
  onTitleChange: (title: string) => void;
}

function CanvasInner({ title, onTitleChange }: CanvasInnerProps) {
  const router = useRouter();
  const { fitView } = useReactFlow();
  const { nodes, setNodes , edges, setEdges, canvasId} = useNodeStore();
  const updateCanvasMutation = useUpdateCanvas();
  const hasInitialized = React.useRef(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const { data: session, status } = useSession();
 
  // Debounce nodes and edges for auto-save
  const debouncedNodes = useDebounce(nodes, 500);
  const debouncedEdges = useDebounce(edges, 500);

  // Sync edited title with prop
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Mark as initialized after first render with canvasId
  useEffect(() => {
    if (canvasId && !hasInitialized.current) {
      // Wait a bit to ensure data is loaded before marking as initialized
      const timer = setTimeout(() => {
        hasInitialized.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [canvasId]);

  // Auto-save canvas when nodes or edges change (after initialization)
  useEffect(() => {
    if (canvasId && hasInitialized.current) {
      updateCanvasMutation.mutate({
        canvasId,
        nodes: debouncedNodes,
        edges: debouncedEdges,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNodes, debouncedEdges, canvasId]);
 
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [setEdges],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [setEdges],
  );

  useEffect(() => {
    if (nodes.length > 0) {
      const t = setTimeout(() => fitView({ padding: 0.5 }), 100);
      return () => clearTimeout(t);
    }
  }, [nodes, fitView]);
  
  // Title editing handlers
  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      onTitleChange(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditingTitle(false);
    }
  };

  const handleBackClick = () => {
    router.push(`/myCanvases/${session?.user?.id || '/'}`);
  };

  /* Node Pallete */
  const nodePalette = [
    {
      id: 'noteBlock',
      type: 'noteBlock',
      label: 'Note',
      icon: <FaRegNoteSticky />,
    },
    {
        id: 'chatBlock',
        type: 'chatBlock',
        label: 'AI',
        icon: <RiGeminiFill />,
    },
    {
        id: 'pdfBlock',
        type: 'pdfBlock',
        label: 'PDF',
        icon: <FileText />,
    },
  ];
 
  const nodeTypes = {
    noteBlock: NoteBlock,
    chatBlock: ChatBlock,
    pdfBlock: PdfBlock,
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Title Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackClick}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {isEditingTitle ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="flex-1 text-lg font-semibold px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <h1
            onClick={handleTitleClick}
            className="flex-1 text-lg font-semibold cursor-pointer hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50"
          >
            {title}
          </h1>
        )}
      </div>

      {/* Canvas Area */}
      <div style={{ width: '100vw', height: 'calc(100vh - 3.5rem)', marginTop: '3.5rem', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes as NodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          fitViewOptions={{
            padding: 0.5,
          }}
          defaultEdgeOptions={{
            type: 'step',
          }}
          
        >
          <Background />
          <Controls />
        </ReactFlow>
        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
          <NodePalette nodePalette={nodePalette} />
        </div>
      </div>
    </div>
  );
}

export default function Canvas({ title, onTitleChange }: CanvasInnerProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner title={title} onTitleChange={onTitleChange} />
    </ReactFlowProvider>
  );
}