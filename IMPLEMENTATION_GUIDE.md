# Workflow Builder - Complete Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Tech Stack](#tech-stack)
4. [File Structure](#file-structure)
5. [Core Components](#core-components)
6. [Data Flow](#data-flow)
7. [Features Implementation](#features-implementation)
8. [How to Run](#how-to-run)
9. [Usage Guide](#usage-guide)

---

## Project Overview

A visual workflow builder built with React Flow that allows users to create, edit, and manage complex workflow graphs with real-time validation and JSON export/import capabilities.

### Key Features
- ✅ Drag-and-drop visual workflow builder
- ✅ 6 node types (Start, Message, Question, Set Variable, Condition, API)
- ✅ Real-time JSON preview with syntax highlighting
- ✅ Node editing sidebar with validation
- ✅ Export/Import workflows as JSON
- ✅ Live validation with error reporting
- ✅ Keyboard shortcuts (Delete/Backspace to delete nodes)
- ✅ Custom styled nodes and edges

---

## Architecture & Design

### Mental Model

**Graph Structure**: The workflow is a **directed graph** (not a tree), meaning:
- Nodes can have multiple incoming and outgoing edges
- Cycles are allowed (e.g., loops)
- Nodes can be disconnected (with validation warnings)

**State Management**: Zustand store maintains two parallel representations:
1. **React Flow format** (for rendering): Nodes with positions, visual properties
2. **Business logic format** (for export): Flat node/edge data matching the schema

**Component Architecture**:
```
App
└── Canvas (main container)
    ├── ReactFlow (canvas engine)
    │   ├── CustomNode (visual representation)
    │   ├── CustomEdge (connection lines)
    │   └── Toolbar (add node buttons)
    ├── Sidebar (node editor)
    └── JsonPreview (live JSON + validation)
```

---

## Tech Stack

| Technology | Purpose | Why? |
|------------|---------|------|
| **Next.js 16** | React framework | Server-side rendering, routing, optimization |
| **React Flow** | Canvas engine | Purpose-built for node graphs, handles drag/zoom/connections |
| **Zustand** | State management | Simpler than Redux, perfect for this use case |
| **TypeScript** | Type safety | Catch errors at compile time, better DX |
| **Tailwind CSS** | Styling | Fast prototyping, consistent design system |
| **react-syntax-highlighter** | JSON highlighting | Syntax highlighting for JSON preview |

---

## File Structure

```
app/
├── components/
│   ├── Canvas.tsx              # Main workflow canvas container
│   ├── CustomNode.tsx          # Visual node component (renders each node type)
│   ├── CustomEdge.tsx          # Custom edge with label support
│   ├── Sidebar.tsx             # Node editing panel with form inputs
│   ├── JsonPreview.tsx         # Live JSON display with validation
│   └── Toolbar.tsx             # Add node buttons
├── store/
│   └── useFlowStore.ts         # Zustand store - all state management
├── types/
│   └── flow.ts                 # TypeScript interfaces for nodes/edges
├── utils/
│   ├── validate.ts             # Validation logic for workflows
│   └── exportJson.ts           # Export/import JSON helpers
└── page.tsx                    # Entry point
```

---

## Core Components

### 1. Canvas.tsx - Main Container

**Purpose**: Orchestrates the entire workflow builder

**Key Responsibilities**:
- Renders React Flow with custom node/edge types
- Handles node selection and pane clicks
- Integrates Sidebar and JsonPreview panels

**Props**: None (uses Zustand store)

**Code Structure**:
```typescript
const Canvas = () => {
  // Get state from Zustand
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode } = useFlowStore();
  
  // Click handlers
  const handleNodeClick = (event, node) => selectNode(node.id);
  const handlePaneClick = () => selectNode(null);
  
  return (
    <div className="flex h-screen">
      <ReactFlow /> {/* Canvas */}
      <Sidebar />    {/* Editor */}
      <JsonPreview /> {/* JSON */}
    </div>
  );
};
```

---

### 2. CustomNode.tsx - Visual Node Component

**Purpose**: Renders each node on the canvas with type-specific styling

**Key Features**:
- Color-coded by node type
- Emoji icons for visual identification
- Shows node name and type label
- Handle connections (top = input, bottom = output)

**Node Type Colors**:
| Type | Color | Icon |
|------|-------|------|
| Start | Green | ▶️ |
| Message | Blue | 💬 |
| Question | Purple | ❓ |
| Set Variable | Yellow | 📝 |
| Condition | Orange | 🔀 |
| API | Red | 🌐 |

**Props**: 
- `data: FlowNode` - Node data from store
- `selected: boolean` - Whether node is selected

---

### 3. CustomEdge.tsx - Connection Lines

**Purpose**: Renders edges with optional condition labels

**Key Features**:
- Bezier curve path (smooth curved lines)
- Label badge for condition edges
- Animated flow (default React Flow option)

**Implementation Detail**: Uses `getBezierPath` from React Flow to calculate smooth curves between nodes, then renders a label at the midpoint.

---

### 4. Sidebar.tsx - Node Editor

**Purpose**: Edit selected node properties with validation feedback

**Key Features**:
- Dynamic form based on node type
- Real-time validation error display
- Delete node button
- Keyboard shortcut (Delete/Backspace) to delete nodes
- Prevents deletion of Start node

**Form Fields by Node Type**:

| Node Type | Fields |
|-----------|--------|
| **Message** | Name, Message (textarea) |
| **Question** | Name, Question (textarea), Variable Name |
| **Set Variable** | Name, Variable Name, Value |
| **Condition** | Name, Condition (textarea) |
| **API** | Name, Endpoint, Method (dropdown), Body (JSON textarea) |

**Validation**: Shows errors from `useFlowStore.validationErrors` filtered by selected node ID.

---

### 5. JsonPreview.tsx - Live JSON Display

**Purpose**: Real-time JSON preview with export/import and validation

**Key Features**:
- Syntax-highlighted JSON (using Prism)
- Export button → downloads JSON file
- Import button → loads workflow from file
- Validation status indicator
- Node/edge count summary

**Export/Import Flow**:
```typescript
// Export: State → JSON → Blob → Download
const handleExport = () => {
  const data = getFlowData();
  exportToJson(data, `workflow-${Date.now()}.json`);
};

// Import: File → FileReader → Parse → Load State
const handleImport = async (file) => {
  const data = await importFromJson(file);
  loadFlowData(data);
};
```

---

### 6. Toolbar.tsx - Add Nodes

**Purpose**: Quick access buttons to add different node types

**Implementation**: Maps over `nodeTypes` array and renders a button for each type. On click, calls `addNode(type)` from store.

**Position**: Absolute positioned at top-left of canvas (overlays React Flow)

---

## Data Flow

### State Management (Zustand Store)

**Store Structure**:
```typescript
interface FlowStore {
  // Core state
  nodes: ReactFlowNodeType[];           // React Flow nodes (with positions)
  edges: ReactFlowEdgeType[];           // React Flow edges
  selectedNodeId: string | null;        // Currently selected node
  validationErrors: ValidationError[];  // Current validation errors
  
  // Node/Edge management
  addNode: (type) => void;
  updateNode: (id, data) => void;
  deleteNode: (id) => void;
  onNodesChange: (changes) => void;     // React Flow integration
  onEdgesChange: (changes) => void;
  onConnect: (connection) => void;
  
  // Selection
  selectNode: (id) => void;
  
  // Export/Import
  getFlowData: () => { nodes, edges };  // Convert to business format
  loadFlowData: (data) => void;         // Convert from business format
  
  // Validation
  setValidationErrors: (errors) => void;
}
```

**Key Design Decision**: Store maintains React Flow's native format (`nodes` with `position`, `type`, `data`), and converts to business format only for export. This avoids constant back-and-forth conversion.

---

### Data Transformations

**1. Add Node Flow**:
```
User clicks "Add Message" 
→ Toolbar.addNode('message')
→ Store creates new ReactFlowNode with:
  - Unique ID (timestamp-based)
  - Random position
  - Default data { type: 'message', name: 'Message Node', ... }
→ Store adds to nodes array
→ Store sets selectedNodeId to new node
→ React Flow re-renders
→ Sidebar shows edit form
```

**2. Edit Node Flow**:
```
User types in Sidebar input
→ Sidebar.handleUpdate('message', 'Hello!')
→ Store.updateNode(selectedNodeId, { message: 'Hello!' })
→ Store updates nodes array (immutably)
→ React Flow re-renders node
→ JsonPreview updates (via getFlowData)
→ Validation runs (useEffect in JsonPreview)
```

**3. Export Flow**:
```
User clicks Export
→ JsonPreview.handleExport()
→ Store.getFlowData() converts ReactFlowNodes → FlowNodes
→ exportJson.exportToJson() creates Blob
→ Browser downloads file
```

**4. Import Flow**:
```
User selects file
→ JsonPreview.handleImport()
→ exportJson.importFromJson() reads file via FileReader
→ Parse JSON
→ Store.loadFlowData() converts FlowNodes → ReactFlowNodes
→ Store replaces nodes/edges
→ React Flow re-renders entire graph
```

---

## Features Implementation

### 1. Drag and Drop (React Flow Built-in)

React Flow handles this automatically. We just:
- Set `draggable={true}` on nodes (default)
- Listen to `onNodesChange` to update positions in store
- Store applies changes with `applyNodeChanges` from React Flow

### 2. Node Editing

**Controlled Components Pattern**:
```typescript
// Sidebar renders input
<input 
  value={nodeData.message}
  onChange={(e) => handleUpdate('message', e.target.value)}
/>

// handleUpdate calls store
const handleUpdate = (field, value) => {
  updateNode(selectedNodeId, { [field]: value });
};

// Store updates immutably
updateNode: (id, data) => {
  set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id 
        ? { ...node, data: { ...node.data, ...data } }
        : node
    )
  }));
}
```

### 3. Validation

**When**: Runs in `useEffect` in `JsonPreview.tsx` whenever flow data changes

**What it checks**:
- At least one start node exists
- All non-start nodes are connected (no orphans)
- Required fields are filled (name, message, question, etc.)
- Type-specific validation (e.g., API endpoint format)

**How errors are displayed**:
- Red banner in JsonPreview showing count
- Red box in Sidebar showing errors for selected node

**Implementation**:
```typescript
// validate.ts
export const validateFlow = (nodes, edges) => {
  const errors: ValidationError[] = [];
  
  // Check for start node
  if (!nodes.some(n => n.isStart)) {
    errors.push({ nodeId: 'global', field: 'start', message: '...' });
  }
  
  // Check for disconnected nodes
  const connectedIds = new Set(edges.flatMap(e => [e.source, e.target]));
  nodes.forEach(node => {
    if (!node.isStart && !connectedIds.has(node.id)) {
      errors.push({ nodeId: node.id, field: 'connection', message: '...' });
    }
  });
  
  // Check required fields per type
  // ...
  
  return errors;
};
```

### 4. JSON Preview

**Live Update**: `getFlowData()` is called on every render (cheap, since it's just mapping)

**Syntax Highlighting**: Uses `react-syntax-highlighter` with Prism theme

```typescript
<SyntaxHighlighter language="json" style={vscDarkPlus}>
  {JSON.stringify(flowData, null, 2)}
</SyntaxHighlighter>
```

### 5. Export/Import

**Export** (no library needed):
```typescript
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = filename;
link.click();
URL.revokeObjectURL(url);
```

**Import** (uses FileReader API):
```typescript
const reader = new FileReader();
reader.onload = (e) => {
  const data = JSON.parse(e.target.result);
  loadFlowData(data);
};
reader.readAsText(file);
```

### 6. Keyboard Shortcuts

**Delete Node**: Listen for `keydown` event in `Sidebar.tsx`

```typescript
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
      // Only if not typing in input
      if (document.activeElement?.tagName !== 'INPUT') {
        deleteNode(selectedNodeId);
      }
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedNodeId]);
```

---

## How to Run

### Prerequisites
- Node.js 20+ (you have v23.7.0 ✓)
- npm or yarn

### Installation
```bash
# Already done in your repo
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

---

## Usage Guide

### Creating a Workflow

1. **Start with the Start Node** (already on canvas)
   - This is the entry point and cannot be deleted

2. **Add Nodes**
   - Click any button in the Toolbar (top-left)
   - Node appears at random position
   - Drag to desired location

3. **Edit Node Properties**
   - Click a node to select it
   - Fill in fields in the Sidebar (right)
   - Changes save automatically

4. **Connect Nodes**
   - Drag from bottom handle of one node to top handle of another
   - Creates a directed edge
   - For conditions, you can add labels (via edge data)

5. **Validate**
   - Check JsonPreview panel (far right) for errors
   - Red banner shows validation errors
   - Fix errors in Sidebar

6. **Export**
   - Click "Export" in JsonPreview
   - Downloads `workflow-{timestamp}.json`

### Importing a Workflow

1. Click "Import" in JsonPreview
2. Select a `.json` file
3. Canvas loads with all nodes and edges

### Keyboard Shortcuts

- **Delete/Backspace**: Delete selected node (when not typing)
- **Click canvas**: Deselect node

---

## Design Decisions

### Why React Flow?
- **Purpose-built**: Designed specifically for node graphs
- **Performance**: Handles thousands of nodes efficiently
- **Batteries included**: Drag, zoom, minimap, controls out of the box
- **TypeScript support**: Excellent type definitions

### Why Zustand over Redux?
- **Simplicity**: No boilerplate, no reducers
- **Performance**: Optimized re-renders (only subscribed components update)
- **Size**: ~1KB vs Redux's ~5KB
- **DX**: Much easier to read and write

### Why Not Context API?
- **Performance**: Context re-renders all consumers on every change
- **Scalability**: Zustand scales better for complex state

### File Size Limit (500 lines)
All component files are under 300 lines. Store is under 150 lines. This keeps code maintainable and focused.

---

## Validation Rules Summary

| Rule | Description |
|------|-------------|
| **Start Node** | At least one node with `isStart: true` |
| **Connected Nodes** | All non-start nodes must have at least one edge |
| **Required Fields** | Node name, type-specific fields (message, question, etc.) |
| **API Endpoint** | Must be non-empty string |
| **Variable Names** | Must be non-empty string |

---

## Type Definitions

### FlowNode
```typescript
{
  id: string;
  type: 'message' | 'question' | 'set_variable' | 'condition' | 'api' | 'start';
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
```

### FlowEdge
```typescript
{
  id: string;
  source: string;  // Source node ID
  target: string;  // Target node ID
  label?: string;  // Optional label (for conditions)
}
```

---

## Future Enhancements

Potential features to add:
- [ ] Undo/Redo (using Zustand middleware)
- [ ] Minimap (React Flow component)
- [ ] Edge labels editing in Sidebar
- [ ] Copy/paste nodes
- [ ] Multi-select and bulk operations
- [ ] Zoom to fit button
- [ ] Auto-layout algorithm
- [ ] Workflow execution/simulation mode
- [ ] Version history
- [ ] Collaborative editing (WebSocket)

---

## Troubleshooting

### Issue: Nodes not appearing
- Check browser console for errors
- Verify Zustand store has nodes array populated
- Check React Flow is receiving `nodes` prop

### Issue: Can't edit node
- Click node to select it
- Check Sidebar shows selected node data
- Verify `selectedNodeId` in store matches node ID

### Issue: Export doesn't work
- Check browser allows downloads
- Verify `getFlowData()` returns valid JSON
- Check console for errors

### Issue: Import fails
- Verify JSON file has `nodes` and `edges` arrays
- Check node IDs are unique
- Verify positions are valid `{ x: number, y: number }`

---

## Performance Considerations

- **React Flow**: Virtualizes rendering (only renders visible nodes)
- **Zustand**: Doesn't re-render unless subscribed state changes
- **Memoization**: `CustomNode` and `CustomEdge` are memoized with `React.memo`
- **JSON Stringify**: Happens on every render but is fast for <1000 nodes

---

## Deployment

### Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## Contributing Guidelines

If extending this project:
1. Keep files under 500 lines (split if needed)
2. Use TypeScript for type safety
3. Follow existing naming conventions
4. Add validation for new node types in `validate.ts`
5. Update this README with new features

---

## License

MIT License - Feel free to use in your projects

---

## Credits

Built with:
- [React Flow](https://reactflow.dev/) - Visual node graph library
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Code highlighting

---

## Questions?

This implementation follows best practices for:
- React component architecture
- State management patterns
- TypeScript usage
- Validation patterns
- File organization

Each component is focused, testable, and maintainable. The architecture scales well for adding new node types or features.
