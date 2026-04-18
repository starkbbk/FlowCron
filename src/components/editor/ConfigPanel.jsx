import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Zap, Variable, Plus } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getNodeType, NODE_CATEGORIES } from '../../utils/nodeTypes';
import { GlassInput, GlassTextarea, GlassSelect, GlassToggle } from '../ui/GlassInput';
import GlassButton from '../ui/GlassButton';
import useWorkflowStore from '../../stores/workflowStore';

export default function ConfigPanel() {
  const { selectedNode, updateNodeConfig, setNodes, nodes, deselectNode } = useWorkflowStore();
  
  if (!selectedNode) return null;

  const nodeType = getNodeType(selectedNode.data.type);
  const category = NODE_CATEGORIES[nodeType?.category || 'action'];
  const Icon = Icons[nodeType?.icon] || Zap;

  const handleChange = (key, value) => {
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this step?')) {
      setNodes(nodes.filter(n => n.id !== selectedNode.id));
      deselectNode();
    }
  };

  const renderField = (field) => {
    const value = selectedNode.data.config?.[field.name] ?? (field.default || '');

    switch(field.type) {
      case 'webhook_url_display':
        const baseUrl = window.location.origin;
        const webhookUrl = `${baseUrl}/api/webhooks/${selectedNode.id}`;
        return (
          <div key={field.name} className="flex flex-col gap-4 mb-8">
            <label className="text-[13px] font-bold text-[#a1a1aa] uppercase tracking-widest ml-1">
              {field.label}
            </label>
            <div className="flex gap-3">
              <input 
                readOnly
                value={webhookUrl}
                className="flex-1 px-4 py-3 rounded-xl text-[14px] text-white font-mono border border-[#3a3a3c] bg-[#111113] outline-none truncate shadow-inner focus:border-[#007aff]"
              />
              <GlassButton 
                variant="secondary" 
                className="!py-3 !px-5 !text-[13px] font-bold uppercase tracking-wider bg-white/5"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  toast.success('Webhook URL copied');
                }}
              >
                Copy
              </GlassButton>
            </div>
          </div>
        );
      case 'text':
      case 'number':
        return (
          <GlassInput 
            key={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="mb-6"
          />
        );
      case 'textarea':
      case 'code':
      case 'json_editor':
        if (field.name === 'body' && selectedNode.data.config?.method === 'GET') return null;
        
        return (
          <GlassTextarea 
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
               if (field.type === 'json_editor') {
                  try {
                     const parsed = JSON.parse(e.target.value);
                     handleChange(field.name, parsed);
                  } catch {
                     handleChange(field.name, e.target.value);
                  }
               } else {
                  handleChange(field.name, e.target.value);
               }
            }}
            className={`mb-6 ${field.type !== 'textarea' ? 'font-mono text-[12px]' : ''}`}
          />
        );
      case 'select':
        return (
          <GlassSelect 
            key={field.name}
            label={field.label}
            options={field.options}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="mb-6"
          />
        );
      case 'toggle':
        return (
          <div key={field.name} className="py-2 mb-4">
            <GlassToggle 
              label={field.label}
              checked={!!value}
              onChange={(val) => handleChange(field.name, val)}
            />
          </div>
        );
      case 'key_value_pairs':
        const kvPairs = Array.isArray(value) ? value : [];
        const isHeader = field.name === 'headers';
        const itemLabel = isHeader ? 'Header' : 'Case';
        
        return (
          <div key={field.name} className="space-y-3 mb-6">
            <label className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider ml-1">
              {field.label}
            </label>
            <div className="space-y-2">
              {kvPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2 group">
                  <input 
                    className="flex-1 px-3 py-2 text-[12px] rounded-lg border border-[#27272a] bg-[#18181b] outline-none focus:border-[#3b82f650] transition-all font-medium text-[#fafafa] placeholder:text-[#3f3f46]" 
                    placeholder={isHeader ? "Key" : "Condition"}
                    value={pair.key || ''}
                    onChange={(e) => {
                      const newPairs = [...kvPairs];
                      newPairs[idx] = { ...newPairs[idx], key: e.target.value };
                      handleChange(field.name, newPairs);
                    }}
                  />
                  <input 
                    className="flex-1 px-3 py-2 text-[12px] rounded-lg border border-[#27272a] bg-[#18181b] outline-none focus:border-[#3b82f650] transition-all font-medium text-[#fafafa] placeholder:text-[#3f3f46]" 
                    placeholder={isHeader ? "Value" : "Target"}
                    value={pair.value || ''}
                    onChange={(e) => {
                      const newPairs = [...kvPairs];
                      newPairs[idx] = { ...newPairs[idx], value: e.target.value };
                      handleChange(field.name, newPairs);
                    }}
                  />
                  <button 
                    className="p-2 text-[#52525b] hover:text-[#ef4444] transition-colors opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      const newPairs = kvPairs.filter((_, i) => i !== idx);
                      handleChange(field.name, newPairs);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              className="w-full py-3 rounded-lg border border-dashed border-[#27272a] text-[11px] font-bold uppercase tracking-wider text-[#52525b] hover:bg-[#18181b] hover:text-[#fafafa] transition-all flex items-center justify-center gap-2"
              onClick={() => handleChange(field.name, [...kvPairs, { key: '', value: '' }])}
            >
              <Plus size={12} /> Add {itemLabel}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const isMobile = window.innerWidth < 1024;

  return (
    <motion.div
      initial={{ x: isMobile ? 0 : 440, y: isMobile ? 800 : 0 }}
      animate={{ x: 0, y: 0 }}
      exit={{ x: isMobile ? 0 : 440, y: isMobile ? 800 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed lg:relative bottom-0 lg:bottom-auto right-0 lg:right-auto h-[80vh] lg:h-full w-full lg:w-[440px] flex flex-col bg-[#1e1e1e]/90 backdrop-blur-3xl border-t lg:border-t-0 lg:border-l border-white/10 z-[110] lg:z-40 shadow-2xl font-['Inter'] rounded-t-[32px] lg:rounded-none overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner" style={{ color: category.color }}>
               <Icon size={24} strokeWidth={2.5} />
            </div>
            <div>
               <div className="text-[18px] font-bold text-white tracking-tight">{nodeType?.name}</div>
               <div className="text-[12px] text-[#86868b] font-bold uppercase tracking-widest">{nodeType?.category}</div>
            </div>
         </div>
         <button onClick={deselectNode} className="p-2.5 hover:bg-white/10 rounded-xl text-[#86868b] hover:text-white transition-all border border-transparent hover:border-white/10">
            <X size={20} />
         </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-10 custom-scrollbar">
         <div className="flex flex-col gap-8">
            {nodeType?.configFields.map(renderField)}
         </div>

         {/* Variable Helper */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 text-[#007aff] mb-4">
               <Variable size={18} strokeWidth={2.5} />
               <h4 className="text-[13px] font-bold uppercase tracking-widest">Variable Helper</h4>
            </div>
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 shadow-inner">
               <p className="text-[14px] text-[#86868b] leading-relaxed font-bold">
                  Reference data from previous steps using this syntax:
               </p>
               <code className="block mt-4 p-4 rounded-xl bg-white/5 text-[#34c759] text-[13px] font-mono border border-white/10 select-all shadow-inner">
                  {"{{step.output.field}}"}
               </code>
            </div>
          </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 grid grid-cols-2 gap-4 bg-black/40">
         <GlassButton variant="danger" fullWidth icon={Trash2} onClick={handleDelete} className="!py-4 !text-[14px]">
            Delete
         </GlassButton>
         <GlassButton variant="secondary" fullWidth icon={Save} onClick={deselectNode} className="!py-4 !text-[14px] bg-[#007aff] hover:bg-[#006ce6] text-white border-none">
            Save
         </GlassButton>
      </div>
    </motion.div>
  );
}
