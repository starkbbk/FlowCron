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
    // In a real app, this would pre-fill the workflow creation or use a specific API
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
      className="flex flex-col gap-8 lg:gap-16 pb-20 mx-auto w-full pt-8 lg:pt-24 relative z-10 px-6 md:px-20"
      style={{ maxWidth: '1600px' }}
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-10 mb-8">
        <div className="min-w-[300px]">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[40px] lg:text-[52px] font-black text-white tracking-tighter mb-4"
          >
            Workflows
          </motion.h1>
          <p className="text-[17px] text-[#86868b] font-semibold max-w-lg leading-relaxed opacity-80">
            Design, deploy and scale your automated pipelines with precision.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 flex-1 justify-end min-w-[500px]">
          <div className="relative group flex-1 md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-[#007aff] transition-all duration-300" size={20} />
            <input 
              type="text"
              placeholder="Search flows..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl focus:border-[#007aff]/50 focus:bg-white/10 outline-none transition-all placeholder:text-[#52525b] font-bold text-white shadow-inner backdrop-blur-xl"
              style={{ paddingLeft: '64px', paddingRight: '24px', height: '72px', fontSize: '16px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center" style={{ gap: '16px' }}>
             <div className="flex items-center" style={{ gap: '6px', padding: '6px', backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
               {['All', 'Active', 'Paused'].map(status => (
                 <button
                   key={status}
                   onClick={() => setFilterStatus(status)}
                   className="font-bold transition-all"
                   style={{
                     padding: '10px 20px',
                     fontSize: '14px',
                     borderRadius: '12px',
                     backgroundColor: filterStatus === status ? 'rgba(255,255,255,0.1)' : 'transparent',
                     color: filterStatus === status ? '#ffffff' : '#86868b',
                     boxShadow: filterStatus === status ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                   }}
                 >
                   {status}
                 </button>
               ))}
             </div>

             <div className="flex items-center" style={{ gap: '6px', padding: '6px', backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                <button 
                   onClick={() => setView('grid')}
                   className="transition-all flex items-center justify-center cursor-pointer"
                   style={{
                     width: '40px',
                     height: '40px',
                     borderRadius: '12px',
                     backgroundColor: view === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent',
                     color: view === 'grid' ? '#ffffff' : '#86868b',
                     boxShadow: view === 'grid' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                   }}
                >
                   <LayoutGrid size={20} />
                </button>
                <button 
                   onClick={() => setView('list')}
                   className="transition-all flex items-center justify-center cursor-pointer"
                   style={{
                     width: '40px',
                     height: '40px',
                     borderRadius: '12px',
                     backgroundColor: view === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent',
                     color: view === 'list' ? '#ffffff' : '#86868b',
                     boxShadow: view === 'list' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                   }}
                >
                   <ListIcon size={20} />
                </button>
             </div>
          </div>

           <div className="flex items-center gap-3">
              <GlassButton 
                variant="secondary" 
                icon={Zap} 
                onClick={() => setIsTemplateModalOpen(true)}
                className="!py-2.5 !px-5 bg-white/5 border-white/10 hidden md:flex"
              >
                Templates
              </GlassButton>
              <GlassButton icon={Plus} onClick={() => setIsModalOpen(true)} className="!py-2.5 !px-6">
                New
              </GlassButton>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredWorkflows.length === 0 ? (
        <GlassCard padding="large" className="flex flex-col items-center justify-center text-center bg-[#1c1c1e] border-white/10" hover={false} style={{ paddingTop: '100px', paddingBottom: '100px' }}>
           <div className="flex items-center justify-center border border-white/10 shadow-inner" style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#2c2c2e', marginBottom: '32px' }}>
              <GitBranch size={40} className="text-[#86868b]" />
           </div>
           <h3 className="font-bold text-white tracking-tight" style={{ fontSize: '24px', marginBottom: '12px' }}>No workflows found</h3>
           <p className="text-[#86868b] font-medium" style={{ maxWidth: '420px', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
             {searchQuery ? "No workflows match your search query." : "Create your first workflow to start automating your tasks."}
           </p>
           <GlassButton variant="secondary" onClick={() => setIsModalOpen(true)} className="!px-8">
             Get Started
           </GlassButton>
        </GlassCard>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
          <AnimatePresence mode="popLayout">
            {filteredWorkflows.map((wf, idx) => (
              <motion.div 
                key={wf.id} 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col group cursor-pointer hover:bg-white/10 transition-all duration-500 overflow-hidden"
                style={{ 
                  height: '340px', 
                  padding: '40px', 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '32px',
                  boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4)',
                }}
                onClick={() => navigate(`/workflows/${wf.id}/edit`)}
              >
                 <div className="flex justify-between items-start mb-6">
                      <div 
                        className={`flex items-center justify-center border border-white/10 transition-all duration-500 group-hover:scale-110 shadow-2xl ${wf.status === 'active' ? 'text-[#007aff]' : 'text-[#86868b]'}`}
                        style={{ 
                          width: '72px', 
                          height: '72px', 
                          borderRadius: '24px', 
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          boxShadow: wf.status === 'active' ? '0 0 20px rgba(0,122,255,0.2)' : 'none'
                        }}
                      >
                         <GitBranch size={28} strokeWidth={2.5} />
                      </div>
                    <StatusBadge status={wf.status} size="small" className="scale-110" />
                 </div>
                 
                 <h3 className="font-black text-white group-hover:text-[#007aff] transition-all duration-500 truncate tracking-tight" style={{ fontSize: '24px', marginBottom: '12px' }}>
                   {wf.name}
                 </h3>
                 <p className="text-[#86868b] font-semibold line-clamp-2 opacity-60" style={{ fontSize: '16px', lineHeight: 1.6, minHeight: '52px', marginBottom: '32px' }}>
                   {wf.description || "Design intelligent automation for this workflow pipeline."}
                 </p>

                 <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex items-center gap-6">
                       <div className="flex items-center font-bold uppercase tracking-[0.15em] text-[#86868b]" style={{ gap: '10px', fontSize: '11px' }}>
                          <span className="text-[#007aff] shadow-[0_0_10px_rgba(0,122,255,0.4)]">{getTriggerIcon(wf.trigger_type)}</span>
                          <span className="opacity-80">{wf.trigger_type}</span>
                       </div>
                       <div className="font-bold text-[#52525b] uppercase tracking-widest" style={{ fontSize: '11px' }}>
                         {timeAgo(wf.last_executed_at)}
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="text-[#86868b] hover:text-white transition-all p-2.5 rounded-xl hover:bg-white/10">
                          <Edit2 size={20} />
                       </button>
                    </div>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <GlassCard padding="none" className="overflow-hidden border-[#27272a] bg-[#111113]">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-[#27272a] bg-[#18181b]">
                       <th className="px-10 py-5 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Workflow Name</th>
                       <th className="px-10 py-5 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Status</th>
                       <th className="px-10 py-5 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Trigger</th>
                       <th className="px-10 py-5 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Last Run</th>
                       <th className="px-10 py-5 text-[11px] font-bold uppercase tracking-wider text-[#52525b] text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#1f1f23]">
                    {filteredWorkflows.map((wf) => (
                      <tr 
                        key={wf.id} 
                        className="hover:bg-[#18181b] transition-all cursor-pointer group"
                        onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                       >
                         <td className="px-6 py-5">
                            <div className="font-semibold text-[#fafafa] group-hover:text-[#3b82f6] transition-colors mb-0.5">{wf.name}</div>
                            <div className="text-[12px] text-[#71717a] font-medium truncate max-w-[280px]">{wf.description}</div>
                         </td>
                         <td className="px-10 py-6">
                            <StatusBadge status={wf.status} size="small" />
                         </td>
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-2 text-[13px] font-medium text-[#71717a] capitalize">
                               <div className="text-[#52525b] group-hover:text-[#3b82f6] transition-colors">
                                  {getTriggerIcon(wf.trigger_type)}
                               </div>
                               {wf.trigger_type}
                            </div>
                         </td>
                         <td className="px-6 py-5 text-[12px] font-medium text-[#71717a] tabular-nums">
                            {timeAgo(wf.last_executed_at)}
                         </td>
                         <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-2 hover:bg-[#1f1f23] rounded-md text-[#52525b] hover:text-[#3b82f6] transition-all">
                                  <Edit2 size={16} />
                                </button>
                               <button className="p-2 hover:bg-[#1f1f23] rounded-md text-[#52525b] hover:text-[#fafafa] transition-all">
                                  <MoreHorizontal size={16} />
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
        <form onSubmit={handleSubmit(onCreateWorkflow)} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          <div style={{ display: 'flex', gap: '16px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
             <button 
               type="button" 
               onClick={() => setIsModalOpen(false)} 
               className="font-bold cursor-pointer transition-all hover:bg-white/5 active:scale-95"
               style={{ flex: 1, padding: '16px', borderRadius: '16px', color: '#86868b', backgroundColor: '#2c2c2e', border: '1px solid rgba(255,255,255,0.08)' }}
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={isSubmitting}
               className="font-bold cursor-pointer transition-all hover:opacity-90 active:scale-95 flex justify-center items-center"
               style={{ 
                 flex: 1, padding: '16px', borderRadius: '16px', color: '#ffffff', 
                 background: 'linear-gradient(135deg, #007aff, #5856d6)',
                 boxShadow: '0 4px 20px rgba(0,122,255,0.3)',
                 border: 'none',
               }}
             >
               {isSubmitting ? <Loader2 className="animate-spin text-white" size={20} /> : 'Create Workflow'}
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
