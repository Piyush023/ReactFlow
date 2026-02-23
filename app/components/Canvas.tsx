'use client';
import { useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  applyEdgeChanges,
  // applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useNodes from '../hooks/useNodesHook';

const Canvas = () => {
  const { initialNodes } = useNodes();

  const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onEdgeChange = () => {
    setEdges((e) => applyEdgeChanges(e, edges));
  };

  // const onNodesChange = () => {
  //   setNodes((n) => applyNodeChanges(n, nodes));
  // };

  console.log(nodes, 'nodes');

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgeChange}
        // onNodesChange={onNodesChange}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} color='white' />
        <Controls />
        <Panel position='top-left'>top-left</Panel>
      </ReactFlow>
    </div>
  );
};

export default Canvas;
