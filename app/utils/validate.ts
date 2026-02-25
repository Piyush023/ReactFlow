import { FlowNode, FlowEdge, ValidationError } from '../types/flow';

export const validateFlow = (nodes: FlowNode[], edges: FlowEdge[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  const startNodes = nodes.filter((node) => node.isStart);
  if (startNodes.length === 0) {
    errors.push({
      nodeId: 'global',
      field: 'start',
      message: 'Flow must have at least one start node',
    });
  }

  const connectedNodeIds = new Set<string>();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  nodes.forEach((node) => {
    if (!node.isStart && !connectedNodeIds.has(node.id)) {
      errors.push({
        nodeId: node.id,
        field: 'connection',
        message: `Node "${node.name}" is not connected to any other node`,
      });
    }

    if (!node.name || node.name.trim() === '') {
      errors.push({
        nodeId: node.id,
        field: 'name',
        message: 'Node name is required',
      });
    }

    switch (node.type) {
      case 'message':
        if (!node.message || node.message.trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'message',
            message: 'Message text is required',
          });
        }
        break;

      case 'question':
        if (!node.question || node.question.trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'question',
            message: 'Question text is required',
          });
        }
        if (!node.variable || node.variable.trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'variable',
            message: 'Variable name is required',
          });
        }
        break;

      case 'set_variable':
        if (!node.variableName || node.variableName.trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'variableName',
            message: 'Variable name is required',
          });
        }
        if (!node.value || node.value.trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'value',
            message: 'Variable value is required',
          });
        }
        break;

      case 'condition':
        if (!node.condition || node.condition.trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'condition',
            message: 'Condition expression is required',
          });
        }
        break;

      case 'api':
        if (!node.apiEndpoint || node.apiEndpoint.trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'apiEndpoint',
            message: 'API endpoint is required',
          });
        }
        if (!node.method) {
          errors.push({
            nodeId: node.id,
            field: 'method',
            message: 'HTTP method is required',
          });
        }
        break;
    }
  });

  return errors;
};

export const getNodeErrors = (nodeId: string, errors: ValidationError[]): ValidationError[] => {
  return errors.filter((error) => error.nodeId === nodeId);
};
