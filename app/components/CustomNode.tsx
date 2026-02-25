'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

const CustomNode = memo((props: NodeProps) => {
  const { data, selected } = props;
  
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'bg-green-500';
      case 'message':
        return 'bg-blue-500';
      case 'question':
        return 'bg-purple-500';
      case 'set_variable':
        return 'bg-yellow-500';
      case 'condition':
        return 'bg-orange-500';
      case 'api':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start':
        return '▶️';
      case 'message':
        return '💬';
      case 'question':
        return '❓';
      case 'set_variable':
        return '📝';
      case 'condition':
        return '🔀';
      case 'api':
        return '🌐';
      default:
        return '📦';
    }
  };

  const nodeType = (data.type as string) || 'default';
  const nodeName = (data.name as string) || 'Node';
  const isStart = (data.isStart as boolean) || false;

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[180px] ${
        selected ? 'border-blue-600' : 'border-gray-300'
      } bg-white`}
    >
      {!isStart && (
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
      )}
      
      <div className="flex items-center gap-2">
        <span className="text-2xl">{getNodeIcon(nodeType)}</span>
        <div className="flex-1">
          <div className={`text-xs font-semibold ${getNodeColor(nodeType)} text-white px-2 py-1 rounded mb-1`}>
            {nodeType.toUpperCase().replace('_', ' ')}
          </div>
          <div className="text-sm font-medium text-gray-800 truncate">
            {nodeName}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
