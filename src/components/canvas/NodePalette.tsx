export default function NodePalette({ nodePalette }: { nodePalette: any[] }) {
  return (
    <div className='w-full h-full flex flex-col items-end justify-end px-10 py-20 gap-2 bg-white'>
      {nodePalette.map((node) => (
        <div key={node.id} className='flex flex-col items-center justify-center gap-2 border-2 border-gray-200 rounded-md p-2'>
            <div className='w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center' key={node.id}>{node.icon}</div>
            {/* <div className='text-sm text-gray-500'>{node.label}</div> */}
        </div>
      ))}
    </div>
  );
}   