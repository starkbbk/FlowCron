import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Activity, Plus, GitBranch, Clock, Play
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import useWorkflowStore from '../stores/workflowStore';
import { StatSkeleton } from '../components/common/LoadingSkeleton';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const workflows = useWorkflowStore(state => state.workflows);
  const setWorkflows = useWorkflowStore(state => state.setWorkflows);

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both in parallel for efficiency
        const [dashRes, wfRes] = await Promise.all([
          api.get('/dashboard/overview'),
          api.get('/workflows/'),
        ]);
        setDashboardData(dashRes.data);
        setWorkflows(wfRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeWorkflowsCount = useMemo(() => 
    workflows.filter(w => w.status === 'active' || w.status === 'running').length
  , [workflows]);

  const stats = useMemo(() => [
    { label: 'Total Workflows', value: dashboardData?.total_workflows || 0, icon: GitBranch, color: '#007aff', glow: 'shadow-[0_0_30px_rgba(0,122,255,0.2)]' },
    { label: 'Active Flows', value: activeWorkflowsCount, icon: Activity, color: '#34c759', status: 'Active', glow: 'shadow-[0_0_30px_rgba(52,199,89,0.2)]' },
    { label: 'Runs Today', value: dashboardData?.total_executions_today || 0, icon: Play, color: '#ff2d55', glow: 'shadow-[0_0_30px_rgba(255,45,85,0.2)]' },
    { label: 'Avg Latency', value: `${dashboardData?.avg_execution_time || '0.4'}s`, icon: Clock, color: '#ff9500', glow: 'shadow-[0_0_30px_rgba(255,149,0,0.2)]' },
  ], [dashboardData, activeWorkflowsCount]);

  if (isLoading) return <StatSkeleton />;

  return (
    <div 
      className="flex flex-col gap-12 lg:gap-16 pb-20 mx-auto w-full pt-12 lg:pt-24 relative z-10"
      style={{ maxWidth: '1600px', paddingLeft: '80px', paddingRight: '80px' }}
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[40px] lg:text-[52px] font-black text-white tracking-tighter mb-4"
          >
            Welcome back, {user?.username || user?.email?.split('@')[0]}
          </motion.h1>
          <p className="text-[18px] text-[#86868b] font-semibold max-w-xl leading-relaxed opacity-80">
            Everything is running smoothly. Your automation infrastructure is currently at <span className="text-[#34c759]">{dashboardData?.system_uptime || '99.9%'} uptime</span>.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/workflows')}
          className="flex items-center gap-3 bg-[#007aff] text-white font-black rounded-3xl hover:bg-[#006ce6] shadow-[0_15px_40px_rgba(0,122,255,0.4),0_0_80px_rgba(0,122,255,0.2)] transition-all cursor-pointer border border-white/20"
          style={{
            padding: '20px 48px',
            fontSize: '18px',
            letterSpacing: '-0.02em'
          }}
        >
          <Plus size={24} strokeWidth={4} />
          New Workflow
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`mac-bento-card flex flex-col items-center justify-center gap-8 h-[220px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-white/10 ${stat.glow}`}
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(40px)',
              padding: '56px'
            }}
          >
            <div className="flex items-center justify-center rounded-[16px] border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                  boxShadow: `0 0 10px ${stat.color}30`
                }}
              >
                <stat.icon size={18} strokeWidth={2.5} />
            </div>

            <div className="text-center">
              <div className="text-[28px] font-black text-white leading-none tracking-tighter mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-[0.2em] opacity-60">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-10">
        {/* Chart Card */}
        <div className="xl:col-span-2 space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mac-bento-card flex flex-col shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)] border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              backdropFilter: 'blur(40px)',
              padding: '64px'
            }}
          >
            <div className="flex justify-between items-center mb-10 lg:mb-14 px-10">
              <div>
                <h3 className="text-[24px] lg:text-[28px] font-black text-white tracking-tighter">Activity Overview</h3>
                <p className="text-[15px] text-[#86868b] mt-1 font-semibold opacity-60">System-wide traffic monitoring</p>
              </div>
              <div className="text-[11px] lg:text-[12px] font-black text-[#86868b] uppercase tracking-[0.2em] px-8 py-3.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                Real-time Data
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-[300px] lg:min-h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.execution_chart_data || []}>
                  <defs>
                    <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007aff" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#007aff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#86868b', fontSize: 11, fontWeight: 600 }}
                    dy={16}
                    tickFormatter={(val) => val.split('-').slice(-2).join('/')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#86868b', fontSize: 11, fontWeight: 600 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(28,28,30,0.85)', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(20px)'
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '8px' }}
                    itemStyle={{ color: '#007aff', fontWeight: 700, fontSize: '15px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="executions" 
                    stroke="#007aff" 
                    fill="url(#colorExec)" 
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: '#007aff', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* New Feature: Node Performance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mac-bento-card space-y-14 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              backdropFilter: 'blur(40px)',
              padding: '64px'
            }}
          >
             <div className="absolute right-0 top-0 w-80 h-80 bg-[#ff9500]/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
             <div className="flex justify-between items-center relative z-10 px-10">
                <div>
                   <h3 className="text-[24px] font-black text-white tracking-tighter">Node Reliability</h3>
                   <p className="text-[14px] text-[#86868b] mt-1 font-semibold opacity-60">Uptime distribution and signal strength</p>
                </div>
                <div className="bg-[#ff9500]/10 p-4 rounded-2xl border border-[#ff9500]/20 shadow-[0_0_20px_rgba(255,149,0,0.2)]">
                   <Zap size={24} className="text-[#ff9500] fill-[#ff9500]/20" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
                {[
                  { label: 'Triggers', rate: dashboardData?.node_reliability?.manual_trigger || '100%', color: '#007aff', glow: 'shadow-[0_0_15px_rgba(0,122,255,0.4)]' },
                  { label: 'HTTP Req', rate: dashboardData?.node_reliability?.http_request || '100%', color: '#32ade6', glow: 'shadow-[0_0_15px_rgba(50,173,230,0.4)]' },
                  { label: 'AI Gen', rate: dashboardData?.node_reliability?.send_email || '100%', color: '#af52de', glow: 'shadow-[0_0_15px_rgba(175,82,222,0.4)]' },
                  { label: 'Storage', rate: dashboardData?.node_reliability?.storage || '100%', color: '#ff9500', glow: 'shadow-[0_0_15px_rgba(255,149,0,0.4)]' }
                ].map((item, i) => (
                  <div key={i} className="space-y-4">
                     <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#86868b] opacity-60">{item.label}</span>
                     <div className="flex flex-col gap-3">
                        <span className="text-[32px] font-black text-white tabular-nums tracking-tighter">{item.rate}</span>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: item.rate }}
                             transition={{ duration: 1.5, type: 'spring' }}
                             className={`h-full rounded-full ${item.glow}`}
                             style={{ backgroundColor: item.color }}
                           />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-10">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.6 }}
             className="mac-bento-card min-h-[600px] flex flex-col shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden"
             style={{
               background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
               backdropFilter: 'blur(40px)',
               padding: '64px'
             }}
           >
              <div className="absolute right-0 top-0 w-80 h-80 bg-[#34c759]/5 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

              <div className="flex justify-between items-center mb-10 relative z-10 px-10">
                 <div>
                   <h3 className="text-[22px] font-black text-white tracking-tighter">Live Monitor</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#34c759] shadow-[0_0_8px_#34c759] animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#34c759]">Incoming Signals</span>
                   </div>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    <Activity size={22} className="text-[#86868b]" />
                 </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pr-2 relative z-10">
                 {dashboardData?.recent_executions?.length > 0 ? (
                   dashboardData.recent_executions.slice(0, 6).map((exec) => (
                    <div key={exec.id} className="flex gap-6 group items-start p-6 hover:bg-white/5 rounded-3xl transition-colors border border-transparent hover:border-white/10 cursor-pointer">
                        <div 
                          className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-md ${
                            exec.status === 'completed' ? 'bg-[#34c759] shadow-[0_0_8px_#34c759]' : 
                            exec.status === 'failed' ? 'bg-[#ff2d55] shadow-[0_0_8px_#ff2d55]' : 
                            'bg-[#007aff] shadow-[0_0_8px_#007aff] animate-pulse'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                           <div className="text-[14px] font-bold text-white truncate group-hover:text-[#007aff] transition-colors">
                             Workflow {exec.status} <span className="text-[#86868b] font-mono text-[11px] ml-1 uppercase">{exec.id.slice(0, 8)}</span>
                           </div>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">{exec.status}</span>
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                              <span className="text-[12px] text-[#86868b] font-medium tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </div>
                    </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-40">
                      <Clock size={40} className="mb-4 text-white" />
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#86868b]">No signals detected</div>
                   </div>
                 )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10 relative z-10 w-full">
                 <div 
                   className="bg-[#007aff]/10 border border-[#007aff]/30 shadow-[0_8px_32px_rgba(0,122,255,0.15)] backdrop-blur-xl"
                   style={{ padding: '48px', borderRadius: '40px' }}
                 >
                    <div className="flex items-center gap-2.5 text-[#007aff] mb-3">
                       <Zap size={18} fill="currentColor" />
                       <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Scale Fast</span>
                    </div>
                    <p className="text-[14px] text-white/90 leading-relaxed font-medium">
                       Scale your work with the <strong className="text-white font-extrabold text-[15px]">Schedule Node</strong>.
                    </p>
                    </div>
               </div>
            </motion.div>
         </div>
      </div>
    </div>
  );
}
