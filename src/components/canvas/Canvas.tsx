'use client'

import React from 'react';
import { useCallback, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Controls, Background, ConnectionMode, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FaRegNoteSticky } from "react-icons/fa6";
import { RiGeminiFill } from "react-icons/ri";

import NodePalette from './NodePalette';
import { useNodeStore } from '@/lib/store/store';
import ChatBlock from '../blocks/chatBlock';
import NoteBlock from '../blocks/noteBlock';


 
function CanvasInner() {
  const { fitView } = useReactFlow();
  const { nodes, setNodes , edges, setEdges} = useNodeStore();
 
  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot: any[]) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot: any[]) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot: any[]) => addEdge(params, edgesSnapshot)),
    [],
  );

  useEffect(() => {
    if (nodes.length > 0) {
      const t = setTimeout(() => fitView({ padding: 0.5 }), 100);
      return () => clearTimeout(t);
    }
  }, [nodes, fitView]);
  


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
  ];
 
  const nodeTypes = {
    noteBlock: NoteBlock,
    chatBlock: ChatBlock,
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
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
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}