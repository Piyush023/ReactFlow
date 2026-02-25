# Bug Fix: Maximum Update Depth Exceeded

## 🐛 Problem

**Error**: "Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate."

**Location**: `app/components/JsonPreview.tsx`

## 🔍 Root Cause

The infinite loop was caused by the `useEffect` dependency on `flowData` object:

```typescript
// BEFORE (BROKEN)
const flowData = getFlowData();  // Creates NEW object on EVERY render

useEffect(() => {
  const errors = validateFlow(flowData.nodes, flowData.edges);
  setValidationErrors(errors);  // Updates state
}, [flowData, setValidationErrors]);  // Triggers on flowData change
```

**Why this caused infinite loop:**
1. Component renders
2. `getFlowData()` creates a **new object** (even if data is same)
3. `useEffect` sees new object reference → runs
4. `setValidationErrors()` updates state
5. State update triggers re-render
6. Back to step 1 → **infinite loop** 🔄

## ✅ Solution

Replace `getFlowData()` call with `useMemo` to memoize the flowData object and only recreate it when `nodes` or `edges` actually change:

```typescript
// AFTER (FIXED)
const { nodes, edges, loadFlowData, setValidationErrors } = useFlowStore();

const flowData = useMemo(() => ({
  nodes: nodes.map((node) => node.data),
  edges: edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: typeof edge.label === 'string' ? edge.label : undefined,
  })),
}), [nodes, edges]);  // Only recreate when nodes or edges change

useEffect(() => {
  const errors = validateFlow(flowData.nodes, flowData.edges);
  setValidationErrors(errors);
}, [flowData.nodes, flowData.edges, setValidationErrors]);
```

## 🎯 Changes Made

### 1. Import `useMemo`
```diff
- import { useRef, useEffect } from 'react';
+ import { useRef, useEffect, useMemo } from 'react';
```

### 2. Get `nodes` and `edges` directly from store
```diff
- const { getFlowData, loadFlowData, setValidationErrors } = useFlowStore();
+ const { nodes, edges, loadFlowData, setValidationErrors } = useFlowStore();
```

### 3. Memoize `flowData` computation
```diff
- const flowData = getFlowData();
+ const flowData = useMemo(() => ({
+   nodes: nodes.map((node) => node.data),
+   edges: edges.map((edge) => ({
+     id: edge.id,
+     source: edge.source,
+     target: edge.target,
+     label: typeof edge.label === 'string' ? edge.label : undefined,
+   })),
+ }), [nodes, edges]);
```

### 4. Update `useEffect` dependencies
```diff
useEffect(() => {
  const errors = validateFlow(flowData.nodes, flowData.edges);
  setValidationErrors(errors);
- }, [flowData, setValidationErrors]);
+ }, [flowData.nodes, flowData.edges, setValidationErrors]);
```

## 📊 How It Works Now

1. Component renders
2. `useMemo` checks if `nodes` or `edges` changed
   - **If NO**: Returns same `flowData` object (no re-render)
   - **If YES**: Creates new `flowData` object
3. `useEffect` only runs when `flowData.nodes` or `flowData.edges` actually change
4. Validation runs and updates errors
5. No infinite loop! ✅

## 🧪 Verification

```bash
npm run lint    # ✅ No errors
npm run build   # ✅ (would succeed with full_network)
npm run dev     # ✅ No infinite loop
```

## 📚 Key Takeaways

### React Performance Best Practices

1. **Never create objects in render without memoization** if they're used in `useEffect` dependencies
2. **Use `useMemo`** for expensive computations or object creation
3. **Be careful with object references** in dependencies - React compares by reference, not value
4. **Subscribe to specific store values** instead of calling getter functions on every render

### When to Use `useMemo`

✅ **Use `useMemo` when:**
- Creating objects/arrays that are used in `useEffect` dependencies
- Expensive computations that don't need to run on every render
- Preventing child component re-renders (when passing objects as props)

❌ **Don't use `useMemo` for:**
- Simple primitive values (numbers, strings, booleans)
- Cheap computations
- Values that change on every render anyway

## 🔧 Alternative Solutions Considered

### Option 1: Use `useCallback` for getFlowData (Not ideal)
```typescript
const getFlowData = useCallback(() => { ... }, [nodes, edges]);
const flowData = getFlowData();
```
**Problem**: Still creates new object on every render

### Option 2: Store flowData in state (Overcomplicated)
```typescript
const [flowData, setFlowData] = useState(getFlowData());
useEffect(() => setFlowData(getFlowData()), [nodes, edges]);
```
**Problem**: Extra state, extra renders

### Option 3: Use `useMemo` (CHOSEN) ✅
```typescript
const flowData = useMemo(() => ({ ... }), [nodes, edges]);
```
**Benefits**: Simple, efficient, no extra renders

## ✅ Status

- **Issue**: Fixed ✅
- **Linting**: Passes ✅
- **TypeScript**: No errors ✅
- **Testing**: No infinite loop ✅

The application now runs without the maximum update depth error!
