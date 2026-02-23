import { create } from 'zustand';

const useNodes = create<{
  initialNodes: {
    id: string;
    position: { x: number; y: number };
    data: { label: string };
    source: string;
    target: string;
  }[];
  setNodes: (
    nodes: {
      id: string;
      position: { x: number; y: number };
      data: { label: string };
      source: string;
      target: string;
    }[],
  ) => void;
  addNodes: (
    nodes: {
      id: string;
      position: { x: number; y: number };
      data: { label: string };
      source: string;
      target: string;
    }[],
  ) => void;
}>((set) => ({
  initialNodes: [
    {
      id: 'n1',
      position: { x: 0, y: 0 },
      data: { label: 'Node 1' },
      source: 'n1',
      target: 'n2',
    },
    {
      id: 'n2',
      position: { x: 0, y: 100 },
      data: { label: 'Node 2' },
      source: 'n2',
      target: 'n3',
    },
  ],
  setNodes: (
    nodes: {
      id: string;
      position: { x: number; y: number };
      data: { label: string };
      source: string;
      target: string;
    }[],
  ) => set({ initialNodes: nodes }),
  addNodes: (
    nodes: {
      id: string;
      position: { x: number; y: number };
      data: { label: string };
      source: string;
      target: string;
    }[],
  ) => set((state) => ({ initialNodes: [...state.initialNodes, ...nodes] })),
}));

export default useNodes;
