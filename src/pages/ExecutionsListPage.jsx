import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Clock, CheckCircle2, 
  XCircle, RotateCcw, ArrowRight, ExternalLink, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

import api from '../services/api';
import { timeAgo, formatDuration } from '../utils/helpers';

const ExecutionsListPage = () => {
  const [executions, setExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  const fetchExecutions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/executions/');
      setExecutions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const filteredExecutions = useMemo(() => {
    return executions.filter(exec => 
      filterStatus === 'All' || exec.status === filterStatus.toLowerCase()
    );
  }, [executions, filterStatus]);

  return (
    <div className="w-full flex flex-col pt-0 relative z-10" style={{ gap: '32px' }}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end pb-6 border-b border-white/[0.06]" style={{ gap: '24px', marginTop: 0, marginBottom: '32px', paddingTop: '8px' }}>
        <div>
          <h1 className="font-extrabold text-white tracking-tight" style={{ fontSize: '32px', marginBottom: '8px' }}>History</h1>
          <p className="text-[#94a3b8] font-medium" style={{ fontSize: '15px', marginBottom: '24px' }}>View the status and execution logs of all your workflow runs.</p>
        </div>
        <GlassButton variant="secondary" icon={RotateCcw} onClick={fetchExecutions} className="!py-2.5 !px-5 font-bold" style={{ marginBottom: '24px' }}>
          Refresh History
        </GlassButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <GlassCard 
          padding="none" 
          className="overflow-hidden border border-white/[0.08]" 
          hover={false} 
          style={{ 
            padding: '24px', 
            borderRadius: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.035)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
             <div className="flex p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl gap-1 overflow-x-auto no-scrollbar">
                {['All', 'Running', 'Completed', 'Failed'].map(status => (
                   <button
                     key={status}
                     onClick={() => setFilterStatus(status)}
                     className="font-bold text-[13px] transition-all cursor-pointer px-4 py-2 rounded-lg"
                     style={{
                       backgroundColor: filterStatus === status ? 'rgba(255,255,255,0.07)' : 'transparent',
                       color: filterStatus === status ? '#ffffff' : '#94a3b8',
                       boxShadow: filterStatus === status ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                     }}
                   >
                     {status}
                   </button>
                ))}
             </div>
             <div className="text-[#94a3b8] bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 text-[11px] font-black tracking-widest uppercase">
                {filteredExecutions.length} WORKFLOW RUNS
             </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : executions.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
              <div className="flex items-center justify-center border border-white/10 shadow-inner" style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                 <Activity size={32} className="text-[#94a3b8]" />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-tight text-[20px] m-0">No execution history</h3>
                <p className="text-[#94a3b8] font-medium text-[15px] mt-2 mb-0 max-w-sm leading-relaxed">
                  Your workflow runs will appear here once they start executing.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <th style={{ padding: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>Status</th>
                      <th style={{ padding: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>Workflow</th>
                      <th style={{ padding: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>Trigger</th>
                      <th style={{ padding: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>Duration</th>
                      <th style={{ padding: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>Ran</th>
                      <th style={{ padding: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <AnimatePresence initial={false}>
                    {filteredExecutions.map((exec) => (
                      <motion.tr 
                        key={exec.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                        style={{ height: '56px' }}
                        onClick={() => navigate(`/executions/${exec.id}`)}
                        >
                          <td style={{ padding: '16px 20px' }}>
                            <StatusBadge status={exec.status} size="small" />
                          </td>
                          <td style={{ padding: '16px 20px', minWidth: '240px' }}>
                            <div className="font-bold text-white group-hover:text-[#06b6d4] transition-colors truncate" style={{ fontSize: '15px', maxWidth: '280px', marginBottom: '4px' }}>
                              {exec.workflow_name || 'UNNAMED WORKFLOW'}
                            </div>
                            <div className="text-[#86868b] font-mono truncate" style={{ fontSize: '12px', maxWidth: '220px' }}>ID: {exec.id}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div className="flex items-center font-bold text-[#94a3b8] bg-white/5 border border-white/8 w-fit" style={{ gap: '6px', fontSize: '11px', padding: '6px 12px', borderRadius: '10px' }}>
                                {exec.trigger_type === 'cron' ? <Clock size={12} className="text-[#a855f7]" /> : exec.trigger_type === 'webhook' ? <ExternalLink size={12} className="text-[#007aff]" /> : <Play size={12} className="text-[#34c759]" />}
                                <span className="capitalize">{exec.trigger_type}</span>
                            </div>
                          </td>
                          <td className="font-mono tabular-nums text-[#94a3b8]" style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600 }}>
                            {formatDuration(exec.duration_ms)}
                          </td>
                          <td className="text-[#94a3b8]" style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600 }}>
                            {timeAgo(exec.created_at)}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div className="inline-flex rounded-xl text-[#86868b] group-hover:text-[#06b6d4] group-hover:bg-[#06b6d4]/10 transition-all border border-transparent" style={{ padding: '8px' }}>
                                <ArrowRight size={18} />
                            </div>
                          </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default memo(ExecutionsListPage);
