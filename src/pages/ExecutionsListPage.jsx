import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Clock, Calendar, CheckCircle2, 
  XCircle, RotateCcw, Search, Filter,
  ArrowRight, ExternalLink, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
    <div 
      className="space-y-8 mx-auto pb-20"
      style={{ maxWidth: '1400px', paddingLeft: '24px', paddingRight: '24px', paddingTop: '120px' }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end" style={{ gap: '24px' }}>
        <div>
          <h1 className="font-extrabold text-white tracking-tight" style={{ fontSize: '40px', marginBottom: '12px' }}>History</h1>
          <p className="text-[#86868b] font-medium" style={{ fontSize: '17px' }}>View the status and execution logs of all your workflow runs.</p>
        </div>
        <GlassButton variant="secondary" icon={RotateCcw} onClick={fetchExecutions} style={{ padding: '14px 24px', fontSize: '14px' }}>
          Refresh History
        </GlassButton>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between" style={{ gap: '20px', marginTop: '16px', marginBottom: '16px' }}>
         <div className="flex p-1.5 rounded-2xl bg-[#1c1c1e] border border-white/10 overflow-x-auto no-scrollbar" style={{ gap: '4px' }}>
            {['All', 'Running', 'Completed', 'Failed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`font-bold rounded-xl transition-all flex-shrink-0 cursor-pointer ${
                  filterStatus === status 
                    ? 'bg-[#007aff] text-white' 
                    : 'text-[#86868b] hover:text-white hover:bg-white/10'
                }`}
                style={{ padding: '12px 24px', fontSize: '14px' }}
              >
                {status}
              </button>
            ))}
         </div>
         <div className="text-[#86868b] bg-[#1c1c1e] border border-white/10 rounded-xl" style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em' }}>
            {filteredExecutions.length} WORKFLOW RUNS
         </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : executions.length === 0 ? (
        <GlassCard padding="large" className="flex flex-col items-center justify-center text-center bg-[#1c1c1e] border-white/10" hover={false} style={{ paddingTop: '100px', paddingBottom: '100px' }}>
            <div className="flex items-center justify-center border border-white/10 shadow-inner" style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#2c2c2e', marginBottom: '32px' }}>
               <Activity size={40} className="text-[#86868b]" />
            </div>
            <h3 className="font-bold text-white tracking-tight" style={{ fontSize: '24px', marginBottom: '12px' }}>No execution history</h3>
            <p className="text-[#86868b] font-medium" style={{ maxWidth: '420px', fontSize: '16px', lineHeight: 1.6 }}>
              Your workflow runs will appear here once they start executing.
            </p>
        </GlassCard>
      ) : (
        <div 
          className="overflow-hidden overflow-x-auto" 
          style={{ 
            backgroundColor: '#1c1c1e', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '24px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            marginTop: '8px',
          }}
        >
          <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <th style={{ padding: '20px 28px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#86868b' }}>Status</th>
                    <th style={{ padding: '20px 28px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#86868b' }}>Workflow</th>
                    <th style={{ padding: '20px 28px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#86868b' }}>Trigger</th>
                    <th style={{ padding: '20px 28px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#86868b' }}>Duration</th>
                    <th style={{ padding: '20px 28px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#86868b' }}>Ran</th>
                    <th style={{ padding: '20px 28px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#86868b', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredExecutions.map((exec, idx) => (
                    <motion.tr 
                      key={exec.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onClick={() => navigate(`/executions/${exec.id}`)}
                      >
                        <td style={{ padding: '24px 28px' }}>
                          <StatusBadge status={exec.status} size="small" />
                        </td>
                        <td style={{ padding: '24px 28px', minWidth: '240px' }}>
                          <div className="font-bold text-white group-hover:text-[#007aff] transition-colors truncate" style={{ fontSize: '16px', maxWidth: '280px', marginBottom: '6px' }}>
                            {exec.workflow_name || 'UNNAMED WORKFLOW'}
                          </div>
                          <div className="text-[#52525b] font-mono truncate" style={{ fontSize: '12px', maxWidth: '220px' }}>ID: {exec.id}</div>
                        </td>
                        <td style={{ padding: '24px 28px' }}>
                          <div className="flex items-center font-bold text-[#86868b] bg-white/5 border border-white/8 w-fit" style={{ gap: '8px', fontSize: '13px', padding: '8px 16px', borderRadius: '12px' }}>
                              {exec.trigger_type === 'cron' ? <Clock size={14} className="text-[#a855f7]" /> : exec.trigger_type === 'webhook' ? <ExternalLink size={14} className="text-[#007aff]" /> : <Play size={14} className="text-[#34c759]" />}
                              <span className="capitalize">{exec.trigger_type}</span>
                          </div>
                        </td>
                        <td className="font-mono tabular-nums text-[#86868b]" style={{ padding: '24px 28px', fontSize: '14px', fontWeight: 600 }}>
                          {formatDuration(exec.duration_ms)}
                        </td>
                        <td className="text-[#86868b]" style={{ padding: '24px 28px', fontSize: '14px', fontWeight: 600 }}>
                          {timeAgo(exec.created_at)}
                        </td>
                        <td style={{ padding: '24px 28px', textAlign: 'right' }}>
                          <div className="inline-flex rounded-xl text-[#52525b] group-hover:text-[#007aff] group-hover:bg-[#007aff]/10 transition-all border border-transparent" style={{ padding: '10px' }}>
                              <ArrowRight size={20} />
                          </div>
                        </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default memo(ExecutionsListPage);
