# 🚀 Quickstart Guide

Get your workflow builder running in 2 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Run Development Server

```bash
npm run dev
```

## Step 3: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Your First Workflow in 30 Seconds

### 1. Add a Message Node
- Click the **💬 Message** button in the top-left toolbar
- A new message node appears on the canvas

### 2. Edit the Node
- Click the message node to select it
- In the right sidebar, enter:
  - **Name**: "Welcome Message"
  - **Message**: "Hello! Welcome to our workflow."

### 3. Connect Nodes
- Drag from the **bottom** of the Start node
- Drop on the **top** of the Message node
- A connection line appears

### 4. Add a Question Node
- Click **❓ Question** in the toolbar
- Click the new node and edit:
  - **Name**: "Get User Name"
  - **Question**: "What is your name?"
  - **Variable Name**: "user_name"

### 5. Connect the Chain
- Connect Message node → Question node

### 6. Preview & Export
- Check the **JSON Preview** panel (far right)
- Verify "✓ Workflow is valid"
- Click **Export** to download your workflow

## 🎯 What You've Built

A simple workflow that:
1. Starts
2. Shows a welcome message
3. Asks for the user's name
4. Stores the response in `user_name` variable

## Next Steps

### Try Different Node Types

**Set Variable** (📝): Store computed values
```
Variable Name: greeting
Value: Hello, {user_name}!
```

**Condition** (🔀): Create branches
```
Condition: user_name != ""
```

**API Call** (🌐): Make HTTP requests
```
Endpoint: https://api.example.com/users
Method: POST
Body: {"name": "{user_name}"}
```

### Keyboard Shortcuts

- **Delete/Backspace**: Delete selected node
- **Click empty canvas**: Deselect node

### Validation

Watch the JSON Preview panel:
- 🔴 Red = Validation errors
- 🟢 Green = Valid workflow

### Import Example Workflows

1. Export your current workflow
2. Edit the JSON file
3. Click **Import** to reload

## 🐛 Troubleshooting

**Nodes won't connect?**
- Drag from **bottom** handle of source node
- Drop on **top** handle of target node

**Can't edit a node?**
- Make sure it's selected (blue border)
- Check the sidebar on the right

**Validation errors?**
- Click the node with errors
- Red box in sidebar shows what's missing
- Fill in required fields (marked with *)

**Start node disappeared?**
- The Start node cannot be deleted
- If missing, refresh the page

## 📚 Learn More

- [README.md](./README.md) - Full project documentation
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Technical deep dive

## 💡 Tips

1. **Name your nodes clearly** - Makes debugging easier
2. **Check validation often** - Fix errors as you go
3. **Export frequently** - Save your work regularly
4. **Start simple** - Build complex workflows incrementally

---

Happy workflow building! 🎉
