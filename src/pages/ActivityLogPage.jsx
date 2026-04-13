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
        <div 
          className="overflow-hidden"
          style={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <div>
            <AnimatePresence initial={false}>
              {logs.map((log, idx) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center hover:bg-white/5 transition-colors group cursor-pointer"
                  style={{ padding: '28px 32px', gap: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onClick={() => navigate(`/executions/${log.id}`)}
                >
                  {/* Status Indicator */}
                  <div 
                    className={`flex items-center justify-center border border-white/10 transition-all group-hover:border-white/20 ${log.status === 'completed' ? 'text-[#34c759]' : log.status === 'failed' ? 'text-[#ff3b30]' : 'text-[#007aff]'}`}
                    style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#2c2c2e' }}
                  >
                     {log.status === 'completed' ? <CheckCircle2 size={24} /> : log.status === 'failed' ? <XCircle size={24} /> : <Zap size={24} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                      <span className="text-[#86868b] font-semibold">Workflow </span>
                      <span className="font-bold text-white group-hover:text-[#007aff] transition-colors">
                        {log.workflow_name || 'UNNAMED_PROCESS'}
                      </span>
                      <span className="text-[#52525b] font-semibold"> updated to </span>
                      <span 
                        className={`font-extrabold uppercase tracking-wider border border-white/10 ${log.status === 'completed' ? 'text-[#34c759]' : log.status === 'failed' ? 'text-[#ff3b30]' : 'text-[#007aff]'}`}
                        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: '8px' }}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center" style={{ gap: '16px', marginTop: '4px' }}>
                       <div className="text-[#52525b] font-mono font-bold" style={{ fontSize: '12px' }}>ID: {log.id.slice(0, 12)}</div>
                       <div style={{ height: '14px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                       <div className="flex items-center text-[#52525b] font-bold uppercase tracking-wider" style={{ gap: '8px', fontSize: '12px' }}>
                          <ShieldCheck size={14} className="opacity-50" />
                          {log.trigger_type} source
                       </div>
                    </div>
                  </div>

                  <div className="text-[#86868b] font-semibold tabular-nums group-hover:text-white transition-colors" style={{ fontSize: '14px' }}>
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
