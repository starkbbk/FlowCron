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
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex items-start gap-4">
           <button 
             onClick={() => navigate(-1)} 
             className="p-2 bg-[#111113] hover:bg-[#18181b] rounded-lg border border-[#27272a] transition-all"
           >
              <ArrowLeft size={18} className="text-[#a1a1aa]" />
           </button>
           <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                 <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">
                    {execution?.workflow_name || 'Workflow Execution'}
                 </h1>
                 <StatusBadge status={execution?.status} size="default" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#52525b]">
                 <span className="flex items-center gap-2 bg-[#111113] px-2.5 py-1 rounded-md border border-[#27272a]">
                    <Calendar size={12} className="text-[#3b82f6]" /> 
                    {new Date(execution?.created_at).toLocaleString()}
                 </span>
                 <span className="flex items-center gap-2 bg-[#111113] px-2.5 py-1 rounded-md border border-[#27272a]">
                    <Clock size={12} className="text-[#a855f7]" /> 
                    {formatDuration(execution?.duration_ms)}
                 </span>
                 <span className="flex items-center gap-2 bg-[#111113] px-2.5 py-1 rounded-md border border-[#27272a]">
                    <Activity size={12} className="text-[#10b981]" /> 
                    ID: {id}
                 </span>
              </div>
           </div>
        </div>
        <div className="flex gap-3">
           <Link to={`/workflows/${execution?.workflow_id}/edit`}>
              <GlassButton variant="primary" icon={ExternalLink} className="!py-2 !px-4 !text-[12px]">
                View Workflow
              </GlassButton>
           </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
         {/* Left: Summary */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#52525b] mb-6 border-b border-[#27272a] pb-3">Activity Summary</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-[#71717a] text-[13px] font-medium">Trigger Type</span>
                     <span className="text-[12px] font-semibold text-[#3b82f6] bg-[#3b82f610] px-2.5 py-1 rounded-md capitalize">
                       {execution?.trigger_type}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[#71717a] text-[13px] font-medium">Status</span>
                     <span className="text-[12px] font-semibold px-2.5 py-1 rounded-md bg-[#18181b]" style={{ color: statusColor }}>
                       <span className="capitalize">{execution?.status}</span>
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[#71717a] text-[13px] font-medium">Progress</span>
                     <span className="text-[14px] font-bold text-[#fafafa] tabular-nums">
                       {execution?.nodes_completed} <span className="text-[#27272a]">/</span> {execution?.nodes_total}
                     </span>
                  </div>

                  {execution?.error_message && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-6 mt-6 border-t border-[#27272a]"
                    >
                       <div className="text-[#ef4444] text-[12px] font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                          <XCircle size={14} /> Critical Error
                       </div>
                       <div className="text-[13px] font-medium text-[#ef4444] bg-[#ef444405] p-4 rounded-lg border border-[#ef444420] leading-relaxed">
                          {execution.error_message}
                       </div>
                    </motion.div>
                  )}
               </div>
            </div>
            
            <div className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#52525b] mb-6 border-b border-[#27272a] pb-3 flex items-center justify-between">
                  Input Context
                  <Code size={14} className="opacity-40" />
               </h3>
               <div className="relative">
                  <pre className="text-[11px] font-mono p-4 rounded-lg bg-[#09090b] border border-[#27272a] overflow-x-auto text-[#71717a] leading-relaxed max-h-64 custom-scrollbar">
                     {JSON.stringify(execution?.trigger_data || { protocol: "ENCRYPTED_PATCH" }, null, 2)}
                  </pre>
               </div>
            </div>
         </div>

         {/* Center/Right: Execution Sequence */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex p-1 rounded-lg bg-[#111113] border border-[#27272a] w-fit">
               <button 
                  onClick={() => setActiveTab('logs')}
                  className={`px-6 py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                    activeTab === 'logs' 
                      ? 'bg-[#3b82f6] text-[#fafafa]' 
                      : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#18181b]'
                  }`}
               >
                  Console
               </button>
               <button 
                  onClick={() => setActiveTab('nodes')}
                  className={`px-6 py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                    activeTab === 'nodes' 
                      ? 'bg-[#3b82f6] text-[#fafafa]' 
                      : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#18181b]'
                  }`}
               >
                  Step Activity
               </button>
            </div>

            <div className="bg-[#111113] border border-[#27272a] rounded-xl min-h-[500px] relative overflow-hidden flex flex-col shadow-sm">
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
                      <div className="px-6 py-3 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
                         <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-[#a1a1aa]" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#52525b]">System Out</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Live</span>
                         </div>
                      </div>
                      <div className="p-8 space-y-4 font-mono text-[12px] overflow-y-auto max-h-[600px] custom-scrollbar text-[#71717a] leading-relaxed">
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
