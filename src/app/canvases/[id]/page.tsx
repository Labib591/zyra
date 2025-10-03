'use client'
import NoteBlock from '@/components/blocks/noteBlock';
import Canvas from '@/components/canvas/Canvas';

const nodes = [
  { id: 'n2', position: { x: 100, y: 200 }, data: { label: 'Node 2' }, type: 'noteBlock' },
];
// const edges = [{ id: 'n1-n2', source: 'n1', target: 'n3' , type: 'step' }];

const testNodeTypes = {
  noteBlock: NoteBlock,
} as any

export default function CanvasPage() {
  return <Canvas initialNodes={nodes} initialEdges={[]} testNodeTypes={testNodeTypes} />;
}