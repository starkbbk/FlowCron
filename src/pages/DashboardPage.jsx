import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    { label: 'Total Workflows', value: dashboardData?.total_workflows || 0, icon: GitBranch, color: '#007aff' },
    { label: 'Active Flows', value: activeWorkflowsCount, icon: Activity, color: '#34c759', status: 'Active' },
    { label: 'Runs Today', value: dashboardData?.total_executions_today || 0, icon: Play, color: '#ff2d55' },
    { label: 'Success Rate', value: `${dashboardData?.success_rate || 0}%`, icon: Zap, color: '#ffcc00' },
  ], [dashboardData, activeWorkflowsCount]);

  if (isLoading) return <StatSkeleton />;

  return (
    <div 
      className="flex flex-col gap-16 pb-20 mx-auto"
      style={{ 
        maxWidth: '1400px', 
        paddingLeft: '24px', 
        paddingRight: '24px',
        paddingTop: '120px' 
      }}
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Welcome back, {user?.username || user?.email?.split('@')[0]}
          </h1>
          <p className="text-[17px] text-[#86868b] font-medium max-w-xl leading-relaxed">
            Everything is running smoothly. Your automation infrastructure is currently at 99.8% uptime.
          </p>
        </div>
        <button 
          onClick={() => navigate('/workflows')}
          className="flex items-center gap-2 px-8 py-4 bg-[#007aff] text-white text-[15px] font-bold rounded-2xl shadow-xl hover:bg-[#006ce6] active:scale-95 transition-all mt-4 md:mt-0"
        >
          <Plus size={20} strokeWidth={2.5} />
          New Workflow
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="mac-bento-card p-10 flex flex-col h-full shadow-2xl relative overflow-hidden"
          >
            {/* Soft glow behind the icon */}
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none"
              style={{ backgroundColor: stat.color }}
            />
            
            <div 
              className="flex justify-between items-start relative z-10"
              style={{ marginBottom: '64px' }}
            >
              <div 
                className="flex items-center justify-center rounded-2xl border border-white/10 shadow-inner"
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  backgroundColor: `${stat.color}15`,
                  color: stat.color 
                }}
              >
                <stat.icon size={26} strokeWidth={2.5} />
              </div>
              {stat.status && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#34c759]/10 rounded-full border border-[#34c759]/20 shadow-sm transition-transform hover:scale-105">
                  <div className="w-2 h-2 rounded-full bg-[#34c759] shadow-[0_0_8px_#34c759]" />
                  <span className="text-[11px] font-bold text-[#34c759] uppercase tracking-wider">
                    {stat.status}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-auto relative z-10">
              <div className="text-[40px] font-bold text-white leading-none tracking-tight">
                {stat.value}
              </div>
              <div className="text-[15px] font-bold text-[#86868b] mt-3 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Chart Card */}
        <div className="xl:col-span-2">
          <div className="mac-bento-card p-12 min-h-[500px] flex flex-col shadow-2xl relative z-10">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-[24px] font-bold text-white tracking-tight">Activity Stats</h3>
              <div className="text-[12px] font-bold text-[#86868b] uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                Last 7 Days
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.execution_chart_data || []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
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
                    tick={{ fill: '#86868b', fontSize: 13, fontWeight: 600 }}
                    dy={16}
                    tickFormatter={(val) => val.split('-').slice(-2).join('/')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#86868b', fontSize: 13, fontWeight: 600 }} 
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
                    strokeWidth={4}
                    activeDot={{ r: 8, fill: '#007aff', stroke: '#fff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="h-full">
           <div className="mac-bento-card p-12 min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-[#34c759]/10 to-transparent blur-[50px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />

              <div className="flex justify-between items-center mb-12 relative z-10">
                 <h3 className="text-[24px] font-bold text-white tracking-tight">Recent Activity</h3>
                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Activity size={20} className="text-[#86868b]" />
                 </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar pr-2 relative z-10">
                 {dashboardData?.recent_executions?.length > 0 ? (
                   dashboardData.recent_executions.map((exec) => (
                    <div key={exec.id} className="flex gap-5 group items-start">
                        <div 
                          className={`mt-1.5 h-3 w-3 rounded-full flex-shrink-0 shadow-md ${
                            exec.status === 'completed' ? 'bg-[#34c759] shadow-[0_0_8px_#34c759]' : 
                            exec.status === 'failed' ? 'bg-[#ff2d55] shadow-[0_0_8px_#ff2d55]' : 
                            'bg-[#007aff] shadow-[0_0_8px_#007aff] animate-pulse'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                           <div className="text-[15px] font-bold text-white truncate group-hover:text-[#007aff] transition-colors">
                             Workflow Run <span className="text-[#86868b] font-mono text-[13px] ml-1 uppercase">{exec.id.slice(0, 8)}</span>
                           </div>
                           <div className="flex items-center gap-3 mt-2">
                              <div className="text-[13px] font-bold text-[#86868b] uppercase tracking-widest">{exec.status}</div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                              <div className="text-[13px] text-[#86868b] font-bold tabular-nums">12:34 PM</div>
                           </div>
                        </div>
                    </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center py-24 opacity-40">
                      <Clock size={48} className="mb-6 text-white" />
                      <div className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#86868b]">No signals detected</div>
                   </div>
                 )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                 <div className="p-6 rounded-2xl bg-[#007aff]/10 border border-[#007aff]/30 shadow-inner">
                    <div className="flex items-center gap-2 text-[#007aff] mb-3">
                       <Zap size={18} fill="currentColor" />
                       <span className="text-[13px] font-bold uppercase tracking-widest">Pro Tip</span>
                    </div>
                    <p className="text-[14px] text-white/80 leading-relaxed font-medium">
                       Scale your work by setting a <strong className="text-white">Schedule Node</strong> for automatic execution.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
