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
  const { 
    selectedNode, updateNodeConfig, 
    setNodes, nodes, 
    setEdges, edges,
    deselectNode 
  } = useWorkflowStore();
  
  if (!selectedNode) return null;

  const nodeType = getNodeType(selectedNode.data.type);
  const category = NODE_CATEGORIES[nodeType?.category || 'action'] || NODE_CATEGORIES.action;
  
  // Failsafe icon resolution
  const Icon = Icons[nodeType?.icon] || Icons.Zap || Icons.Activity || Zap;

  const handleChange = (key, value) => {
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  const handleDelete = () => {
    // Remove the node
    setNodes(nodes.filter(n => n.id !== selectedNode.id));
    // Remove connected edges
    setEdges(edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    // Close panel
    deselectNode();
    toast.success('Step removed');
  };

  const renderField = (field) => {
    const value = selectedNode.data.config?.[field.name] ?? (field.default || '');

    switch(field.type) {
      case 'webhook_url_display':
        const baseUrl = window.location.origin;
        const webhookUrl = `${baseUrl}/api/webhooks/${selectedNode.id}`;
        return (
          <div key={field.name} className="flex flex-col" style={{ gap: '10px', marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {field.label}
            </label>
            <div className="flex" style={{ gap: '8px' }}>
              <input 
                readOnly
                value={webhookUrl}
                className="flex-1 font-mono text-white truncate outline-none transition-all"
                style={{
                  height: '44px', padding: '0 14px', borderRadius: '10px', fontSize: '13px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <GlassButton 
                variant="secondary" 
                className="!h-[44px] !px-5 !text-[13px] font-bold"
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
            className="mb-5"
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
            className={`mb-5 ${field.type !== 'textarea' ? 'font-mono text-[12px]' : ''}`}
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
            className="mb-5"
          />
        );
      case 'toggle':
        return (
          <div key={field.name} style={{ paddingTop: '6px', marginBottom: '12px' }}>
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
          <div key={field.name} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {field.label}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {kvPairs.map((pair, idx) => (
                <div key={idx} className="flex group" style={{ gap: '6px' }}>
                  <input 
                    className="flex-1 font-semibold text-[#fafafa] outline-none transition-all"
                    style={{
                      height: '44px', padding: '0 14px', fontSize: '13px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    placeholder={isHeader ? "Key" : "Condition"}
                    value={pair.key || ''}
                    onChange={(e) => {
                      const newPairs = [...kvPairs];
                      newPairs[idx] = { ...newPairs[idx], key: e.target.value };
                      handleChange(field.name, newPairs);
                    }}
                  />
                  <input 
                    className="flex-1 font-semibold text-[#fafafa] outline-none transition-all"
                    style={{
                      height: '44px', padding: '0 14px', fontSize: '13px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    placeholder={isHeader ? "Value" : "Target"}
                    value={pair.value || ''}
                    onChange={(e) => {
                      const newPairs = [...kvPairs];
                      newPairs[idx] = { ...newPairs[idx], value: e.target.value };
                      handleChange(field.name, newPairs);
                    }}
                  />
                  <button 
                    className="transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    style={{ padding: '8px', borderRadius: '8px', color: '#52525b' }}
                    onClick={() => {
                      const newPairs = kvPairs.filter((_, i) => i !== idx);
                      handleChange(field.name, newPairs);
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              className="w-full flex items-center justify-center font-bold transition-all"
              style={{
                padding: '10px', borderRadius: '10px', fontSize: '11px',
                border: '1px dashed rgba(255,255,255,0.1)',
                color: '#52525b',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                gap: '6px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(0,122,255,0.4)';
                e.currentTarget.style.color = '#007aff';
                e.currentTarget.style.background = 'rgba(0,122,255,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#52525b';
                e.currentTarget.style.background = 'transparent';
              }}
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
      initial={{ x: isMobile ? 0 : 420, y: isMobile ? 800 : 0 }}
      animate={{ x: 0, y: 0 }}
      exit={{ x: isMobile ? 0 : 420, y: isMobile ? 800 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed lg:relative bottom-0 lg:bottom-auto right-0 lg:right-auto h-[80vh] lg:h-full w-full lg:w-[420px] flex flex-col z-[110] lg:z-40 overflow-hidden`}
      style={{
        background: 'rgba(5,9,20,0.92)',
        backdropFilter: 'blur(60px) saturate(180%)',
        WebkitBackdropFilter: 'blur(60px) saturate(180%)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        borderTop: isMobile ? '1px solid rgba(255,255,255,0.07)' : 'none',
        borderRadius: isMobile ? '24px 24px 0 0' : '0',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.4), inset 1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* ── HEADER ─────────────────────────────── */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Accent color bar at very top */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: '2px',
            background: `linear-gradient(to right, ${category.color}, transparent 60%)`,
          }}
        />

        <div className="flex items-center" style={{ gap: '14px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              color: category.color,
              background: `${category.color}18`,
              border: `1px solid ${category.color}30`,
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-extrabold text-white" style={{ fontSize: '16px', lineHeight: 1.2 }}>{nodeType?.name}</div>
            <div
              className="font-bold uppercase tracking-widest"
              style={{ fontSize: '10px', color: '#52525b', marginTop: '2px' }}
            >
              {nodeType?.category}
            </div>
          </div>
        </div>

        <button
          onClick={deselectNode}
          className="flex items-center justify-center transition-all text-[#86868b] hover:text-white flex-shrink-0"
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── BODY ────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' }}
      >
        <div>
          {nodeType?.configFields.map(renderField)}
        </div>

        {/* Variable Helper */}
        <div style={{ marginTop: '8px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center" style={{ gap: '8px', marginBottom: '12px', color: '#007aff' }}>
            <Variable size={15} strokeWidth={2.5} />
            <h4 className="font-extrabold uppercase tracking-widest" style={{ fontSize: '11px' }}>Variable Helper</h4>
          </div>
          <div
            style={{
              padding: '16px', borderRadius: '12px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="font-medium" style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Reference output from previous steps:
            </p>
            <code
              className="block font-mono select-all"
              style={{
                marginTop: '10px', padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '13px', color: '#34c759',
              }}
            >
              {"{{step.output.field}}"}
            </code>
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────── */}
      <div
        className="flex-shrink-0 grid grid-cols-2"
        style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          gap: '10px',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <GlassButton variant="danger" fullWidth icon={Trash2} onClick={handleDelete} className="!py-3 !text-[13px]">
          Delete
        </GlassButton>
        <button
          onClick={deselectNode}
          className="flex items-center justify-center font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{
            gap: '7px', borderRadius: '12px', fontSize: '13px',
            background: 'linear-gradient(135deg, #007aff, #006ce6)',
            boxShadow: '0 4px 16px rgba(0,122,255,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Save size={15} />
          Done
        </button>
      </div>
    </motion.div>
  );
}
