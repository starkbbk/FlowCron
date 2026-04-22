import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import api from '../services/api'

const useWorkflowStore = create((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isExecuting: false,
  executionId: null,
  nodeExecutions: {},

  setWorkflows: (workflows) => set({ workflows }),
  setCurrentWorkflow: (workflow) => {
    // Sanitize nodes to ensure they have positions (React Flow requirement)
    const sanitizedNodes = (workflow?.nodes_data || []).map(node => ({
      ...node,
      position: node.position || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: node.data || { type: node.type, config: {} }
    }));

    set({
      currentWorkflow: workflow,
      nodes: sanitizedNodes,
      edges: workflow?.edges_data || [],
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#007AFF' } }, get().edges),
    })
  },

  selectNode: (node) => set({ selectedNode: node }),
  deselectNode: () => set({ selectedNode: null }),

  updateNodeConfig: (nodeId, config) => {
    const { nodes } = get()
    set({
      nodes: nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } } : n
      ),
    })
    // If the selected node is updated, update it too
    if (get().selectedNode?.id === nodeId) {
      set({ selectedNode: { ...get().selectedNode, data: { ...get().selectedNode.data, config: { ...get().selectedNode.data.config, ...config } } } })
    }
  },

  setExecuting: (isExecuting, executionId = null) =>
    set({ isExecuting, executionId, nodeExecutions: isExecuting ? {} : get().nodeExecutions }),

  updateNodeExecution: (nodeId, data) => {
    const { nodeExecutions } = get()
    set({ nodeExecutions: { ...nodeExecutions, [nodeId]: data } })
  },

  resetExecution: () => set({ isExecuting: false, executionId: null, nodeExecutions: {} }),
}))

export default useWorkflowStore
