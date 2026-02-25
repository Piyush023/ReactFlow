# 🔄 Visual Workflow Builder

A powerful, intuitive visual workflow builder built with React Flow. Create, edit, and manage complex workflows with drag-and-drop ease.

![Workflow Builder](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🎨 **Visual Canvas**: Drag-and-drop interface powered by React Flow
- 🧩 **6 Node Types**: Start, Message, Question, Set Variable, Condition, and API nodes
- 📝 **Real-time Editing**: Instant updates with sidebar editor
- 🔍 **Live JSON Preview**: Syntax-highlighted preview with validation
- ✅ **Smart Validation**: Real-time error detection and reporting
- 💾 **Export/Import**: Save and load workflows as JSON files
- ⌨️ **Keyboard Shortcuts**: Delete nodes with Delete/Backspace keys
- 🎯 **Type-Safe**: Built with TypeScript for reliability

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd bolna

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### Creating Your First Workflow

1. **Start Node**: Every workflow begins with a Start node (already on canvas)

2. **Add Nodes**: Click any button in the toolbar (top-left) to add nodes:
   - 💬 **Message**: Display a message to users
   - ❓ **Question**: Ask for user input and store in variable
   - 📝 **Set Variable**: Assign values to variables
   - 🔀 **Condition**: Branch based on conditions
   - 🌐 **API Call**: Make HTTP requests

3. **Edit Properties**: Click a node to select it, then edit in the sidebar

4. **Connect Nodes**: Drag from the bottom handle of one node to the top handle of another

5. **Validate**: Check the JSON Preview panel for any errors

6. **Export**: Click "Export" to download your workflow as JSON

### Keyboard Shortcuts

- **Delete/Backspace**: Delete selected node
- **Click canvas**: Deselect node

## 🏗️ Architecture

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with SSR |
| **React Flow** | Visual graph engine |
| **Zustand** | State management |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **react-syntax-highlighter** | JSON syntax highlighting |

### Project Structure

```
app/
├── components/           # React components
│   ├── Canvas.tsx       # Main workflow canvas
│   ├── CustomNode.tsx   # Node renderer
│   ├── CustomEdge.tsx   # Edge renderer
│   ├── Sidebar.tsx      # Node editor
│   ├── JsonPreview.tsx  # JSON preview panel
│   └── Toolbar.tsx      # Add node toolbar
├── store/
│   └── useFlowStore.ts  # Zustand state management
├── types/
│   └── flow.ts          # TypeScript definitions
├── utils/
│   ├── validate.ts      # Validation logic
│   └── exportJson.ts    # Export/import utilities
└── page.tsx             # Entry point
```

## 📚 Node Types

### 1. Start Node ▶️
- Entry point of every workflow
- Cannot be deleted
- Only one required per workflow

### 2. Message Node 💬
- Display text messages
- **Required**: Message text

### 3. Question Node ❓
- Ask user for input
- Store response in variable
- **Required**: Question text, Variable name

### 4. Set Variable Node 📝
- Assign values to variables
- **Required**: Variable name, Value

### 5. Condition Node 🔀
- Branch based on conditions
- **Required**: Condition expression
- Example: `age > 18`

### 6. API Node 🌐
- Make HTTP requests
- **Required**: Endpoint URL, HTTP method
- **Optional**: Request body (JSON)
- Supports: GET, POST, PUT, DELETE

## 🔍 Validation

The workflow builder validates your workflow in real-time:

### Validation Rules

- ✅ At least one Start node required
- ✅ All nodes must be connected (no orphans)
- ✅ All required fields must be filled
- ✅ Node names cannot be empty
- ✅ API endpoints must be valid URLs

### Error Display

- **JSON Preview Panel**: Shows total error count
- **Sidebar**: Shows errors for selected node
- **Visual Indicators**: Errors appear in red

## 💾 Export & Import

### Export Workflow

Click the **Export** button in the JSON Preview panel to download your workflow as a JSON file.

**Export Format**:
```json
{
  "nodes": [
    {
      "id": "start-node",
      "type": "start",
      "name": "Start",
      "position": { "x": 250, "y": 50 },
      "isStart": true
    },
    {
      "id": "node-1234567890",
      "type": "message",
      "name": "Welcome Message",
      "position": { "x": 250, "y": 150 },
      "message": "Hello, World!"
    }
  ],
  "edges": [
    {
      "id": "start-node-node-1234567890",
      "source": "start-node",
      "target": "node-1234567890"
    }
  ]
}
```

### Import Workflow

1. Click the **Import** button
2. Select a `.json` file
3. Your canvas will load with all nodes and connections

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Adding New Node Types

1. Update `NodeType` in `/app/types/flow.ts`
2. Add validation rules in `/app/utils/validate.ts`
3. Add form fields in `/app/components/Sidebar.tsx`
4. Update color/icon mappings in `/app/components/CustomNode.tsx`
5. Add toolbar button in `/app/components/Toolbar.tsx`

## 📖 Documentation

For a deep dive into the implementation, see [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

Topics covered:
- Architecture & design decisions
- Component breakdown
- Data flow diagrams
- Validation logic
- Export/import implementation
- Performance considerations

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

```bash
# Build the project
npm run build

# The output is in `.next` directory
# Deploy `.next` folder to your hosting provider
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Keep files under 500 lines
2. Use TypeScript for all new code
3. Follow existing code style
4. Add tests for new features
5. Update documentation

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with these amazing libraries:
- [React Flow](https://reactflow.dev/) - Visual node editor
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Syntax highlighting

---

Made with ❤️ for building visual workflows
