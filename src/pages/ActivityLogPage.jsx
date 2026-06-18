import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Zap, CheckCircle2, XCircle,
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
      className="flex flex-col gap-6 lg:gap-8 pb-20 mx-auto w-full pt-6 lg:pt-10 relative z-10"
      style={{ maxWidth: '1400px' }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end pb-6 border-b border-white/[0.06]" style={{ gap: '24px' }}>
        <div>
          <h1 className="font-extrabold text-white tracking-tight" style={{ fontSize: '32px', marginBottom: '8px' }}>Activity Feed</h1>
          <p className="text-[#94a3b8] font-medium" style={{ fontSize: '15px' }}>Real-time chronicle of all workflow executions and system events.</p>
        </div>
        <GlassButton variant="secondary" icon={RotateCcw} onClick={fetchLogs} className="!py-2.5 !px-5 font-bold">
          Refresh Feed
        </GlassButton>
      </div>
      
      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : logs.length === 0 ? (
        /* Empty states: Center content, padding 48px, gap 16px */
        <GlassCard 
          padding="none" 
          className="flex flex-col items-center justify-center text-center border border-white/[0.08]" 
          hover={false} 
          style={{ 
            padding: '48px', 
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px' 
          }}
        >
            <div className="flex items-center justify-center border border-white/10 shadow-inner" style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
               <Activity size={32} className="text-[#94a3b8]" />
            </div>
            <h3 className="font-bold text-white tracking-tight text-[20px] m-0">No activity recorded</h3>
            <p className="text-[#94a3b8] font-medium text-[15px] m-0 max-w-sm leading-relaxed">Your automated activity will manifest here once workflows begin execution.</p>
        </GlassCard>
      ) : (
        <div 
          className="overflow-hidden border border-white/[0.08]"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.035)', 
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            borderRadius: '20px', 
            boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)' 
          }}
        >
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  style={{ 
                    padding: '16px 20px', // Enforce row padding: 16px 20px
                    gap: '16px', // Gap: 16px
                    minHeight: '56px' // Minimum row height: 56px
                  }}
                  onClick={() => navigate(`/executions/${log.id}`)}
                >
                  {/* Status Indicator */}
                  <div 
                    className={`flex items-center justify-center border border-white/10 transition-all group-hover:border-white/20 shrink-0 ${
                      log.status === 'completed' ? 'text-[#34c759]' : log.status === 'failed' ? 'text-[#ff3b30]' : 'text-[#007aff]'
                    }`}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                    }}
                  >
                     {log.status === 'completed' ? <CheckCircle2 size={20} /> : log.status === 'failed' ? <XCircle size={20} /> : <Zap size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[14px]" style={{ lineHeight: '1.4' }}>
                      <span className="text-[#94a3b8] font-semibold">Workflow </span>
                      <span className="font-bold text-white group-hover:text-[#06b6d4] transition-colors">
                        {log.workflow_name || 'UNNAMED_PROCESS'}
                      </span>
                      <span className="text-[#86868b] font-semibold"> updated to </span>
                      <span 
                        className={`font-extrabold uppercase tracking-wider text-[10px] border border-white/10 px-2.5 py-1 rounded-md bg-white/5 ml-2`}
                        style={{ color: log.status === 'completed' ? '#34c759' : log.status === 'failed' ? '#ff3b30' : '#007aff' }}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                       <div className="text-[#86868b] font-mono font-semibold" style={{ fontSize: '11px' }}>ID: {log.id.slice(0, 12)}</div>
                       <div style={{ height: '10px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                       <div className="flex items-center text-[#86868b] font-bold uppercase tracking-wider gap-1 text-[11px]">
                          <ShieldCheck size={12} className="opacity-55" />
                          {log.trigger_type}
                       </div>
                    </div>
                  </div>

                  <div className="text-[#94a3b8] font-semibold tabular-nums group-hover:text-white transition-colors" style={{ fontSize: '13px' }}>
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
