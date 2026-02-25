import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';

export type NodeType = 'message' | 'question' | 'set_variable' | 'condition' | 'api' | 'start';

export interface FlowNode extends Record<string, unknown> {
  id: string;
  type: NodeType;
  name: string;
  position: { x: number; y: number };
  isStart?: boolean;
  
  message?: string;
  
  question?: string;
  variable?: string;
  
  variableName?: string;
  value?: string;
  
  condition?: string;
  
  apiEndpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export type ReactFlowNodeType = ReactFlowNode<FlowNode>;
export type ReactFlowEdgeType = ReactFlowEdge<{ label?: string }>;

export interface ValidationError {
  nodeId: string;
  field: string;
  message: string;
}
