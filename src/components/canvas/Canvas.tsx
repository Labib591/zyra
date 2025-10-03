'use client'

import React from 'react';
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Controls, Background, ConnectionMode } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FaRegNoteSticky } from "react-icons/fa6";
import { RiGeminiFill } from "react-icons/ri";

import NodePalette from './NodePalette';


 
export default function Canvas({ initialNodes, initialEdges, testNodeTypes }: { initialNodes: any[], initialEdges: any[], testNodeTypes: any[] }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
 
  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  /* Node Pallete */
  const nodePalette = [
    {
      id: 'noteBlock',
      type: 'noteBlock',
      label: 'Note',
      icon: <FaRegNoteSticky />,
    },
    {
        id: 'aiBlock',
        type: 'aiBlock',
        label: 'AI',
        icon: <RiGeminiFill />,
    },
  ];
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={testNodeTypes as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // connectionMode={ConnectionMode.Loose}
        fitView
        
      >
        <Background />
        <Controls />
        <NodePalette nodePalette={nodePalette} />
      </ReactFlow>
    </div>
  );
}