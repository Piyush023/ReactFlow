import { create } from 'zustand';
import { FlowNode, FlowEdge, ReactFlowNodeType, ReactFlowEdgeType, ValidationError } from '../types/flow';
import { applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, addEdge, Connection } from '@xyflow/react';

interface FlowStore {
  nodes: ReactFlowNodeType[];
  edges: ReactFlowEdgeType[];
  selectedNodeId: string | null;
  validationErrors: ValidationError[];
  
  setNodes: (nodes: ReactFlowNodeType[] | ((nodes: ReactFlowNodeType[]) => ReactFlowNodeType[])) => void;
  setEdges: (edges: ReactFlowEdgeType[] | ((edges: ReactFlowEdgeType[]) => ReactFlowEdgeType[])) => void;
  
  onNodesChange: (changes: NodeChange<ReactFlowNodeType>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addNode: (type: FlowNode['type']) => void;
  updateNode: (id: string, data: Partial<FlowNode>) => void;
  deleteNode: (id: string) => void;
  
  selectNode: (id: string | null) => void;
  
  getFlowData: () => { nodes: FlowNode[]; edges: FlowEdge[] };
  loadFlowData: (data: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
  
  setValidationErrors: (errors: ValidationError[]) => void;
}

const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [
    {
      id: 'start-node',
      type: 'default',
      position: { x: 250, y: 50 },
      data: {
        id: 'start-node',
        type: 'start',
        name: 'Start',
        position: { x: 250, y: 50 },
        isStart: true,
      },
    },
  ],
  edges: [],
  selectedNodeId: null,
  validationErrors: [],

  setNodes: (nodes) => {
    if (typeof nodes === 'function') {
      set((state) => ({ nodes: nodes(state.nodes) }));
    } else {
      set({ nodes });
    }
  },

  setEdges: (edges) => {
    if (typeof edges === 'function') {
      set((state) => ({ edges: edges(state.edges) }));
    } else {
      set({ edges });
    }
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },

  addNode: (type) => {
    const newNode: ReactFlowNodeType = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        id: `node-${Date.now()}`,
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        position: { x: 0, y: 0 },
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
    }));
  },

  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
  },

  deleteNode: (id) => {
    if (id === 'start-node') return;
    
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  getFlowData: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((node) => node.data),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === 'string' ? edge.label : undefined,
      })),
    };
  },

  loadFlowData: (data) => {
    const nodes: ReactFlowNodeType[] = data.nodes.map((node) => ({
      id: node.id,
      type: 'default',
      position: node.position,
      data: node,
    }));

    const edges: ReactFlowEdgeType[] = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
    }));

    set({ nodes, edges, selectedNodeId: null });
  },

  setValidationErrors: (errors) => {
    set({ validationErrors: errors });
  },
}));

export default useFlowStore;
