import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { NODE_CATEGORIES, getNodesByCategory } from '../../utils/nodeTypes';

export default function NodePalette({ isOpen, setIsOpen }) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState({});

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (cat) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isOpen ? (window.innerWidth < 1024 ? '100%' : '320px') : '0px',
        opacity: isOpen ? 1 : 0
      }}
      className="h-full flex flex-col bg-[#1e1e1e]/80 backdrop-blur-3xl border-r border-white/10 z-30 shadow-2xl font-['Inter'] relative overflow-hidden"
    >
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-xl text-[#86868b] lg:hidden z-50"
      >
        <Icons.X size={20} />
      </button>

      {/* Search Header Area */}
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#007aff] transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search steps..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl focus:border-[#007aff]/50 focus:bg-white/10 outline-none transition-all placeholder:text-[#86868b] font-medium text-white shadow-inner"
            style={{ paddingLeft: '52px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px', fontSize: '15px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Scroller */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {Object.entries(NODE_CATEGORIES).map(([key, cat]) => {
          const nodes = getNodesByCategory(key).filter(n => 
            n.name.toLowerCase().includes(search.toLowerCase())
          );
          if (nodes.length === 0 && search) return null;

          const isCollapsed = collapsed[key];

          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => toggleCategory(key)}
                className="w-full flex items-center justify-between rounded-2xl hover:bg-white/5 transition-all text-left group"
                style={{ padding: '14px 20px' }}
              >
                <div className="flex items-center" style={{ gap: '12px' }}>
                   <div className="rounded-full" style={{ width: '6px', height: '20px', backgroundColor: cat.color }} />
                   <span className="font-extrabold uppercase tracking-widest text-[#86868b] group-hover:text-white transition-colors" style={{ fontSize: '13px' }}>
                     {cat.label}
                   </span>
                </div>
                {isCollapsed ? <ChevronRight size={16} className="text-[#86868b]" /> : <ChevronDown size={16} className="text-[#86868b]" />}
              </button>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px', paddingRight: '4px' }}
                  >
                    {nodes.map(node => {
                      const Icon = Icons[node.icon] || Zap;
                      return (
                        <div
                          key={node.type}
                          draggable
                          onDragStart={(e) => onDragStart(e, node.type)}
                          className="flex items-center rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all group shadow-sm"
                          style={{ gap: '16px', padding: '16px 20px' }}
                        >
                          <div 
                            className="rounded-xl bg-[#1a1a1c] border border-white/5 group-hover:border-white/20 transition-colors shadow-inner flex items-center justify-center" 
                            style={{ color: cat.color, width: '44px', height: '44px' }}
                          >
                            <Icon size={22} strokeWidth={2.5} />
                          </div>
                          <span className="font-bold text-[#86868b] group-hover:text-white transition-colors truncate" style={{ fontSize: '15px' }}>
                            {node.name}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-[13px] text-[#86868b] text-center font-bold tracking-wide shadow-inner">
            Drag items to canvas
          </div>
      </div>
    </motion.div>
  );
}
