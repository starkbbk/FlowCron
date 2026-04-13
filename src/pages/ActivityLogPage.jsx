import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Zap, GitBranch, CheckCircle2, XCircle,
  RotateCcw, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

import api from '../services/api';
import { timeAgo } from '../utils/helpers';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/executions/recent?limit=20');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div 
      className="space-y-8 mx-auto pb-20"
      style={{ maxWidth: '1400px', paddingLeft: '24px', paddingRight: '24px', paddingTop: '120px' }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end" style={{ gap: '24px' }}>
        <div>
          <h1 className="font-extrabold text-white tracking-tight" style={{ fontSize: '40px', marginBottom: '12px' }}>Activity Feed</h1>
          <p className="text-[#86868b] font-medium" style={{ fontSize: '17px' }}>Real-time chronicle of all workflow executions and system events.</p>
        </div>
        <GlassButton variant="secondary" icon={RotateCcw} onClick={fetchLogs} style={{ padding: '14px 24px', fontSize: '14px' }}>
          Refresh Feed
        </GlassButton>
      </div>
      
      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : logs.length === 0 ? (
        <GlassCard padding="large" className="flex flex-col items-center justify-center text-center bg-[#1c1c1e] border-white/10" hover={false} style={{ paddingTop: '100px', paddingBottom: '100px' }}>
            <div className="flex items-center justify-center border border-white/10 shadow-inner" style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#2c2c2e', marginBottom: '32px' }}>
               <Activity size={40} className="text-[#86868b]" />
            </div>
            <h3 className="font-bold text-white tracking-tight" style={{ fontSize: '24px', marginBottom: '12px' }}>No activity recorded</h3>
            <p className="text-[#86868b] font-medium" style={{ maxWidth: '420px', fontSize: '16px', lineHeight: 1.6 }}>Your automated activity will manifest here once workflows begin execution.</p>
        </GlassCard>
      ) : (
        <div className="bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-[#27272a]">
            <AnimatePresence initial={false}>
              {logs.map((log, idx) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 flex items-center gap-8 hover:bg-[#18181b] transition-colors group cursor-pointer"
                  onClick={() => navigate(`/executions/${log.id}`)}
                >
                  {/* Status Indicator */}
                  <div className={`p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] transition-all group-hover:border-[#3b82f640] ${log.status === 'completed' ? 'text-[#10b981]' : log.status === 'failed' ? 'text-[#ef4444]' : 'text-[#3b82f6]'}`}>
                     {log.status === 'completed' ? <CheckCircle2 size={18} /> : log.status === 'failed' ? <XCircle size={18} /> : <Zap size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] tracking-tight">
                      <span className="text-[#71717a] font-semibold">Workflow </span>
                      <span className="font-bold text-[#fafafa] group-hover:text-[#3b82f6] transition-colors">
                        {log.workflow_name || 'UNNAMED_PROCESS'}
                      </span>
                      <span className="text-[#52525b] font-semibold"> updated to </span>
                      <span className={`font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-md bg-[#18181b] border border-[#27272a] ml-1.5 ${log.status === 'completed' ? 'text-[#10b981]' : log.status === 'failed' ? 'text-[#ef4444]' : 'text-[#3b82f6]'}`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="text-[11px] text-[#3f3f46] font-mono font-bold tracking-tight">ID: {log.id.slice(0, 12)}</div>
                       <div className="h-3 w-px bg-[#27272a]" />
                       <div className="flex items-center gap-1.5 text-[11px] text-[#52525b] font-bold uppercase tracking-wider">
                          <ShieldCheck size={12} className="opacity-50" />
                          {log.trigger_type} source
                       </div>
                    </div>
                  </div>

                  <div className="text-[12px] text-[#52525b] font-semibold tabular-nums group-hover:text-[#a1a1aa] transition-colors">
                    {timeAgo(log.created_at)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ActivityLogPage);
