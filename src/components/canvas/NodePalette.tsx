"use client";
// import { Node } from "@/lib/types/types";
import type { NodePalette } from "@/lib/types/types";
import { useNodeStore } from "@/lib/store/store";

export default function NodePalette({
  nodePalette,
}: {
  nodePalette: NodePalette[];
}) {
  const { setNodes } = useNodeStore();

  const onTapAddNode = (node: NodePalette) => {
    const newNode = {
      id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: node.label, content: "" },
      type: node.type,
    };
    
    setNodes((nodes) => [...nodes, newNode]);
    console.log("Button clicked!", node.label, "New node:", newNode);
  };

  return (
    <div className="w-full h-full flex flex-col items-end justify-end px-10 py-20 gap-2 bg-transparent">
      {nodePalette.map((node) => (
        <button
          key={node.id}
          onClick={() => onTapAddNode(node)}
          className="flex flex-col items-center justify-center gap-2 border-2 border-gray-200 rounded-md p-2 hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
            {node.icon}
          </div>
        </button>
      ))}
    </div>
  );
}
