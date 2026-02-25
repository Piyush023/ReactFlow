'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useFlowStore from '../store/useFlowStore';
import { validateFlow } from '../utils/validate';
import { exportToJson, importFromJson } from '../utils/exportJson';
import { useRef, useEffect, useMemo } from 'react';

const JsonPreview = () => {
  const { nodes, edges, loadFlowData, setValidationErrors } = useFlowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const flowData = useMemo(() => ({
    nodes: nodes.map((node) => node.data),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: typeof edge.label === 'string' ? edge.label : undefined,
    })),
  }), [nodes, edges]);
  
  const jsonString = JSON.stringify(flowData, null, 2);

  useEffect(() => {
    const errors = validateFlow(flowData.nodes, flowData.edges);
    setValidationErrors(errors);
  }, [flowData.nodes, flowData.edges, setValidationErrors]);

  const handleExport = () => {
    exportToJson(flowData, `workflow-${Date.now()}.json`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromJson(file);
      loadFlowData(data);
      alert('Workflow imported successfully!');
    } catch (error) {
      alert(`Failed to import workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validationErrors = validateFlow(flowData.nodes, flowData.edges);
  const hasErrors = validationErrors.length > 0;

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white mb-4">JSON Preview</h2>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleExport}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Export
          </button>
          <button
            onClick={triggerFileInput}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Import
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {hasErrors && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded text-xs">
            <p className="text-red-200 font-semibold mb-2">
              ⚠️ {validationErrors.length} Validation {validationErrors.length === 1 ? 'Error' : 'Errors'}
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {validationErrors.map((error, idx) => (
                <p key={idx} className="text-red-300">
                  • {error.message}
                </p>
              ))}
            </div>
          </div>
        )}

        {!hasErrors && (
          <div className="p-3 bg-green-900/50 border border-green-700 rounded">
            <p className="text-green-200 text-xs font-semibold">
              ✓ Workflow is valid
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.75rem',
            background: 'transparent',
          }}
        >
          {jsonString}
        </SyntaxHighlighter>
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-400">
          <p>Nodes: {flowData.nodes.length}</p>
          <p>Edges: {flowData.edges.length}</p>
        </div>
      </div>
    </div>
  );
};

export default JsonPreview;
