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

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
        <div className="bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#27272a] text-[#52525b] text-[11px] uppercase font-bold tracking-wider bg-[#18181b]">
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Workflow</th>
                    <th className="px-6 py-4 font-bold">Trigger</th>
                    <th className="px-6 py-4 font-bold">Duration</th>
                    <th className="px-6 py-4 font-bold">Ran</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                <AnimatePresence initial={false}>
                  {filteredExecutions.map((exec, idx) => (
                    <motion.tr 
                      key={exec.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-[#18181b] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/executions/${exec.id}`)}
                      >
                        <td className="px-6 py-5">
                          <StatusBadge status={exec.status} size="small" />
                        </td>
                        <td className="px-6 py-5 min-w-[200px]">
                          <div className="font-semibold text-[14px] text-[#fafafa] group-hover:text-[#3b82f6] transition-colors truncate max-w-[240px]">
                            {exec.workflow_name || 'UNNAMED WORKFLOW'}
                          </div>
                          <div className="text-[11px] text-[#52525b] font-mono mt-0.5 truncate max-w-[180px]">ID: {exec.id}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#71717a] bg-[#18181b] px-2.5 py-1 rounded-md border border-[#27272a] w-fit">
                              {exec.trigger_type === 'cron' ? <Clock size={12} className="text-[#a855f7]" /> : exec.trigger_type === 'webhook' ? <ExternalLink size={12} className="text-[#3b82f6]" /> : <Play size={12} className="text-[#10b981]" />}
                              <span className="capitalize">{exec.trigger_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-[12px] font-medium text-[#71717a] font-mono tabular-nums">
                          {formatDuration(exec.duration_ms)}
                        </td>
                        <td className="px-6 py-5 text-[12px] font-medium text-[#71717a]">
                          {timeAgo(exec.created_at)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="inline-flex p-2 rounded-lg text-[#52525b] group-hover:text-[#3b82f6] group-hover:bg-[#3b82f610] transition-all border border-transparent">
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
    </div>
  );
};

export default memo(ExecutionsListPage);
