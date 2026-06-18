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
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

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
    { label: 'Total Workflows', value: dashboardData?.total_workflows || 0, icon: GitBranch, color: '#3b82f6', path: '/workflows' },
    { label: 'Active Flows', value: activeWorkflowsCount, icon: Activity, color: '#06b6d4', path: '/workflows' },
    { label: 'Runs Today', value: dashboardData?.total_executions_today || 0, icon: Play, color: '#ef4444', path: '/executions' },
    { label: 'Avg Latency', value: `${dashboardData?.avg_execution_time || '0.4'}s`, icon: Clock, color: '#f59e0b', path: '/activity' },
  ], [dashboardData, activeWorkflowsCount]);

  if (isLoading) return <StatSkeleton />;

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-20 mx-auto w-full pt-6 lg:pt-10 relative z-10">
      {/* Dashboard Hero Banner: padding 32px */}
      <GlassCard 
        padding="none" 
        className="relative overflow-hidden border border-white/[0.08]" 
        hover={false}
        style={{
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '32px'
        }}
      >
        {/* Soft background light beams */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-[#2563EB]/15 via-[#06B6D4]/5 to-transparent blur-[110px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
          <div className="flex-1">
            {/* Uptime status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-black tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              System Status: {dashboardData?.system_uptime || '99.9%'} Uptime
            </div>
            
            {/* Title spacing mb: 12px */}
            <h1 className="text-[32px] md:text-[42px] font-black text-white tracking-tight leading-tight mt-4" style={{ marginBottom: '12px' }}>
              Welcome back, {user?.username || user?.email?.split('@')[0]}
            </h1>
            
            {/* Description spacing mb: 24px */}
            <p className="text-[16px] text-[#94a3b8] font-medium max-w-xl leading-relaxed" style={{ marginBottom: '24px' }}>
              Your workflow infrastructure is fully operational. All pipeline signals are responding with optimal latency rates.
            </p>

            {/* Inline Stats Row: mt 24px */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-6 border-t border-white/[0.06]" style={{ marginTop: '24px' }}>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-white">{dashboardData?.total_workflows || 0}</span>
                <span className="text-[12px] text-[#94a3b8] font-semibold">Workflows Configured</span>
              </div>
              <div className="h-3.5 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-white">{activeWorkflowsCount}</span>
                <span className="text-[12px] text-[#94a3b8] font-semibold">Active Pipelines</span>
              </div>
              <div className="h-3.5 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-white">
                  {dashboardData?.recent_executions?.[0]?.status 
                    ? `Workflow ${dashboardData.recent_executions[0].status}` 
                    : 'Idle'}
                </span>
                <span className="text-[12px] text-[#94a3b8] font-semibold">Last Execution</span>
              </div>
            </div>
          </div>

          {/* Quick Actions: Gap 16px */}
          <div className="flex flex-wrap items-center shrink-0" style={{ gap: '16px' }}>
            <GlassButton 
              variant="secondary" 
              onClick={() => navigate('/workflows')} 
              className="!py-3.5 !px-6 font-bold"
            >
              Manage Flows
            </GlassButton>
            <GlassButton 
              variant="primary" 
              onClick={() => navigate('/workflows')} 
              className="!py-3.5 !px-6 font-bold"
            >
              <Plus size={18} strokeWidth={2.8} className="mr-1" />
              New Workflow
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid: padding 24px */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -6, scale: 1.015 }}
            onClick={() => stat.path && navigate(stat.path)}
            className="flex flex-col justify-between h-[180px] cursor-pointer rounded-[20px] border border-white/[0.08] transition-all duration-300 relative group overflow-hidden"
            style={{
              padding: '24px', // Enforce top/side/bottom padding: 24px
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 25px ${stat.color}08, inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)`
            }}
          >
            {/* Corner hover glow */}
            <div 
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[35px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
              style={{ background: stat.color }} 
            />

            <div className="flex justify-between items-start w-full">
              <span className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-widest leading-none">
                {stat.label}
              </span>
              <div 
                className="flex items-center justify-center rounded-xl w-10 h-10 border border-white/10 transition-transform duration-500 group-hover:scale-110 shadow-md shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`,
                  color: stat.color,
                  boxShadow: `0 6px 16px ${stat.color}15`,
                  marginRight: '0px'
                }}
              >
                <stat.icon size={20} strokeWidth={2} />
              </div>
            </div>

            {/* Metric number: margin-top: auto */}
            <div className="flex flex-col mt-auto" style={{ marginTop: 'auto' }}>
              <div className="text-[34px] font-black text-white tracking-tight leading-none tabular-nums">
                {stat.value}
              </div>
              {/* Label under number: margin-top: 12px */}
              <div className="text-[10px] font-bold text-[#06b6d4] opacity-80 flex items-center gap-1.5 uppercase tracking-wider" style={{ marginTop: '12px' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#06b6d4] animate-pulse" />
                Live telemetry
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          <GlassCard 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            hover={false}
            padding="none"
            className="flex flex-col border border-white/[0.08]"
            style={{
              padding: '24px', // Chart area padding: 24px
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.035)'
            }}
          >
            {/* Title spacing: margin-bottom: 8px. Description spacing: margin-bottom: 20px */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[22px] font-black text-white tracking-tight" style={{ marginBottom: '8px' }}>Activity Overview</h3>
                <p className="text-[14px] text-[#94a3b8] font-medium" style={{ marginBottom: '20px' }}>System-wide traffic monitoring</p>
              </div>
              <div className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl">
                Real-time Data
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-[300px] lg:min-h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.execution_chart_data || []}>
                  <defs>
                    <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    dy={12}
                    tickFormatter={(val) => val.split('-').slice(-2).join('/')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(5, 9, 20, 0.9)', 
                      borderColor: 'rgba(255,255,255,0.08)', 
                      borderRadius: '16px',
                      padding: '12px 16px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(20px)'
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '6px' }}
                    itemStyle={{ color: '#06b6d4', fontWeight: 700, fontSize: '14px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="executions" 
                    stroke="#2563EB" 
                    fill="url(#colorExec)" 
                    strokeWidth={2.5}
                    activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 1.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Node Performance: Widget padding 28px */}
          <GlassCard 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            hover={false}
            padding="none"
            className="overflow-hidden relative border border-white/[0.08]"
            style={{
              padding: '28px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.035)'
            }}
          >
             <div className="absolute right-0 top-0 w-80 h-80 bg-[#f59e0b]/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
             <div className="flex justify-between items-center relative z-10" style={{ marginBottom: '24px' }}>
                <div>
                   <h3 className="text-[22px] font-black text-white tracking-tight">Node Reliability</h3>
                   <p className="text-[14px] text-[#94a3b8] mt-0.5 font-medium">Uptime distribution and signal strength</p>
                </div>
                <div className="bg-[#f59e0b]/10 p-3.5 rounded-xl border border-[#f59e0b]/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                   <Zap size={22} className="text-[#f59e0b] fill-[#f59e0b]/10" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                {[
                  { label: 'Triggers', rate: dashboardData?.node_reliability?.manual_trigger || '100%', color: '#2563EB', glow: 'shadow-[0_0_15px_rgba(37,99,235,0.4)]' },
                  { label: 'HTTP Req', rate: dashboardData?.node_reliability?.http_request || '100%', color: '#06b6d4', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]' },
                  { label: 'AI Gen', rate: dashboardData?.node_reliability?.send_email || '100%', color: '#8b5cf6', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.4)]' },
                  { label: 'Storage', rate: dashboardData?.node_reliability?.storage || '100%', color: '#f59e0b', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]' }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                     <span className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] opacity-75">{item.label}</span>
                     <div className="flex flex-col gap-2">
                        <span className="text-[28px] font-black text-white tabular-nums tracking-tight">{item.rate}</span>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: item.rate }}
                             transition={{ duration: 1.2, type: 'spring' }}
                             className={`h-full rounded-full ${item.glow}`}
                             style={{ backgroundColor: item.color }}
                           />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </GlassCard>
        </div>

        {/* Recent Activity / Live Monitor: Widget padding 28px */}
        <div className="flex flex-col gap-8">
           <GlassCard 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
             hover={false}
             padding="none"
             className="min-h-[550px] flex flex-col relative overflow-hidden border border-white/[0.08]"
             style={{
               padding: '28px',
               borderRadius: '24px',
               background: 'rgba(255, 255, 255, 0.035)'
             }}
           >
              <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

              <div className="flex justify-between items-center mb-8 relative z-10">
                 <div>
                   <h3 className="text-[20px] font-black text-white tracking-tight">Live Monitor</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Incoming Signals</span>
                   </div>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Activity size={20} className="text-[#94a3b8]" />
                 </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1 relative z-10">
                 {dashboardData?.recent_executions?.length > 0 ? (
                   dashboardData.recent_executions.slice(0, 6).map((exec) => (
                    <div 
                      key={exec.id} 
                      onClick={() => navigate(`/executions/${exec.id}`)}
                      className="flex gap-4 group items-start p-4 hover:bg-white/[0.04] rounded-xl transition-all border border-transparent hover:border-white/10 cursor-pointer"
                    >
                        <div 
                          className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-md ${
                            exec.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                            exec.status === 'failed' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 
                            'bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                           <div className="text-[14px] font-bold text-white truncate group-hover:text-[#06b6d4] transition-colors">
                             Workflow {exec.status} <span className="text-[#94a3b8] font-mono text-[11px] ml-1 uppercase">{exec.id.slice(0, 8)}</span>
                           </div>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">{exec.status}</span>
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                              <span className="text-[12px] text-[#94a3b8] font-semibold tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </div>
                    </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-40">
                      <Clock size={40} className="mb-4 text-white" />
                      <div className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">No signals detected</div>
                   </div>
                 )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/[0.06] relative z-10 w-full">
                 <div 
                   className="bg-blue-500/5 border border-blue-500/20 shadow-[0_8px_32px_rgba(37,99,235,0.08)] backdrop-blur-xl"
                   style={{ padding: '20px', borderRadius: '18px' }}
                 >
                    <div className="flex items-center gap-2 text-[#06b6d4] mb-2">
                       <Zap size={16} fill="currentColor" />
                       <span className="text-[11px] font-bold uppercase tracking-widest">Scaling Tip</span>
                    </div>
                    <p className="text-[13px] text-white/90 leading-relaxed font-medium">
                       Scale your work efficiently by linking actions to the <strong className="text-white font-extrabold text-[14px]">Schedule Node</strong>.
                    </p>
                 </div>
               </div>
            </GlassCard>
         </div>
      </div>
    </div>
  );
}
