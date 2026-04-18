import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, GitBranch, Play, Clock, Webhook,
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
    return workflows.filter(wf => {
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
      className="space-y-8 lg:space-y-12 pb-20 mx-auto w-full px-6 lg:px-8 pt-12 lg:pt-24"
      style={{ maxWidth: '1400px' }}
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
        <div>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-2 lg:mb-3">Workflows</h1>
          <p className="text-[15px] lg:text-[17px] text-[#86868b] font-medium">Manage and monitor your automated pipelines.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-[#007aff] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search workflows..."
              className="w-full bg-[#1c1c1e] border border-white/10 rounded-2xl focus:border-[#007aff]/50 outline-none transition-all placeholder:text-[#52525b] font-medium text-white"
              style={{ paddingLeft: '52px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px', fontSize: '15px' }}
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
            {filteredWorkflows.map((wf) => (
              <div 
                key={wf.id} 
                className="flex flex-col group cursor-pointer hover:bg-white/5 transition-all"
                style={{ 
                  height: '340px', 
                  padding: '28px', 
                  backgroundColor: '#1c1c1e', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '24px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}
                onClick={() => navigate(`/workflows/${wf.id}/edit`)}
              >
                 <div className="flex justify-between items-start" style={{ marginBottom: '24px' }}>
                      <div 
                        className={`flex items-center justify-center border border-white/10 transition-colors group-hover:border-[#007aff]/30 ${wf.status === 'active' ? 'text-[#007aff]' : 'text-[#86868b]'}`}
                        style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#2c2c2e' }}
                      >
                         <GitBranch size={24} />
                      </div>
                    <StatusBadge status={wf.status} size="small" />
                 </div>
                 
                 <h3 className="font-extrabold text-white group-hover:text-[#007aff] transition-colors truncate" style={{ fontSize: '20px', marginBottom: '10px' }}>
                   {wf.name}
                 </h3>
                 <p className="text-[#86868b] font-medium line-clamp-2" style={{ fontSize: '15px', lineHeight: 1.6, minHeight: '48px', marginBottom: '20px' }}>
                   {wf.description || "No description provided for this workflow."}
                 </p>

                 <div className="mt-auto flex items-center justify-between" style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center" style={{ gap: '12px' }}>
                       <div className="flex items-center font-bold uppercase tracking-wider text-[#86868b]" style={{ gap: '8px', fontSize: '12px' }}>
                          <span className="text-[#007aff]">{getTriggerIcon(wf.trigger_type)}</span>
                          <span>{wf.trigger_type}</span>
                       </div>
                       <div style={{ width: '4px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
                       <div className="font-medium text-[#52525b]" style={{ fontSize: '13px' }}>
                         {timeAgo(wf.last_executed_at)}
                       </div>
                    </div>
                    <button className="text-[#52525b] hover:text-white transition-all hover:bg-white/10" style={{ padding: '8px', borderRadius: '10px' }}>
                       <MoreHorizontal size={20} />
                    </button>
                 </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <GlassCard padding="none" className="overflow-hidden border-[#27272a] bg-[#111113]">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-[#27272a] bg-[#18181b]">
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Workflow Name</th>
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Status</th>
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Trigger</th>
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Last Run</th>
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#52525b] text-right">Actions</th>
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
                         <td className="px-6 py-5">
                            <StatusBadge status={wf.status} size="small" />
                         </td>
                         <td className="px-6 py-5">
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
                         <td className="px-6 py-5 text-right">
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
