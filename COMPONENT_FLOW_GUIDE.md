# Component Architecture & Flow Implementation

## Overview

This document explains how each component works internally and how data flows through the application.

---

## Component Breakdown

### 1. Canvas.tsx - Main Orchestrator

**Purpose**: The root component that brings everything together

**Responsibility**: 
- Renders React Flow canvas
- Integrates Sidebar and JsonPreview panels
- Handles node selection and pane click events
- Configures custom node and edge types

**Key Code Flow**:
```typescript
const Canvas = () => {
  // 1. Get state from Zustand store
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode } = useFlowStore();
  
  // 2. Handle node selection
  const handleNodeClick = (event, node) => selectNode(node.id);
  
  // 3. Handle deselection (click empty canvas)
  const handlePaneClick = () => selectNode(null);
  
  // 4. Render React Flow with custom types
  return (
    <ReactFlow
      nodes={nodes}              // From store
      edges={edges}              // From store
      onNodesChange={onNodesChange}  // Updates positions when dragged
      onEdgesChange={onEdgesChange}  // Updates when edges are deleted
      onConnect={onConnect}          // Creates new edges when connected
      nodeTypes={nodeTypes}          // Custom node renderer
      edgeTypes={edgeTypes}          // Custom edge renderer
    >
      <Background />
      <Controls />
      <Toolbar />
    </ReactFlow>
  );
};
```

**Data Flow**:
```
User drags node → React Flow → onNodesChange → Store → Re-render with new positions
User connects nodes → React Flow → onConnect → Store → New edge created
User clicks node → handleNodeClick → Store.selectNode(id) → Sidebar shows editor
```

---

### 2. CustomNode.tsx - Visual Node Renderer

**Purpose**: Renders each individual node on the canvas

**Props Received**:
```typescript
{
  id: string;              // Node ID
  data: Record<string, unknown>;  // Node data (type, name, message, etc.)
  selected: boolean;       // Whether this node is selected
  position: { x, y };      // Position on canvas
}
```

**Rendering Logic**:
```typescript
const CustomNode = (props) => {
  // 1. Extract data from props
  const { data, selected } = props;
  const nodeType = data.type;
  const nodeName = data.name;
  const isStart = data.isStart;
  
  // 2. Determine color based on type
  const color = getNodeColor(nodeType);  // e.g., 'bg-blue-500' for message
  
  // 3. Determine icon based on type
  const icon = getNodeIcon(nodeType);    // e.g., '💬' for message
  
  // 4. Render node structure
  return (
    <div className={selected ? 'border-blue-600' : 'border-gray-300'}>
      {/* Top handle for incoming connections */}
      {!isStart && <Handle type="target" position={Position.Top} />}
      
      {/* Node content */}
      <div>
        <span>{icon}</span>
        <div>
          <div className={color}>{nodeType.toUpperCase()}</div>
          <div>{nodeName}</div>
        </div>
      </div>
      
      {/* Bottom handle for outgoing connections */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
```

**Color Mapping**:
| Type | Color | Icon |
|------|-------|------|
| start | Green | ▶️ |
| message | Blue | 💬 |
| question | Purple | ❓ |
| set_variable | Yellow | 📝 |
| condition | Orange | 🔀 |
| api | Red | 🌐 |

---

### 3. CustomEdge.tsx - Connection Line Renderer

**Purpose**: Renders the lines connecting nodes, with optional labels

**Props Received**:
```typescript
{
  id: string;
  sourceX, sourceY: number;      // Starting point coordinates
  targetX, targetY: number;      // Ending point coordinates
  sourcePosition: Position;      // 'top' | 'right' | 'bottom' | 'left'
  targetPosition: Position;
  label?: string;                // Optional text label (for conditions)
}
```

**Rendering Logic**:
```typescript
const CustomEdge = (props) => {
  // 1. Calculate smooth bezier curve path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });
  
  // 2. Render the path
  return (
    <>
      {/* The actual line */}
      <BaseEdge path={edgePath} />
      
      {/* Label badge (if label exists) */}
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect />           {/* White background */}
          <text>{label}</text>
        </g>
      )}
    </>
  );
};
```

**Why Bezier Curves?**
- Smooth, natural-looking curves
- Automatically adjust when nodes move
- React Flow provides `getBezierPath` helper

---

### 4. Sidebar.tsx - Node Editor Panel

**Purpose**: Display and edit properties of selected node

**State Dependencies**:
```typescript
const {
  selectedNodeId,      // Which node is selected (null if none)
  nodes,               // All nodes (to find selected node's data)
  updateNode,          // Function to update node data
  deleteNode,          // Function to delete node
  validationErrors     // Array of validation errors
} = useFlowStore();
```

**Rendering Logic**:
```typescript
const Sidebar = () => {
  // 1. Find selected node's data
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const nodeData = selectedNode?.data;
  
  // 2. Get errors for this node
  const errors = getNodeErrors(selectedNodeId, validationErrors);
  
  // 3. If no node selected, show placeholder
  if (!nodeData) {
    return <div>No node selected</div>;
  }
  
  // 4. Render form based on node type
  return (
    <div>
      {/* Common fields */}
      <input 
        value={nodeData.name}
        onChange={(e) => updateNode(selectedNodeId, { name: e.target.value })}
      />
      
      {/* Type-specific fields */}
      {nodeData.type === 'message' && (
        <textarea 
          value={nodeData.message}
          onChange={(e) => updateNode(selectedNodeId, { message: e.target.value })}
        />
      )}
      
      {nodeData.type === 'question' && (
        <>
          <textarea value={nodeData.question} ... />
          <input value={nodeData.variable} ... />
        </>
      )}
      
      {/* ... other types ... */}
      
      {/* Delete button */}
      <button onClick={() => deleteNode(selectedNodeId)}>Delete</button>
    </div>
  );
};
```

**Update Flow**:
```
User types in input → onChange event → updateNode(id, { field: value })
→ Store updates nodes array → React Flow re-renders node
→ JsonPreview updates → Validation runs
```

**Keyboard Shortcut**:
```typescript
useEffect(() => {
  const handleKeyDown = (e) => {
    // Delete/Backspace key pressed
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
      // Only if not typing in an input field
      if (document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        deleteNode(selectedNodeId);
      }
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedNodeId]);
```

---

### 5. JsonPreview.tsx - Live JSON Display & Validation

**Purpose**: Show live JSON representation and validation status

**State Dependencies**:
```typescript
const { getFlowData, loadFlowData, setValidationErrors } = useFlowStore();
```

**Key Features**:

**1. Live JSON Preview**:
```typescript
const flowData = getFlowData();           // Get current state as JSON
const jsonString = JSON.stringify(flowData, null, 2);  // Pretty-print

// Render with syntax highlighting
<SyntaxHighlighter language="json" style={vscDarkPlus}>
  {jsonString}
</SyntaxHighlighter>
```

**2. Real-time Validation**:
```typescript
useEffect(() => {
  const errors = validateFlow(flowData.nodes, flowData.edges);
  setValidationErrors(errors);
}, [flowData]);  // Runs whenever flow data changes
```

**3. Export Flow**:
```typescript
const handleExport = () => {
  // 1. Get current flow data
  const data = getFlowData();
  
  // 2. Convert to JSON string
  const jsonString = JSON.stringify(data, null, 2);
  
  // 3. Create Blob (in-memory file)
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // 4. Create download URL
  const url = URL.createObjectURL(blob);
  
  // 5. Create invisible link and click it
  const link = document.createElement('a');
  link.href = url;
  link.download = `workflow-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 6. Clean up
  URL.revokeObjectURL(url);
};
```

**4. Import Flow**:
```typescript
const handleImport = async (e) => {
  // 1. Get selected file
  const file = e.target.files[0];
  
  // 2. Read file content
  const reader = new FileReader();
  reader.onload = (e) => {
    // 3. Parse JSON
    const data = JSON.parse(e.target.result);
    
    // 4. Load into store
    loadFlowData(data);
  };
  reader.readAsText(file);
};
```

**Validation Display**:
```typescript
const validationErrors = validateFlow(flowData.nodes, flowData.edges);
const hasErrors = validationErrors.length > 0;

if (hasErrors) {
  return (
    <div className="bg-red-50 border-red-200">
      <p>⚠️ {validationErrors.length} Validation Errors</p>
      {validationErrors.map(error => (
        <p>• {error.message}</p>
      ))}
    </div>
  );
} else {
  return <div className="bg-green-50">✓ Workflow is valid</div>;
}
```

---

### 6. Toolbar.tsx - Add Node Buttons

**Purpose**: Quick access buttons to add different node types

**Implementation**:
```typescript
const Toolbar = () => {
  const { addNode } = useFlowStore();
  
  const nodeTypes = [
    { type: 'message', label: 'Message', icon: '💬', color: 'bg-blue-500' },
    { type: 'question', label: 'Question', icon: '❓', color: 'bg-purple-500' },
    // ... other types
  ];
  
  return (
    <div className="absolute top-4 left-4">
      {nodeTypes.map(nodeType => (
        <button 
          onClick={() => addNode(nodeType.type)}
          className={nodeType.color}
        >
          <span>{nodeType.icon}</span>
          <span>{nodeType.label}</span>
        </button>
      ))}
    </div>
  );
};
```

**Add Node Flow**:
```
User clicks "Add Message" button
→ Toolbar calls addNode('message')
→ Store creates new node with:
   - Unique ID (timestamp-based)
   - Random position
   - Default data { type: 'message', name: 'Message Node', message: '' }
→ Store adds node to nodes array
→ Store sets selectedNodeId to new node
→ React Flow renders new node
→ Sidebar shows edit form
```

---

## State Management (Zustand Store)

### Store Structure

```typescript
interface FlowStore {
  // Core state
  nodes: ReactFlowNodeType[];
  edges: ReactFlowEdgeType[];
  selectedNodeId: string | null;
  validationErrors: ValidationError[];
  
  // Actions
  setNodes: (nodes) => void;
  setEdges: (edges) => void;
  onNodesChange: (changes) => void;
  onEdgesChange: (changes) => void;
  onConnect: (connection) => void;
  addNode: (type) => void;
  updateNode: (id, data) => void;
  deleteNode: (id) => void;
  selectNode: (id) => void;
  getFlowData: () => { nodes, edges };
  loadFlowData: (data) => void;
  setValidationErrors: (errors) => void;
}
```

### Key Store Methods

**1. addNode** - Create new node:
```typescript
addNode: (type) => {
  const newNode = {
    id: `node-${Date.now()}`,
    type: 'default',
    position: { x: random(), y: random() },
    data: {
      id: `node-${Date.now()}`,
      type,
      name: `${type} Node`,
      // ... type-specific defaults
    }
  };
  
  set((state) => ({
    nodes: [...state.nodes, newNode],
    selectedNodeId: newNode.id
  }));
}
```

**2. updateNode** - Update node properties:
```typescript
updateNode: (id, data) => {
  set((state) => ({
    nodes: state.nodes.map(node =>
      node.id === id
        ? { ...node, data: { ...node.data, ...data } }  // Merge new data
        : node
    )
  }));
}
```

**3. deleteNode** - Remove node and connected edges:
```typescript
deleteNode: (id) => {
  if (id === 'start-node') return;  // Prevent deleting start node
  
  set((state) => ({
    nodes: state.nodes.filter(node => node.id !== id),
    edges: state.edges.filter(edge => 
      edge.source !== id && edge.target !== id  // Remove connected edges
    ),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
  }));
}
```

**4. onConnect** - Create edge when nodes are connected:
```typescript
onConnect: (connection) => {
  set((state) => ({
    edges: addEdge(connection, state.edges)  // React Flow helper
  }));
}
```

**5. getFlowData** - Convert to export format:
```typescript
getFlowData: () => {
  const { nodes, edges } = get();
  return {
    nodes: nodes.map(node => node.data),  // Extract just the data
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: typeof edge.label === 'string' ? edge.label : undefined
    }))
  };
}
```

**6. loadFlowData** - Import from JSON:
```typescript
loadFlowData: (data) => {
  const nodes = data.nodes.map(node => ({
    id: node.id,
    type: 'default',
    position: node.position,
    data: node  // Entire node becomes data
  }));
  
  const edges = data.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label
  }));
  
  set({ nodes, edges, selectedNodeId: null });
}
```

---

## Data Flow Diagrams

### 1. Adding a Node

```
┌─────────┐    click     ┌─────────┐   addNode()   ┌───────┐
│ Toolbar │ ──────────> │  Store  │ ────────────> │ Store │
└─────────┘              └─────────┘               │ State │
                                                   └───┬───┘
                                                       │
                                                       v
                            ┌──────────────────────────────────┐
                            │  nodes: [..., newNode]          │
                            │  selectedNodeId: newNode.id     │
                            └──────────┬───────────────────────┘
                                       │
                            ┌──────────v──────────┐
                            │   React Re-render   │
                            └──────────┬──────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        v                             v
                   ┌────────┐                    ┌─────────┐
                   │ Canvas │                    │ Sidebar │
                   │ (new   │                    │ (edit   │
                   │  node) │                    │  form)  │
                   └────────┘                    └─────────┘
```

### 2. Editing a Node

```
┌─────────┐   onChange   ┌─────────────┐  updateNode()  ┌───────┐
│ Sidebar │ ──────────> │  handleUpdate │ ──────────> │ Store │
│  Input  │              └──────────────┘              └───┬───┘
└─────────┘                                                 │
                                                            v
                              ┌─────────────────────────────────────┐
                              │ nodes: [..., updatedNode]          │
                              └─────────────┬───────────────────────┘
                                            │
                              ┌─────────────v─────────────┐
                              │     React Re-render       │
                              └─────────────┬─────────────┘
                                            │
              ┌─────────────────────────────┼────────────────────┐
              v                             v                    v
         ┌────────┐                   ┌─────────┐         ┌──────────┐
         │ Canvas │                   │ Sidebar │         │   JSON   │
         │ (node  │                   │ (input  │         │ Preview  │
         │updated)│                   │updated) │         │ (updated)│
         └────────┘                   └─────────┘         └──────────┘
```

### 3. Connecting Nodes

```
┌────────┐   drag from   ┌───────────┐  onConnect()  ┌───────┐
│  User  │   handle to   │ React Flow │ ───────────> │ Store │
│        │   handle      │            │              └───┬───┘
└────────┘               └────────────┘                  │
                                                         v
                              ┌──────────────────────────────────┐
                              │ edges: [..., newEdge]           │
                              └──────────────┬───────────────────┘
                                             │
                              ┌──────────────v───────────────┐
                              │     React Re-render          │
                              └──────────────┬───────────────┘
                                             │
                                             v
                                        ┌────────┐
                                        │ Canvas │
                                        │ (edge  │
                                        │ drawn) │
                                        └────────┘
```

### 4. Export Workflow

```
┌─────────┐    click      ┌──────────┐  getFlowData()  ┌───────┐
│  Export │  ──────────> │   JSON   │ ──────────────> │ Store │
│  Button │               │  Preview │                 └───┬───┘
└─────────┘               └──────────┘                     │
                                                           v
                                              ┌────────────────────┐
                                              │ Return:            │
                                              │ { nodes, edges }   │
                                              └────────┬───────────┘
                                                       │
                                                       v
                                          ┌────────────────────────┐
                                          │ JSON.stringify()       │
                                          └────────┬───────────────┘
                                                   │
                                                   v
                                          ┌────────────────────────┐
                                          │ Create Blob            │
                                          └────────┬───────────────┘
                                                   │
                                                   v
                                          ┌────────────────────────┐
                                          │ Trigger Download       │
                                          └────────────────────────┘
```

---

## Validation System

### Validation Rules

**File**: `app/utils/validate.ts`

```typescript
export const validateFlow = (nodes, edges) => {
  const errors = [];
  
  // Rule 1: At least one start node
  const startNodes = nodes.filter(n => n.isStart);
  if (startNodes.length === 0) {
    errors.push({
      nodeId: 'global',
      field: 'start',
      message: 'Flow must have at least one start node'
    });
  }
  
  // Rule 2: All non-start nodes must be connected
  const connectedIds = new Set();
  edges.forEach(edge => {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  });
  
  nodes.forEach(node => {
    if (!node.isStart && !connectedIds.has(node.id)) {
      errors.push({
        nodeId: node.id,
        field: 'connection',
        message: `Node "${node.name}" is not connected`
      });
    }
  });
  
  // Rule 3: Required fields per node type
  nodes.forEach(node => {
    if (!node.name?.trim()) {
      errors.push({
        nodeId: node.id,
        field: 'name',
        message: 'Node name is required'
      });
    }
    
    switch (node.type) {
      case 'message':
        if (!node.message?.trim()) {
          errors.push({
            nodeId: node.id,
            field: 'message',
            message: 'Message text is required'
          });
        }
        break;
      
      case 'question':
        if (!node.question?.trim()) {
          errors.push({
            nodeId: node.id,
            field: 'question',
            message: 'Question text is required'
          });
        }
        if (!node.variable?.trim()) {
          errors.push({
            nodeId: node.id,
            field: 'variable',
            message: 'Variable name is required'
          });
        }
        break;
      
      // ... other types
    }
  });
  
  return errors;
};
```

### How Validation is Used

**1. Real-time Validation**:
```typescript
// In JsonPreview.tsx
useEffect(() => {
  const errors = validateFlow(flowData.nodes, flowData.edges);
  setValidationErrors(errors);
}, [flowData]);
```

**2. Display Errors**:
```typescript
// In JsonPreview.tsx - Overall status
{hasErrors && (
  <div className="bg-red-50">
    ⚠️ {validationErrors.length} Errors
  </div>
)}

// In Sidebar.tsx - Node-specific errors
const errors = getNodeErrors(selectedNodeId, validationErrors);
{errors.map(error => (
  <p className="text-red-600">• {error.message}</p>
))}
```

---

## Type System

### Core Types

**File**: `app/types/flow.ts`

```typescript
// Node types enum
export type NodeType = 'message' | 'question' | 'set_variable' | 'condition' | 'api' | 'start';

// Business logic node (what gets exported)
export interface FlowNode extends Record<string, unknown> {
  id: string;
  type: NodeType;
  name: string;
  position: { x: number; y: number };
  isStart?: boolean;
  
  // Type-specific fields
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

// React Flow node (what's stored in state)
export type ReactFlowNodeType = Node<FlowNode>;

// Business logic edge
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// React Flow edge
export type ReactFlowEdgeType = Edge<{ label?: string }>;

// Validation error
export interface ValidationError {
  nodeId: string;
  field: string;
  message: string;
}
```

### Type Conversion

**State → Export**:
```typescript
// ReactFlowNode → FlowNode
getFlowData: () => ({
  nodes: state.nodes.map(node => node.data),  // Extract data property
  edges: state.edges.map(edge => ({ id, source, target, label }))
})
```

**Import → State**:
```typescript
// FlowNode → ReactFlowNode
loadFlowData: (data) => {
  const nodes = data.nodes.map(node => ({
    id: node.id,
    type: 'default',
    position: node.position,
    data: node  // Entire node becomes data
  }));
  set({ nodes, edges });
}
```

---

## Performance Considerations

### React Flow Optimizations
- **Virtualization**: Only renders visible nodes
- **Memoization**: Nodes/edges are memoized with `React.memo`
- **Efficient updates**: Uses `applyNodeChanges` and `applyEdgeChanges`

### Component Optimizations
- **CustomNode**: Wrapped in `memo()` to prevent unnecessary re-renders
- **CustomEdge**: Wrapped in `memo()` to prevent unnecessary re-renders
- **Controlled inputs**: Only selected node's inputs are rendered

### State Optimizations
- **Zustand**: Only re-renders components that subscribe to changed state
- **Immutable updates**: Uses spread operators for efficient updates
- **Flat structure**: O(1) lookup for nodes by ID

### Bundle Optimizations
- **Code splitting**: Next.js automatically splits code
- **Tree shaking**: Unused code is removed in production build
- **Minification**: Production build is minified

---

## Summary

The workflow builder uses a **clean, component-based architecture** where:

1. **Canvas** orchestrates everything
2. **CustomNode** renders individual nodes
3. **CustomEdge** renders connections
4. **Sidebar** provides editing interface
5. **JsonPreview** shows live JSON and validation
6. **Toolbar** provides quick node creation
7. **Zustand store** manages all state centrally

Data flows **unidirectionally** from user actions → store → components, following React best practices. All components are **focused, testable, and under 300 lines**.
