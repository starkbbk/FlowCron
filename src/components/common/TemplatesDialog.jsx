import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Mail, MessageSquare, Globe, Database, Clock } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

const templates = [
  {
    id: 1,
    name: 'Daily Email Report',
    description: 'Schedule a daily check of your database and send a summary email.',
    icon: Mail,
    color: '#007aff',
    category: 'Report'
  },
  {
    id: 2,
    name: 'Webhook to Discord',
    description: 'Post a custom message to Discord whenever a webhook is triggered.',
    icon: MessageSquare,
    color: '#5856d6',
    category: 'Messaging'
  },
  {
    id: 3,
    name: 'HTTP Health Check',
    description: 'Continuously monitor an endpoint and alert on failure.',
    icon: Globe,
    color: '#34c759',
    category: 'Monitor'
  },
  {
    id: 5,
    name: 'AI Content Drafter',
    description: 'Use GPT-4 to analyze incoming webhooks and draft email replies automatically.',
    icon: Zap,
    color: '#00d1ff',
    category: 'AI & Data'
  },
  {
    id: 6,
    name: 'SQL to Google Sheets',
    description: 'Run a weekly SQL query and export the results to a shared Google Sheet.',
    icon: Database,
    color: '#ff9500',
    category: 'Storage'
  }
];

export default function TemplatesDialog({ isOpen, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[900px] h-[600px] flex flex-col bg-[#1c1c1e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-[28px] font-bold text-white tracking-tight">Template Gallery</h2>
                <p className="text-[15px] text-[#86868b] mt-1 font-medium">Start fast with a pre-built blueprint</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/5 rounded-2xl text-[#86868b] hover:text-white transition-colors border border-transparent hover:border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className="group mac-bento-card !p-8 flex flex-col gap-6 cursor-pointer hover:border-[#007aff]/30"
                    onClick={() => onSelect(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${template.color}15`, color: template.color }}
                      >
                        <template.icon size={28} strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#86868b] bg-white/5 px-3 py-1.5 rounded-full">
                        {template.category}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-[18px] font-bold text-white mb-2">{template.name}</h3>
                      <p className="text-[14px] text-[#86868b] leading-relaxed font-medium">
                        {template.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center gap-3 text-[#007aff] font-bold text-[13px] opacity-0 group-hover:opacity-100 transition-opacity">
                       <Zap size={14} fill="currentColor" />
                       <span>Use this template</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 flex justify-end bg-black/20">
               <GlassButton variant="secondary" onClick={onClose} className="!px-8 !py-3">
                  Browse custom creations
               </GlassButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
