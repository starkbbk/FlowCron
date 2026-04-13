import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, GitBranch, Play, Clock, Webhook,
  MoreHorizontal, Edit2, LayoutGrid, List as ListIcon
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

import api from '../services/api';
import useWorkflowStore from '../stores/workflowStore';
import { timeAgo } from '../utils/helpers';

export default function WorkflowsListPage() {
  const [view, setView] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const navigate = useNavigate();
  const { workflows, setWorkflows } = useWorkflowStore(state => ({
    workflows: state.workflows,
    setWorkflows: state.setWorkflows
  }));

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
    <div className="space-y-12 pb-16 max-w-[1400px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
          <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight mb-2">Workflows</h1>
          <p className="text-[#71717a] font-medium">Manage and monitor your automated workflows.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-[#3b82f6] transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Search workflows..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#111113] border border-[#27272a] rounded-lg text-sm focus:border-[#3b82f650] outline-none transition-all placeholder:text-[#52525b] font-medium text-[#fafafa]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
             <div className="flex p-1 rounded-lg bg-[#111113] border border-[#27272a]">
               {['All', 'Active', 'Paused'].map(status => (
                 <button
                   key={status}
                   onClick={() => setFilterStatus(status)}
                   className={`px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                     filterStatus === status ? 'bg-[#18181b] text-[#fafafa] border border-[#27272a] shadow-sm' : 'text-[#52525b] hover:text-[#a1a1aa]'
                   }`}
                 >
                   {status}
                 </button>
               ))}
             </div>

             <div className="flex p-1 rounded-lg bg-[#111113] border border-[#27272a]">
                <button 
                   onClick={() => setView('grid')}
                   className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-[#18181b] text-[#fafafa] border border-[#27272a]' : 'text-[#52525b] hover:text-[#a1a1aa]'}`}
                >
                   <LayoutGrid size={16} />
                </button>
                <button 
                   onClick={() => setView('list')}
                   className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-[#18181b] text-[#fafafa] border border-[#27272a]' : 'text-[#52525b] hover:text-[#a1a1aa]'}`}
                >
                   <ListIcon size={16} />
                </button>
             </div>
          </div>

          <GlassButton icon={Plus} onClick={() => setIsModalOpen(true)} className="!py-2.5 !px-6">
            New Workflow
          </GlassButton>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredWorkflows.length === 0 ? (
        <GlassCard padding="large" className="flex flex-col items-center justify-center text-center py-32 bg-[#111113] border-[#27272a]" hover={false}>
           <div className="w-16 h-16 bg-[#18181b] rounded-xl flex items-center justify-center mb-6 text-[#27272a] border border-[#27272a]">
              <GitBranch size={32} />
           </div>
           <h3 className="text-xl font-bold text-[#fafafa] mb-2">No workflows found</h3>
           <p className="text-[#71717a] mb-8 max-w-sm font-medium">
             {searchQuery ? "No workflows match your search query." : "Create your first workflow to start automating your tasks."}
           </p>
           <GlassButton variant="secondary" onClick={() => setIsModalOpen(true)} className="!px-8">
             Get Started
           </GlassButton>
        </GlassCard>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredWorkflows.map((wf) => (
              <GlassCard 
                key={wf.id} 
                padding="standard"
                className="flex flex-col h-[280px] group cursor-pointer bg-[#111113] border-[#27272a] hover:bg-[#18181b]"
                onClick={() => navigate(`/workflows/${wf.id}/edit`)}
              >
                 <div className="flex justify-between items-start mb-6">
                      <div className={`p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] transition-colors group-hover:border-[#3b82f650] ${wf.status === 'active' ? 'text-[#3b82f6]' : 'text-[#52525b]'}`}>
                         <GitBranch size={18} />
                      </div>
                    <StatusBadge status={wf.status} size="small" />
                 </div>
                 
                 <h3 className="text-[17px] font-bold text-[#fafafa] mb-2 group-hover:text-[#3b82f6] transition-colors truncate">
                   {wf.name}
                 </h3>
                 <p className="text-[14px] text-[#71717a] font-medium leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
                   {wf.description || "No description provided for this workflow."}
                 </p>

                 <div className="mt-auto pt-5 border-t border-[#1f1f23] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">
                          {getTriggerIcon(wf.trigger_type)}
                          <span>{wf.trigger_type}</span>
                       </div>
                       <div className="w-1 h-1 rounded-full bg-[#27272a]" />
                       <div className="text-[11px] font-medium text-[#52525b]">
                         {timeAgo(wf.last_executed_at)}
                       </div>
                    </div>
                    <button className="p-2 text-[#52525b] hover:text-[#fafafa] transition-all">
                       <MoreHorizontal size={18} />
                    </button>
                 </div>
              </GlassCard>
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
      >
        <form onSubmit={handleSubmit(onCreateWorkflow)} className="space-y-8">
          <div className="space-y-6">
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
          <div className="pt-6 flex gap-3 border-t border-[#27272a]">
             <GlassButton variant="secondary" onClick={() => setIsModalOpen(false)} fullWidth className="!py-2.5">
               Cancel
             </GlassButton>
             <GlassButton type="submit" fullWidth className="!py-2.5">
               Create Workflow
             </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
