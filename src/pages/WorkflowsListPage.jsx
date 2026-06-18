import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, GitBranch, Play, Clock, Webhook, Zap,
  MoreHorizontal, Edit2, LayoutGrid, List as ListIcon, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { GlassInput, GlassSelect } from '../components/ui/GlassInput';
import StatusBadge from '../components/common/StatusBadge';
import GlassModal from '../components/ui/GlassModal';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import TemplatesDialog from '../components/common/TemplatesDialog';

import api from '../services/api';
import useWorkflowStore from '../stores/workflowStore';
import { timeAgo } from '../utils/helpers';

export default function WorkflowsListPage() {
  const [view, setView] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const navigate = useNavigate();
  const workflows = useWorkflowStore(state => state.workflows);
  const setWorkflows = useWorkflowStore(state => state.setWorkflows);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/workflows/');
      setWorkflows(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const onCreateWorkflow = async (data) => {
    try {
      const res = await api.post('/workflows/', data);
      toast.success('Workflow created successfully');
      setIsModalOpen(false);
      reset();
      fetchWorkflows();
      navigate(`/workflows/${res.data.id}/edit`);
    } catch (err) {
      toast.error('Failed to create workflow');
    }
  };

  const onSelectTemplate = (template) => {
    toast.success(`Starting with ${template.name} template`);
    setIsTemplateModalOpen(false);
    setIsModalOpen(true);
    reset({
      name: `My ${template.name}`,
      description: template.description,
      trigger_type: 'manual'
    });
  };

  const filteredWorkflows = useMemo(() => {
    return (workflows || []).filter(wf => {
      if (!wf || !wf.name) return false;
      const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || wf.status === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchQuery, filterStatus]);

  const getTriggerIcon = (type) => {
    switch(type) {
      case 'cron': return <Clock size={14} />;
      case 'webhook': return <Webhook size={14} />;
      default: return <Play size={14} />;
    }
  };

  return (
    <div 
      className="flex flex-col gap-6 lg:gap-8 pb-20 mx-auto w-full pt-6 lg:pt-10 relative z-10"
      style={{ maxWidth: '1400px' }}
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[32px] md:text-[40px] font-black text-white tracking-tight"
          >
            Workflows
          </motion.h1>
          <p className="text-[15px] text-[#94a3b8] font-medium mt-1">
            Design, deploy and scale your automated pipelines with precision.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Vercel-style search */}
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#06b6d4] transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search workflows..."
              className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/10 rounded-xl focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/20 outline-none transition-all placeholder:text-[#86868b] font-medium text-white shadow-inner"
              style={{ paddingLeft: '40px', paddingRight: '16px', height: '42px', fontSize: '14px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl">
            {['All', 'Active', 'Paused'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="font-bold text-[13px] transition-all cursor-pointer px-3 py-1.5 rounded-lg"
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

          {/* View switcher */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl">
            <button 
              onClick={() => setView('grid')}
              className="transition-all flex items-center justify-center cursor-pointer w-8 h-8 rounded-lg"
              style={{
                backgroundColor: view === 'grid' ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: view === 'grid' ? '#ffffff' : '#94a3b8',
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setView('list')}
              className="transition-all flex items-center justify-center cursor-pointer w-8 h-8 rounded-lg"
              style={{
                backgroundColor: view === 'list' ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: view === 'list' ? '#ffffff' : '#94a3b8',
              }}
            >
              <ListIcon size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton 
              variant="secondary" 
              icon={Zap} 
              onClick={() => setIsTemplateModalOpen(true)}
              className="!py-2.5 !px-4 bg-white/5 border-white/10 hidden md:flex"
            >
              Templates
            </GlassButton>
            <GlassButton icon={Plus} onClick={() => setIsModalOpen(true)} className="!py-2.5 !px-5 font-bold">
              New
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredWorkflows.length === 0 ? (
        <GlassCard padding="large" className="flex flex-col items-center justify-center text-center border border-white/[0.08]" hover={false} style={{ paddingTop: '80px', paddingBottom: '80px', borderRadius: '24px' }}>
          <div className="flex items-center justify-center border border-white/10 shadow-inner" style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: '24px' }}>
            <GitBranch size={32} className="text-[#94a3b8]" />
          </div>
          <h3 className="font-bold text-white tracking-tight text-[20px] mb-2">No workflows found</h3>
          <p className="text-[#94a3b8] font-medium text-[15px] mb-6 max-w-sm leading-relaxed">
            {searchQuery ? "No workflows match your search query." : "Create your first workflow to start automating your tasks."}
          </p>
          <GlassButton variant="secondary" onClick={() => setIsModalOpen(true)} className="!px-6">
            Get Started
          </GlassButton>
        </GlassCard>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredWorkflows.map((wf, idx) => (
              <motion.div 
                key={wf.id} 
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                whileHover={{ y: -5, scale: 1.015 }}
                className="flex flex-col group cursor-pointer border border-white/[0.08] transition-all duration-300 relative overflow-hidden"
                style={{ 
                  height: '310px', 
                  padding: '30px', 
                  backgroundColor: 'rgba(255,255,255,0.035)', 
                  backdropFilter: 'blur(32px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(140%)',
                  borderRadius: '20px',
                  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.06)',
                }}
                onClick={() => navigate(`/workflows/${wf.id}/edit`)}
              >
                {/* Status radial background glow on hover */}
                <div 
                  className="absolute top-0 right-0 w-36 h-36 rounded-full blur-[45px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                  style={{ 
                    background: wf.status === 'active' 
                      ? 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' 
                      : 'radial-gradient(circle, rgba(148,163,184,0.08) 0%, transparent 70%)' 
                  }} 
                />

                <div className="flex justify-between items-start mb-6 w-full">
                  <div 
                    className={`flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-lg ${
                      wf.status === 'active' 
                        ? 'text-[#06b6d4] border-[#06b6d4]/20 bg-[#06b6d4]/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'text-[#94a3b8] border-white/10 bg-white/5'
                    }`}
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '16px', 
                    }}
                  >
                    <GitBranch size={24} strokeWidth={2.2} />
                  </div>
                  <StatusBadge status={wf.status} size="small" />
                </div>
                 
                <h3 className="font-extrabold text-white group-hover:text-[#06b6d4] transition-all duration-300 truncate tracking-tight text-[22px] mb-2">
                  {wf.name}
                </h3>
                <p className="text-[#fafafa] font-semibold line-clamp-2 opacity-80 text-[14px] leading-relaxed min-h-[44px] mb-6">
                  {wf.description || "Design intelligent automation for this workflow pipeline."}
                </p>

                <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/[0.05]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center font-bold uppercase tracking-wider text-[#94a3b8] gap-1.5 text-[11px]">
                      <span className="text-[#06b6d4]">{getTriggerIcon(wf.trigger_type)}</span>
                      <span>{wf.trigger_type}</span>
                    </div>
                    <div className="font-bold text-[#86868b] uppercase tracking-wider text-[11px] tabular-nums">
                      {timeAgo(wf.last_executed_at)}
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button className="text-[#94a3b8] hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <GlassCard padding="none" className="overflow-hidden border border-white/[0.08]" hover={false} style={{ borderRadius: '20px' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Workflow Name</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Status</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Trigger</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Last Run</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredWorkflows.map((wf) => (
                  <tr 
                    key={wf.id} 
                    className="hover:bg-white/[0.02] transition-all cursor-pointer group"
                    onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                  >
                    <td className="px-8 py-4">
                      <div className="font-semibold text-white group-hover:text-[#06b6d4] transition-colors mb-0.5">{wf.name}</div>
                      <div className="text-[13px] text-[#94a3b8] font-medium truncate max-w-[320px]">{wf.description}</div>
                    </td>
                    <td className="px-8 py-4">
                      <StatusBadge status={wf.status} size="small" />
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#94a3b8] capitalize">
                        <div className="text-[#86868b] group-hover:text-[#06b6d4] transition-colors">
                          {getTriggerIcon(wf.trigger_type)}
                        </div>
                        {wf.trigger_type}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-[13px] font-semibold text-[#94a3b8] tabular-nums">
                      {timeAgo(wf.last_executed_at)}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-[#94a3b8] hover:text-[#06b6d4] transition-all cursor-pointer">
                          <Edit2 size={15} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-[#94a3b8] hover:text-white transition-all cursor-pointer">
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Create Workflow Modal */}
      <GlassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New Workflow"
        maxWidth="540px"
      >
        <form onSubmit={handleSubmit(onCreateWorkflow)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <GlassInput 
              label="Workflow Name"
              placeholder="e.g., Data Sync Automation"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <GlassInput 
              label="Description"
              placeholder="What does this workflow do?"
              {...register('description')}
            />
            <GlassSelect 
              label="Trigger"
              {...register('trigger_type')}
              options={[
                { label: 'Manual', value: 'manual' },
                { label: 'Schedule (Cron)', value: 'cron' },
                { label: 'Webhook', value: 'webhook' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
             <button 
               type="button" 
               onClick={() => setIsModalOpen(false)} 
               className="font-bold cursor-pointer transition-all hover:bg-white/5 active:scale-95 flex-1 py-3.5 rounded-xl text-[#94a3b8] bg-white/5 border border-white/10"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={isSubmitting}
               className="font-bold cursor-pointer transition-all hover:opacity-90 active:scale-95 flex-1 py-3.5 rounded-xl text-white flex justify-center items-center"
               style={{ 
                 background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                 boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                 border: 'none',
               }}
             >
               {isSubmitting ? <Loader2 className="animate-spin text-white" size={18} /> : 'Create Workflow'}
             </button>
          </div>
        </form>
      </GlassModal>

      {/* Templates Gallery */}
      <TemplatesDialog 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={onSelectTemplate}
      />
    </div>
  );
}
