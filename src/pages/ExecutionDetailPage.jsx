import React, { useState, useEffect, useMemo, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Zap, CheckCircle2, 
  XCircle, Terminal, Info, ChevronRight,
  RotateCcw, ExternalLink, Calendar, Code, Activity, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/common/StatusBadge';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

import api from '../services/api';
import { timeAgo, formatDuration, getStatusColor } from '../utils/helpers';

const ExecutionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');
  const [nodeExecutions, setNodeExecutions] = useState([]);
  const [isNodesLoading, setIsNodesLoading] = useState(false);

  const fetchExecution = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/executions/${id}`);
      setExecution(res.data);
    } catch (err) {
      toast.error('Failed to load execution details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNodeExecutions = async () => {
    setIsNodesLoading(true);
    try {
      const res = await api.get(`/executions/${id}/nodes`);
      setNodeExecutions(res.data);
    } catch (err) {
      toast.error('Failed to load activity details');
    } finally {
      setIsNodesLoading(false);
    }
  };

  useEffect(() => {
    fetchExecution();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'nodes' && nodeExecutions.length === 0) {
      fetchNodeExecutions();
    }
  }, [activeTab]);

  const statusColor = useMemo(() => getStatusColor(execution?.status), [execution?.status]);

  if (isLoading) return <div className="max-w-7xl mx-auto p-8"><CardSkeleton /></div>;

  return (
    <div className="mx-auto pb-20" style={{ display: 'flex', flexDirection: 'column', gap: '48px', padding: '100px 32px 40px', maxWidth: '1400px' }}>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex items-start gap-5">
           <button 
             onClick={() => navigate(-1)} 
             className="p-3 bg-[#1c1c1e] hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer text-[#86868b] hover:text-white"
           >
              <ArrowLeft size={20} />
           </button>
           <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                 <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    {execution?.workflow_name || 'Workflow Execution'}
                 </h1>
                 <StatusBadge status={execution?.status} size="default" />
              </div>
              <div className="flex flex-wrap items-center gap-3 font-bold text-[#86868b]" style={{ fontSize: '13px' }}>
                 <span className="flex items-center gap-2 bg-[#1c1c1e] px-3 py-1.5 rounded-lg border border-white/5 shadow-sm">
                    <Calendar size={14} className="text-[#3b82f6]" /> 
                    {new Date(execution?.created_at).toLocaleString()}
                 </span>
                 <span className="flex items-center gap-2 bg-[#1c1c1e] px-3 py-1.5 rounded-lg border border-white/5 shadow-sm">
                    <Clock size={14} className="text-[#a855f7]" /> 
                    {formatDuration(execution?.duration_ms)}
                 </span>
                 <span className="flex items-center gap-2 bg-[#1c1c1e] px-3 py-1.5 rounded-lg border border-white/5 shadow-sm">
                    <Activity size={14} className="text-[#10b981]" /> 
                    ID: {id}
                 </span>
              </div>
           </div>
        </div>
        <div className="flex gap-3">
           <Link to={`/workflows/${execution?.workflow_id}/edit`}>
              <button className="flex items-center gap-2 font-bold transition-all cursor-pointer hover:opacity-90 shadow-[0_4px_16px_rgba(0,122,255,0.3)]" style={{ backgroundColor: '#007aff', color: 'white', padding: '12px 24px', borderRadius: '12px', fontSize: '14px' }}>
                 <ExternalLink size={16} />
                 View Workflow
              </button>
           </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-start" style={{ gap: '32px' }}>
         {/* Left: Summary */}
         <div className="lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '40px 36px' }}>
               <h3 className="font-extrabold uppercase tracking-[0.2em] text-[#86868b]" style={{ fontSize: '13px', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>Activity Summary</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="flex justify-between items-center">
                     <span className="font-semibold text-[#86868b]" style={{ fontSize: '14px' }}>Trigger Type</span>
                     <span className="font-bold text-[#007aff] bg-[#007aff]/10 capitalize" style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '8px' }}>
                       {execution?.trigger_type}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="font-semibold text-[#86868b]" style={{ fontSize: '14px' }}>Status</span>
                     <span className="font-bold capitalize" style={{ color: statusColor, fontSize: '13px', padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                       <span>{execution?.status}</span>
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="font-semibold text-[#86868b]" style={{ fontSize: '14px' }}>Progress</span>
                     <span className="font-bold text-white tabular-nums" style={{ fontSize: '15px' }}>
                       {execution?.nodes_completed} <span className="text-[#3a3a3c]">/</span> {execution?.nodes_total}
                     </span>
                  </div>

                  {execution?.error_message && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ paddingTop: '24px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                       <div className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-[#ff3b30]" style={{ fontSize: '13px', marginBottom: '16px' }}>
                          <XCircle size={18} /> Critical Error
                       </div>
                       <div className="font-semibold text-[#ff3b30] bg-[#ff3b30]/10 border border-[#ff3b30]/20 leading-relaxed" style={{ padding: '20px', borderRadius: '16px', fontSize: '14px' }}>
                          {execution.error_message}
                       </div>
                    </motion.div>
                  )}
               </div>
            </div>
            
            <div style={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '40px 36px' }}>
               <h3 className="font-extrabold uppercase tracking-[0.2em] text-[#86868b] flex items-center justify-between" style={{ fontSize: '13px', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
                  Input Context
                  <Code size={16} className="opacity-40" />
               </h3>
               <div className="relative">
                  <pre className="font-mono text-[#86868b] leading-relaxed max-h-64 overflow-x-auto custom-scrollbar" style={{ fontSize: '13px', padding: '24px 28px', borderRadius: '16px', backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.06)' }}>
                     {JSON.stringify(execution?.trigger_data || { protocol: "ENCRYPTED_PATCH" }, null, 2)}
                  </pre>
               </div>
            </div>
         </div>

         {/* Center/Right: Execution Sequence */}
         <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="flex items-center" style={{ gap: '6px', padding: '6px', backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', width: 'fit-content' }}>
               <button 
                  onClick={() => setActiveTab('logs')}
                  className="font-bold transition-all cursor-pointer"
                  style={{
                    padding: '10px 24px', fontSize: '14px', borderRadius: '12px',
                    backgroundColor: activeTab === 'logs' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeTab === 'logs' ? '#ffffff' : '#86868b',
                    boxShadow: activeTab === 'logs' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}
               >
                  Console
               </button>
               <button 
                  onClick={() => setActiveTab('nodes')}
                  className="font-bold transition-all cursor-pointer"
                  style={{
                    padding: '10px 24px', fontSize: '14px', borderRadius: '12px',
                    backgroundColor: activeTab === 'nodes' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeTab === 'nodes' ? '#ffffff' : '#86868b',
                    boxShadow: activeTab === 'nodes' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}
               >
                  Step Activity
               </button>
            </div>

            <div className="relative overflow-hidden flex flex-col" style={{ minHeight: '600px', backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
               <AnimatePresence mode="wait">
                 {activeTab === 'logs' ? (
                   <motion.div 
                     key="tab-logs"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.15 }}
                     className="flex-1 flex flex-col"
                   >
                      <div className="flex items-center justify-between" style={{ padding: '32px 36px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#1c1c1e' }}>
                         <div className="flex items-center gap-3">
                            <Terminal size={18} className="text-[#86868b]" />
                            <span className="font-extrabold uppercase tracking-widest text-[#86868b]" style={{ fontSize: '13px' }}>System Out</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                            <span className="font-bold uppercase tracking-widest text-[#86868b]" style={{ fontSize: '12px' }}>Live</span>
                         </div>
                      </div>
                      <div className="space-y-4 font-mono text-[13px] overflow-y-auto max-h-[600px] custom-scrollbar text-[#71717a] leading-relaxed" style={{ padding: '36px' }}>
                         <div className="flex gap-3">
                            <span className="text-[#3f3f46] shrink-0">[{new Date(execution?.created_at).toLocaleTimeString()}]</span>
                            <span className="text-[#52525b]">Runtime kernel initialized successfully.</span>
                         </div>
                         <div className="flex gap-3">
                            <span className="text-[#3f3f46] shrink-0">[{new Date(execution?.created_at).toLocaleTimeString()}]</span>
                            <span className="text-[#fafafa] font-semibold">
                               PROCESS_START: Executing workflow "{execution?.workflow_name}".
                            </span>
                         </div>
                         
                         <div className="space-y-4 my-6">
                           {nodeExecutions.map(ne => (
                             <div key={ne.id} className="space-y-1 border-l-2 border-[#27272a] pl-4 ml-2">
                                <div className="flex gap-3">
                                   <span className="text-[#3f3f46] shrink-0">[{new Date(ne.started_at).toLocaleTimeString()}]</span>
                                   <div className={ne.status === 'failed' ? 'text-[#ef4444]' : ne.status === 'completed' ? 'text-[#10b981]' : 'text-[#71717a]'}>
                                      STEP({ne.node_label || ne.node_type}) CODE::{ne.status.toUpperCase()} (+{ne.duration_ms}ms)
                                   </div>
                                </div>
                                {ne.error_message && (
                                   <div className="pl-4 text-[#ef4444] opacity-70 italic">FAIL_STACK: {ne.error_message}</div>
                                )}
                             </div>
                           ))}
                         </div>
                         
                         {execution?.status !== 'running' && (
                           <div className={`font-bold mt-8 pt-6 border-t border-[#27272a] py-2 flex gap-3 ${execution?.status === 'completed' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                              <span className="text-[#3f3f46] shrink-0">[{new Date(execution?.completed_at || execution?.created_at).toLocaleTimeString()}]</span>
                              <span className="uppercase tracking-wider">PROCESS_END: {execution?.status.toUpperCase()}</span>
                           </div>
                         )}
                         <div className="h-10" />
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="tab-nodes"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.15 }}
                     className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-h-[700px] custom-scrollbar"
                   >
                      {isNodesLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-3">
                           <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                           <span className="text-[12px] font-bold text-[#52525b] uppercase tracking-wider">Analyzing activity...</span>
                        </div>
                      ) : nodeExecutions.length === 0 ? (
                        <div className="text-center py-32 text-[#52525b] font-semibold">No activity logs found.</div>
                      ) : (
                        nodeExecutions.map((ne, idx) => (
                           <div 
                            key={ne.id} 
                            className={`p-6 rounded-lg border transition-all ${
                              ne.status === 'completed' ? 'border-[#10b98120] bg-[#10b98105]' : 
                              ne.status === 'failed' ? 'border-[#ef444420] bg-[#ef444405]' : 
                              'border-[#27272a] bg-[#18181b]'
                            }`}
                          >
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                   <div className={`p-2.5 rounded-lg border ${
                                     ne.status === 'completed' 
                                       ? 'bg-[#10b98110] text-[#10b981] border-[#10b98120]' 
                                       : 'bg-[#18181b] text-[#52525b] border-[#27272a]'
                                   }`}>
                                      <Zap size={18} />
                                   </div>
                                   <div>
                                      <span className="font-bold text-[16px] text-[#fafafa] block tracking-tight mb-0.5">{ne.node_label || ne.node_type}</span>
                                      <span className="text-[11px] text-[#52525b] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                         {ne.node_type}
                                      </span>
                                   </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1.5">
                                   <StatusBadge status={ne.status} size="small" />
                                   <div className="text-[10px] text-[#3f3f46] font-mono">{ne.node_id.slice(0, 8)}</div>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="space-y-2">
                                   <div className="text-[10px] uppercase font-bold text-[#52525b] tracking-wider">Input</div>
                                   <pre className="text-[11px] font-mono p-4 rounded-lg bg-[#09090b] text-[#71717a] border border-[#27272a] overflow-x-auto max-h-40 custom-scrollbar">
                                      {JSON.stringify(ne.input_data, null, 2)}
                                   </pre>
                                </div>
                                <div className="space-y-2">
                                   <div className="text-[10px] uppercase font-bold text-[#52525b] tracking-wider">Output</div>
                                   <pre className="text-[11px] font-mono p-4 rounded-lg bg-[#09090b] text-[#a1a1aa] border border-[#27272a] overflow-x-auto max-h-40 custom-scrollbar">
                                      {JSON.stringify(ne.output_data || ne.error_message, null, 2)}
                                   </pre>
                                </div>
                             </div>

                             <div className="pt-4 border-t border-[#27272a] flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#3f3f46]">
                                <span className="flex items-center gap-1.5"><Clock size={12} /> Duration: {formatDuration(ne.duration_ms)}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={12} /> Start: {new Date(ne.started_at).toLocaleTimeString()}</span>
                             </div>
                          </div>
                        ))
                      )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
};

export default memo(ExecutionDetailPage);
