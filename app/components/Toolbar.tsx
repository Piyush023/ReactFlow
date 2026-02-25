'use client';

import useFlowStore from '../store/useFlowStore';
import { FlowNode } from '../types/flow';

const Toolbar = () => {
  const { addNode } = useFlowStore();

  const nodeTypes: { type: FlowNode['type']; label: string; icon: string; color: string }[] = [
    { type: 'message', label: 'Message', icon: '💬', color: 'bg-blue-500 hover:bg-blue-600' },
    { type: 'question', label: 'Question', icon: '❓', color: 'bg-purple-500 hover:bg-purple-600' },
    { type: 'set_variable', label: 'Set Variable', icon: '📝', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { type: 'condition', label: 'Condition', icon: '🔀', color: 'bg-orange-500 hover:bg-orange-600' },
    { type: 'api', label: 'API Call', icon: '🌐', color: 'bg-red-500 hover:bg-red-600' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3 className="text-sm font-bold text-gray-800 mb-3">Add Node</h3>
      <div className="flex flex-col gap-2">
        {nodeTypes.map((nodeType) => (
          <button
            key={nodeType.type}
            onClick={() => addNode(nodeType.type)}
            className={`flex items-center gap-2 px-3 py-2 ${nodeType.color} text-white text-sm rounded transition-colors`}
          >
            <span className="text-lg">{nodeType.icon}</span>
            <span>{nodeType.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
