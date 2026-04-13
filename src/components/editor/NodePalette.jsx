import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { NODE_CATEGORIES, getNodesByCategory } from '../../utils/nodeTypes';

export default function NodePalette() {
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
    <div className="w-[320px] h-full flex flex-col bg-[#1e1e1e]/80 backdrop-blur-3xl border-r border-white/10 z-30 shadow-2xl font-['Inter']">
      {/* Search Header Area */}
      <div className="p-6 border-b border-white/10">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#007aff] transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search steps..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[14px] focus:border-[#007aff]/50 focus:bg-white/10 outline-none transition-all placeholder:text-[#86868b] font-medium text-white shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Scroller */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {Object.entries(NODE_CATEGORIES).map(([key, cat]) => {
          const nodes = getNodesByCategory(key).filter(n => 
            n.name.toLowerCase().includes(search.toLowerCase())
          );
          if (nodes.length === 0 && search) return null;

          const isCollapsed = collapsed[key];

          return (
            <div key={key} className="space-y-2">
              <button 
                onClick={() => toggleCategory(key)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                   <span className="text-[13px] font-bold uppercase tracking-widest text-[#86868b] group-hover:text-white transition-colors">
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
                    className="overflow-hidden space-y-1 px-1"
                  >
                    {nodes.map(node => {
                      const Icon = Icons[node.icon] || Zap;
                      return (
                        <div
                          key={node.type}
                          draggable
                          onDragStart={(e) => onDragStart(e, node.type)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all group shadow-sm"
                        >
                          <div 
                            className="p-2 rounded-lg bg-[#1a1a1c] border border-white/5 group-hover:border-white/20 transition-colors shadow-inner" 
                            style={{ color: cat.color }}
                          >
                            <Icon size={18} strokeWidth={2.5} />
                          </div>
                          <span className="text-[14px] font-bold text-[#86868b] group-hover:text-white transition-colors truncate">
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
    </div>
  );
}
