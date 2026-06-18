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
        width: isOpen ? (window.innerWidth < 1024 ? '100%' : '300px') : '0px',
        opacity: isOpen ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col z-30 relative overflow-hidden"
      style={{
        background: 'rgba(5,9,20,0.88)',
        backdropFilter: 'blur(50px) saturate(180%)',
        WebkitBackdropFilter: 'blur(50px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.3), inset -1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Mobile close */}
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute right-4 top-4 lg:hidden z-50 flex items-center justify-center transition-all text-[#86868b] hover:text-white"
        style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Icons.X size={16} />
      </button>

      {/* ── PANEL HEADER ────────────────────────── */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Title */}
        <div className="flex items-center" style={{ gap: '10px', marginBottom: '14px' }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(0,122,255,0.25), rgba(6,182,212,0.1))',
              border: '1px solid rgba(0,122,255,0.2)',
            }}
          >
            <Zap size={14} style={{ color: '#007aff' }} />
          </div>
          <span className="font-extrabold tracking-tight text-white" style={{ fontSize: '14px' }}>
            Steps
          </span>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#007aff]"
            size={15}
            style={{ color: '#52525b' }}
          />
          <input 
            type="text"
            placeholder="Search steps..."
            className="w-full outline-none transition-all font-medium text-white placeholder:font-medium"
            style={{
              paddingLeft: '42px', paddingRight: '14px', height: '40px', fontSize: '13px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f8fafc',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(0,122,255,0.4)';
              e.target.style.background = 'rgba(0,122,255,0.05)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── CATEGORIES SCROLLER ─────────────────── */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
      >
        {Object.entries(NODE_CATEGORIES).map(([key, cat]) => {
          const nodes = getNodesByCategory(key).filter(n => 
            n.name.toLowerCase().includes(search.toLowerCase())
          );
          if (nodes.length === 0 && search) return null;

          const isCollapsed = collapsed[key];

          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Category Header */}
              <button 
                onClick={() => toggleCategory(key)}
                className="w-full flex items-center justify-between transition-all text-left group rounded-xl"
                style={{ padding: '9px 10px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-center" style={{ gap: '10px' }}>
                   {/* Category accent bar */}
                   <div
                     style={{
                       width: '3px', height: '16px', borderRadius: '2px',
                       background: cat.color,
                       boxShadow: `0 0 8px ${cat.color}60`,
                     }}
                   />
                   <span
                     className="font-extrabold uppercase tracking-widest transition-colors"
                     style={{ fontSize: '11px', color: '#52525b' }}
                   >
                     {cat.label}
                   </span>
                </div>
                {isCollapsed
                  ? <ChevronRight size={13} style={{ color: '#52525b', flexShrink: 0 }} />
                  : <ChevronDown size={13} style={{ color: '#52525b', flexShrink: 0 }} />
                }
              </button>

              {/* Node cards */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                    style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '2px', paddingRight: '2px' }}
                  >
                    {nodes.map(node => {
                      const Icon = Icons[node.icon] || Zap;
                      return (
                        <div
                          key={node.type}
                          draggable
                          onDragStart={(e) => onDragStart(e, node.type)}
                          className="flex items-center rounded-xl cursor-grab active:cursor-grabbing transition-all group"
                          style={{ gap: '12px', padding: '10px 12px' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = `rgba(255,255,255,0.05)`;
                            e.currentTarget.style.border = `1px solid rgba(255,255,255,0.1)`;
                            e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.2)`;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.border = '1px solid transparent';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          style={{ border: '1px solid transparent' }}
                        >
                          {/* Icon container */}
                          <div 
                            className="flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105 duration-200"
                            style={{
                              width: '36px', height: '36px', borderRadius: '9px',
                              color: cat.color,
                              background: `${cat.color}18`,
                              border: `1px solid ${cat.color}30`,
                              boxShadow: `inset 0 0 10px ${cat.color}10`,
                            }}
                          >
                            <Icon size={17} strokeWidth={2.2} />
                          </div>
                          {/* Label */}
                          <span
                            className="font-semibold transition-colors truncate"
                            style={{ fontSize: '13px', color: '#94a3b8' }}
                          >
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

      {/* ── FOOTER DRAG HINT ─────────────────────── */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="flex items-center justify-center font-bold"
          style={{
            padding: '10px 16px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.08)',
            gap: '8px', fontSize: '11px', color: '#52525b',
            letterSpacing: '0.05em',
          }}
        >
          <Icons.GripVertical size={13} style={{ opacity: 0.5 }} />
          Drag steps onto the canvas
        </div>
      </div>
    </motion.div>
  );
}
