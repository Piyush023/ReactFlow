'use client';

import { useEffect } from 'react';
import useFlowStore from '../store/useFlowStore';
import { FlowNode } from '../types/flow';
import { getNodeErrors } from '../utils/validate';

const Sidebar = () => {
  const { selectedNodeId, nodes, updateNode, deleteNode, validationErrors } = useFlowStore();
  
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const nodeData = selectedNode?.data;
  const errors = selectedNodeId ? getNodeErrors(selectedNodeId, validationErrors) : [];

  const handleUpdate = (field: keyof FlowNode, value: string | boolean) => {
    if (selectedNodeId) {
      updateNode(selectedNodeId, { [field]: value });
    }
  };

  const handleDelete = () => {
    if (selectedNodeId && confirm('Are you sure you want to delete this node?')) {
      deleteNode(selectedNodeId);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && selectedNodeId !== 'start-node') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          deleteNode(selectedNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, deleteNode]);

  if (!nodeData) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No node selected</p>
          <p className="text-sm">Click on a node to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Edit Node</h2>
        <p className="text-sm text-gray-600">{nodeData.type.toUpperCase().replace('_', ' ')}</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm font-semibold text-red-800 mb-1">Validation Errors:</p>
          {errors.map((error, idx) => (
            <p key={idx} className="text-xs text-red-600">• {error.message}</p>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nodeData.name}
            onChange={(e) => handleUpdate('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter node name"
            disabled={nodeData.isStart}
          />
        </div>

        {nodeData.type === 'message' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={nodeData.message || ''}
              onChange={(e) => handleUpdate('message', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter message text"
            />
          </div>
        )}

        {nodeData.type === 'question' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                value={nodeData.question || ''}
                onChange={(e) => handleUpdate('question', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter question text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variable Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nodeData.variable || ''}
                onChange={(e) => handleUpdate('variable', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., user_name"
              />
            </div>
          </>
        )}

        {nodeData.type === 'set_variable' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variable Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nodeData.variableName || ''}
                onChange={(e) => handleUpdate('variableName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., counter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nodeData.value || ''}
                onChange={(e) => handleUpdate('value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter value or expression"
              />
            </div>
          </>
        )}

        {nodeData.type === 'condition' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition <span className="text-red-500">*</span>
            </label>
            <textarea
              value={nodeData.condition || ''}
              onChange={(e) => handleUpdate('condition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="e.g., age > 18"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use variable names and comparison operators
            </p>
          </div>
        )}

        {nodeData.type === 'api' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Endpoint <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nodeData.apiEndpoint || ''}
                onChange={(e) => handleUpdate('apiEndpoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method <span className="text-red-500">*</span>
              </label>
              <select
                value={nodeData.method || 'GET'}
                onChange={(e) => handleUpdate('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Body (JSON)
              </label>
              <textarea
                value={nodeData.body || ''}
                onChange={(e) => handleUpdate('body', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                rows={4}
                placeholder='{"key": "value"}'
              />
            </div>
          </>
        )}

        {!nodeData.isStart && (
          <button
            onClick={handleDelete}
            className="w-full mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Delete Node
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
