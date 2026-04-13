import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  ReactFlowProvider,
  useReactFlow,
  Panel,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Play, Settings, 
  Zap, Check, X, Terminal
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import NodePalette from '../components/editor/NodePalette';
import ConfigPanel from '../components/editor/ConfigPanel';
import GenericNode from '../components/editor/GenericNode';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/common/StatusBadge';

import api from '../services/api';
import useWorkflowStore from '../stores/workflowStore';
import { generateId } from '../utils/helpers';
import { getNodeType } from '../utils/nodeTypes';

const nodeTypes = {
  manual_trigger: GenericNode,
  cron_trigger: GenericNode,
  webhook_trigger: GenericNode,
  http_request: GenericNode,
  send_email: GenericNode,
  send_slack: GenericNode,
  send_discord: GenericNode,
  store_data: GenericNode,
  read_data: GenericNode,
  if_condition: GenericNode,
  switch_condition: GenericNode,
  delay_node: GenericNode,
  loop_node: GenericNode,
  transform_node: GenericNode,
  code_node: GenericNode,
  filter_node: GenericNode,
};

const getWsUrl = (path) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // In dev: proxy from vite to backend. WS goes through vite's proxy too.
  // So we just use the current host (vite dev server) which proxies /ws to :8000
  return `${protocol}//${window.location.host}/${path}`;
};


function FlowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const wsRef = useRef(null);

  const { 
    currentWorkflow, setCurrentWorkflow,
    nodes, setNodes,
    edges, onNodesChange, onEdgesChange, onConnect,
    selectNode, deselectNode
  } = useWorkflowStore();

  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await api.get(`/workflows/${id}`);
        setCurrentWorkflow(res.data);
      } catch (err) {
        toast.error('Failed to load workflow');
        navigate('/workflows');
      }
    };
    fetchWorkflow();
    return () => {
        setCurrentWorkflow(null);
        if (wsRef.current) wsRef.current.close();
    }
  }, [id]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: generateId(),
        type,
        position,
        data: { type, config: {} },
      };

      setNodes([...nodes, newNode]);
    },
    [screenToFlowPosition, nodes, setNodes]
  );

  const onSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/workflows/${id}`, {
        nodes_data: nodes,
        edges_data: edges,
      });
      toast.success('Workflow saved');
    } catch (err) {
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const onExecute = async () => {
    setIsExecuting(true);
    setShowExecutionPanel(true);
    setExecutionLogs([{ time: new Date().toLocaleTimeString(), message: 'Starting workflow...', type: 'info' }]);
    
    try {
      await api.put(`/workflows/${id}`, {
        nodes_data: nodes,
        edges_data: edges,
      });

      const res = await api.post(`/workflows/${id}/execute`);
      const executionId = res.data.execution_id;
      
      if (wsRef.current) wsRef.current.close();
      const wsUrl = getWsUrl(`ws/${executionId}`);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'node_update') {
          const { node_id, status, error } = message.data;
          setExecutionLogs(prev => [...prev, {
            time: new Date().toLocaleTimeString(),
            message: `Step ${node_id}: ${status}${error ? ` - ${error}` : ''}`,
            type: status === 'failed' ? 'error' : status === 'running' ? 'info' : 'success'
          }]);
          
          useWorkflowStore.getState().updateNodeExecution(node_id, message.data);
        }
        
        if (message.type === 'execution_finished') {
           setIsExecuting(false);
           setExecutionLogs(prev => [...prev, {
             time: new Date().toLocaleTimeString(),
             message: `Execution finished with status: ${message.data.status}`,
             type: message.data.status === 'completed' ? 'success' : 'error'
           }]);
        }
      };
      
      wsRef.current.onerror = () => {
        toast.error('WebSocket connection error');
      };
      
      toast.success('Execution started');
    } catch (err) {
      toast.error('Failed to trigger execution');
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#161618] overflow-hidden select-none relative font-['Inter']">
      <div className="mac-os-wallpaper opacity-60 pointer-events-none" />
      
      {/* Top Toolbar */}
      <header className="h-16 flex items-center justify-between px-6 shrink-0 z-50 bg-[#1e1e1e]/80 backdrop-blur-3xl border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-6">
          <Link 
            to="/workflows" 
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-[#86868b] hover:text-white border border-transparent hover:border-white/10 shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col">
             <div className="flex items-center gap-3">
                <h1 className="text-[15px] font-bold tracking-tight text-white">{currentWorkflow?.name || 'Loading...'}</h1>
                <StatusBadge status={currentWorkflow?.status || 'draft'} size="small" />
             </div>
             <div className="text-[12px] text-[#86868b] flex items-center gap-1.5 mt-0.5 font-medium">
                {isSaving ? <div className="w-1.5 h-1.5 rounded-full bg-[#007aff] animate-pulse" /> : <Check size={12} className="text-[#34c759]" />}
                {isSaving ? 'Saving...' : 'All changes saved'}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <GlassButton variant="secondary" icon={Save} loading={isSaving} onClick={onSave} className="!py-2 !px-4 !text-[13px] bg-white/5 hover:bg-white/10 border-white/10">
             Save
           </GlassButton>
           <button 
             onClick={onExecute} 
             disabled={isExecuting}
             className="flex items-center gap-2 px-5 py-2 bg-[#34c759] text-white text-[13px] font-bold rounded-xl shadow-lg hover:bg-[#2eb350] active:scale-95 transition-all disabled:opacity-50"
            >
             <Play size={16} className="fill-current" />
             {isExecuting ? 'Running...' : 'Run Workflow'}
           </button>
           <div className="h-5 w-px bg-white/10 mx-2" />
           <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-[#86868b] hover:text-white border border-transparent hover:border-white/10">
              <Settings size={18} />
           </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette />
        
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => selectNode(node)}
            onPaneClick={deselectNode}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: 'transparent' }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }
            }}
          >
            <Background color="rgba(255,255,255,0.1)" variant="dots" gap={24} size={1.5} />
            <Controls className="!bg-[#1e1e1e]/80 !backdrop-blur-xl !border-white/10 !rounded-xl !overflow-hidden !shadow-2xl !m-6" />
            <MiniMap 
               className="!bg-[#1e1e1e]/80 !backdrop-blur-xl !border-white/10 !rounded-xl !shadow-2xl !m-6 !p-2" 
               maskColor="rgba(22, 22, 24, 0.7)"
               nodeColor={(n) => getNodeType(n.data.type)?.category === 'trigger' ? '#007aff' : '#34c759'}
            />
            
            <Panel position="top-right">
               <div className="bg-[#1e1e1e]/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-5 m-6 shadow-2xl">
                  <div className="flex items-center gap-2.5">
                     <span className="text-[13px] font-bold text-white">{nodes.length}</span>
                     <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">Steps</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-2.5">
                     <span className="text-[13px] font-bold text-white">{edges.length}</span>
                     <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">Edges</span>
                  </div>
               </div>
            </Panel>
          </ReactFlow>
        </div>

        <AnimatePresence>
          <ConfigPanel />
        </AnimatePresence>
      </div>

      {/* Execution HUD */}
      <AnimatePresence>
        {showExecutionPanel && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[800px] h-[320px] mac-bento-card p-6 flex flex-col shadow-2xl z-[100]"
          >
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#007aff] to-[#34c759] shadow-lg">
                     <Terminal size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-[16px] tracking-tight text-white">Debug Console</h3>
               </div>
               <button onClick={() => setShowExecutionPanel(false)} className="p-2 hover:bg-white/10 rounded-xl text-[#86868b] hover:text-white transition-colors border border-transparent hover:border-white/10 shadow-sm">
                  <X size={18} />
               </button>
            </div>
            
            <div className="flex-1 bg-black/40 rounded-xl p-5 overflow-y-auto font-mono text-[13px] space-y-2 border border-white/5 custom-scrollbar shadow-inner">
               {executionLogs.map((log, idx) => (
                 <div key={idx} className={`flex gap-4 ${log.type === 'error' ? 'text-[#ff2d55]' : log.type === 'success' ? 'text-[#34c759]' : 'text-[#86868b]'}`}>
                    <span className="opacity-50 tabular-nums">[{log.time}]</span>
                    <span className="font-medium tracking-wide">{log.message}</span>
                 </div>
               ))}
               {isExecuting && (
                 <div className="flex items-center gap-3 mt-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#007aff] animate-pulse shadow-[0_0_8px_#007aff]" />
                    <span className="text-[#007aff] font-bold uppercase tracking-widest text-[11px]">Processing Execution Pipe...</span>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WorkflowEditorPage() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
