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
  Zap, Check, X, Terminal, Plus, Workflow, MousePointer2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import NodePalette from '../components/editor/NodePalette';
import ConfigPanel from '../components/editor/ConfigPanel';
import GenericNode from '../components/editor/GenericNode';
import GlowEdge from '../components/editor/GlowEdge';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/common/StatusBadge';
import ErrorBoundary from '../components/common/ErrorBoundary';

import api from '../services/api';
import useWorkflowStore from '../stores/workflowStore';
import { generateId } from '../utils/helpers';
import { getNodeType, NODE_TYPES } from '../utils/nodeTypes';

// Dynamically register every node type defined in nodeTypes.js with GenericNode.
// This ensures new categories (Storage, AI & Data, etc.) are never missed.
const nodeTypes = Object.fromEntries(
  NODE_TYPES.map(n => [n.type, GenericNode])
);

const edgeTypes = {
  glow: GlowEdge,
};

const getWsUrl = (path) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
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
  const [isPaletteOpen, setIsPaletteOpen] = useState(window.innerWidth > 1024);
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
    if (isExecuting) return;
    
    const loadingToast = toast.loading('Initializing pipeline...');
    setIsExecuting(true);
    setShowExecutionPanel(true);
    setExecutionLogs([{ time: new Date().toLocaleTimeString(), message: 'Preparing workflow environment...', type: 'info' }]);
    
    try {
      // 1. First save any changes
      await api.put(`/workflows/${id}`, {
        nodes_data: nodes,
        edges_data: edges,
      });

      // 2. Trigger execution
      const res = await api.post(`/workflows/${id}/execute`);
      const executionId = res.data.execution_id;
      
      toast.success('Execution started', { id: loadingToast });
      setExecutionLogs(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        message: `Execution ID: ${executionId}`, 
        type: 'info' 
      }]);

      if (wsRef.current) wsRef.current.close();
      const wsUrl = getWsUrl(`ws/${executionId}`);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'node_update') {
            const { node_id, status, error } = message.data;
            const nodeName = nodes.find(n => n.id === node_id)?.data?.label || node_id;
            
            setExecutionLogs(prev => [...prev, {
              time: new Date().toLocaleTimeString(),
              message: `[Step: ${nodeName}] status: ${status}${error ? ` - ${error}` : ''}`,
              type: status === 'failed' ? 'error' : status === 'running' ? 'info' : 'success'
            }]);
            
            useWorkflowStore.getState().updateNodeExecution(node_id, message.data);
          }
          
          if (message.type === 'execution_finished') {
             setIsExecuting(false);
             setExecutionLogs(prev => [...prev, {
               time: new Date().toLocaleTimeString(),
               message: `Pipeline finished: ${message.data.status.toUpperCase()}`,
               type: message.data.status === 'completed' ? 'success' : 'error'
             }]);
          }
        } catch (e) {
          console.error("WS Parse Error:", e);
        }
      };
      
      wsRef.current.onerror = () => {
        toast.error('WebSocket signal lost');
        setExecutionLogs(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          message: 'Error: WebSocket connection failed. Using fallback polling...',
          type: 'error'
        }]);
      };
      
    } catch (err) {
      console.error("Execution Error:", err);
      toast.error('Failed to trigger execution', { id: loadingToast });
      setIsExecuting(false);
      setExecutionLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: `Critical Error: ${err.response?.data?.detail || err.message}`,
        type: 'error'
      }]);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden select-none relative font-['Inter']" style={{ backgroundColor: '#050914' }}>
      {/* Premium ambient background — same as dashboard */}
      <div className="mac-os-wallpaper opacity-60 pointer-events-none" />
      <div className="floating-orb orb-1 pointer-events-none" style={{ opacity: 0.08 }} />
      <div className="floating-orb orb-4 pointer-events-none" style={{ opacity: 0.06 }} />
      
      {/* ── TOP TOOLBAR ─────────────────────────────── */}
      <header
        className="shrink-0 z-50 flex items-center justify-between border-b"
        style={{
          height: '64px',
          paddingLeft: '20px',
          paddingRight: '20px',
          background: 'rgba(5, 9, 20, 0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottomColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Left: back + workflow info */}
        <div className="flex items-center" style={{ gap: '16px' }}>
          <Link 
            to="/workflows" 
            className="flex items-center justify-center transition-all text-[#86868b] hover:text-white"
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <ArrowLeft size={16} />
          </Link>

          <div
            className="hidden lg:block"
            style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.08)' }}
          />

          {/* Workflow icon + name */}
          <div className="flex items-center" style={{ gap: '12px' }}>
            <div
              className="hidden lg:flex items-center justify-center"
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0,122,255,0.3), rgba(6,182,212,0.15))',
                border: '1px solid rgba(0,122,255,0.25)',
              }}
            >
              <Workflow size={16} style={{ color: '#007aff' }} />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center" style={{ gap: '8px' }}>
                <h1
                  className="font-extrabold tracking-tight text-white truncate"
                  style={{ fontSize: '15px', maxWidth: '180px' }}
                >
                  {currentWorkflow?.name || 'Loading...'}
                </h1>
                <StatusBadge status={currentWorkflow?.status || 'draft'} size="small" />
              </div>
              <div
                className="flex items-center font-semibold"
                style={{ fontSize: '11px', color: '#64748b', gap: '5px', marginTop: '1px' }}
              >
                {isSaving
                  ? <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#007aff' }} className="animate-pulse" />
                  : <Check size={10} style={{ color: '#34c759' }} />
                }
                <span>{isSaving ? 'Saving...' : 'All changes saved'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center" style={{ gap: '10px' }}>
          {/* Save */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="hidden sm:flex items-center font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{
              gap: '7px', padding: '8px 16px', fontSize: '13px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
            }}
          >
            <Save size={14} />
            Save
          </button>

          {/* Run Workflow */}
          <button
            onClick={onExecute}
            disabled={isExecuting}
            className="flex items-center font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{
              gap: '7px', padding: '8px 18px', fontSize: '13px', borderRadius: '10px',
              background: isExecuting
                ? 'rgba(52,199,89,0.5)'
                : 'linear-gradient(135deg, #34c759, #2eb350)',
              boxShadow: '0 4px 16px rgba(52,199,89,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Play size={14} className="fill-current" />
            <span className="hidden xs:inline">{isExecuting ? 'Running...' : 'Run'}</span>
            <span className="hidden lg:inline"> Workflow</span>
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          <button
            className="flex items-center justify-center transition-all text-[#86868b] hover:text-white"
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* ── MAIN CANVAS AREA ────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette isOpen={isPaletteOpen} setIsOpen={setIsPaletteOpen} />
        
        {/* Collapsed palette — "Add Step" floating button */}
        {!isPaletteOpen && (
           <button 
             onClick={() => setIsPaletteOpen(true)}
             className="absolute z-40 flex items-center font-bold text-white transition-all hover:opacity-90 active:scale-95 animate-in fade-in slide-in-from-left-4"
             style={{
               top: '24px', left: '24px',
               gap: '8px', padding: '10px 18px', fontSize: '13px', borderRadius: '12px',
               background: 'linear-gradient(135deg, #007aff, #06b6d4)',
               boxShadow: '0 4px 20px rgba(0,122,255,0.4)',
               border: '1px solid rgba(255,255,255,0.15)',
             }}
           >
             <Plus size={16} strokeWidth={2.5} />
             <span className="hidden lg:inline">Add Step</span>
           </button>
        )}

        {/* Canvas */}
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
            edgeTypes={edgeTypes}
            fitView
            style={{ background: 'transparent' }}
            defaultEdgeOptions={{
              type: 'glow',
              animated: true,
              style: { strokeWidth: 2 }
            }}
          >
            {/* Subtle dot grid matching dashboard background */}
            <Background color="rgba(255,255,255,0.07)" variant="dots" gap={28} size={1.5} />

            {/* Zoom Controls */}
            <Controls className="!bg-transparent !border-0 !shadow-none !m-6" />

            {/* Minimap as glass card */}
            <MiniMap 
               className="!border !rounded-2xl !shadow-2xl !m-6 !p-2" 
               style={{
                 background: 'rgba(5,9,20,0.85)',
                 backdropFilter: 'blur(40px)',
                 WebkitBackdropFilter: 'blur(40px)',
                 borderColor: 'rgba(255,255,255,0.08)',
                 borderRadius: '16px',
                 boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6), 0 0 40px -10px rgba(0,122,255,0.08)',
               }}
               maskColor="rgba(5,9,20,0.7)"
               nodeColor={(n) => {
                 const type = getNodeType(n.data?.type);
                 return type?.category === 'trigger' ? '#007aff' : '#34c759';
               }}
            />
            
            {/* Stats pill — top right */}
            <Panel position="top-right">
               <div
                 className="flex items-center m-6"
                 style={{
                   padding: '10px 18px',
                   borderRadius: '14px',
                   background: 'rgba(255,255,255,0.04)',
                   backdropFilter: 'blur(40px)',
                   WebkitBackdropFilter: 'blur(40px)',
                   border: '1px solid rgba(255,255,255,0.08)',
                   boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                   gap: '16px',
                 }}
               >
                  <div className="flex items-center" style={{ gap: '8px' }}>
                     <span className="font-extrabold text-white" style={{ fontSize: '15px' }}>{nodes.length}</span>
                     <span className="font-bold uppercase tracking-widest" style={{ fontSize: '10px', color: '#64748b' }}>Steps</span>
                  </div>
                  <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <div className="flex items-center" style={{ gap: '8px' }}>
                     <span className="font-extrabold text-white" style={{ fontSize: '15px' }}>{edges.length}</span>
                     <span className="font-bold uppercase tracking-widest" style={{ fontSize: '10px', color: '#64748b' }}>Edges</span>
                  </div>
               </div>
            </Panel>

            {/* ── EMPTY CANVAS STATE ─── */}
            {nodes.length === 0 && (
              <Panel position="center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center pointer-events-none"
                  style={{
                    padding: '40px 48px',
                    borderRadius: '28px',
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                    gap: '20px',
                    maxWidth: '380px',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '64px', height: '64px', borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(0,122,255,0.2), rgba(6,182,212,0.1))',
                      border: '1px solid rgba(0,122,255,0.2)',
                      boxShadow: '0 0 30px rgba(0,122,255,0.15)',
                    }}
                  >
                    <MousePointer2 size={28} style={{ color: '#007aff' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3
                      className="font-extrabold text-white tracking-tight"
                      style={{ fontSize: '20px', margin: 0 }}
                    >
                      Build your first workflow
                    </h3>
                    <p
                      className="font-medium leading-relaxed"
                      style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '260px' }}
                    >
                      Drag a trigger from the left panel to begin building your automation.
                    </p>
                  </div>

                  {/* Step guide pills */}
                  <div className="flex flex-col w-full" style={{ gap: '8px' }}>
                    {[
                      { num: '1', text: 'Add a Trigger' },
                      { num: '2', text: 'Connect Actions' },
                      { num: '3', text: 'Run & Monitor' },
                    ].map(step => (
                      <div
                        key={step.num}
                        className="flex items-center"
                        style={{
                          gap: '12px', padding: '10px 14px', borderRadius: '10px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div
                          className="flex items-center justify-center font-extrabold flex-shrink-0"
                          style={{
                            width: '24px', height: '24px', borderRadius: '8px',
                            background: 'rgba(0,122,255,0.15)',
                            border: '1px solid rgba(0,122,255,0.25)',
                            fontSize: '11px', color: '#007aff',
                          }}
                        >
                          {step.num}
                        </div>
                        <span
                          className="font-bold"
                          style={{ fontSize: '13px', color: '#94a3b8' }}
                        >
                          {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        <AnimatePresence>
          <ConfigPanel />
        </AnimatePresence>
      </div>

      {/* ── EXECUTION HUD ───────────────────────────── */}
      <AnimatePresence>
        {showExecutionPanel && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 lg:bottom-8 left-0 lg:left-1/2 lg:-translate-x-1/2 w-full lg:w-[820px] h-[340px] lg:h-[300px] flex flex-col z-[100]"
            style={{
              borderRadius: '28px 28px 0 0',
              padding: '24px',
              background: 'rgba(5,9,20,0.92)',
              backdropFilter: 'blur(60px) saturate(180%)',
              WebkitBackdropFilter: 'blur(60px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
            // On large screens: fully rounded
            {...(window.innerWidth >= 1024
              ? { style: {
                  borderRadius: '28px',
                  padding: '24px',
                  background: 'rgba(5,9,20,0.92)',
                  backdropFilter: 'blur(60px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(60px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              : {}
            )}
          >
            {/* HUD Header */}
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
               <div className="flex items-center" style={{ gap: '12px' }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #007aff, #34c759)',
                      boxShadow: '0 4px 12px rgba(0,122,255,0.3)',
                    }}
                  >
                     <Terminal size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white" style={{ fontSize: '15px', margin: 0 }}>Debug Console</h3>
                    {isExecuting && (
                      <div className="flex items-center" style={{ gap: '6px', marginTop: '2px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#007aff' }} className="animate-pulse" />
                        <span className="font-bold uppercase tracking-widest" style={{ fontSize: '10px', color: '#007aff' }}>Live</span>
                      </div>
                    )}
                  </div>
               </div>
               <button
                 onClick={() => setShowExecutionPanel(false)}
                 className="flex items-center justify-center transition-all text-[#86868b] hover:text-white"
                 style={{
                   width: '32px', height: '32px', borderRadius: '8px',
                   background: 'rgba(255,255,255,0.05)',
                   border: '1px solid rgba(255,255,255,0.08)',
                 }}
               >
                  <X size={16} />
               </button>
            </div>
            
            {/* Log output */}
            <div
              className="flex-1 overflow-y-auto custom-scrollbar font-mono"
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
               {executionLogs.map((log, idx) => (
                 <div
                   key={idx}
                   className="flex"
                   style={{
                     gap: '12px',
                     color: log.type === 'error' ? '#ff453a' : log.type === 'success' ? '#34c759' : '#94a3b8',
                   }}
                 >
                    <span style={{ opacity: 0.45, tabularNums: true, fontSize: '11px', flexShrink: 0 }}>[{log.time}]</span>
                    <span className="font-medium leading-relaxed">{log.message}</span>
                 </div>
               ))}
               {isExecuting && (
                 <div className="flex items-center" style={{ gap: '8px', marginTop: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#007aff', boxShadow: '0 0 8px #007aff' }} className="animate-pulse" />
                    <span className="font-bold uppercase tracking-widest" style={{ fontSize: '10px', color: '#007aff' }}>Processing Pipeline...</span>
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
    <ErrorBoundary>
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}
