import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { NODE_CATEGORIES, getNodeType } from '../../utils/nodeTypes';
import StatusBadge from '../common/StatusBadge';
import useWorkflowStore from '../../stores/workflowStore';

const GenericNode = ({ id, data, selected }) => {
  const nodeType = getNodeType(data.type);
  const category = NODE_CATEGORIES[nodeType?.category || 'action'];
  const Icon = Icons[nodeType?.icon || 'Zap'];
  
  const execution = useWorkflowStore(state => state.nodeExecutions[id]);

  return (
    <div className={`relative group ${selected ? 'z-20' : 'z-10'} gpu-accel font-['Inter']`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          w-[320px] mac-bento-card overflow-hidden transition-all duration-200 relative
          ${selected 
            ? 'shadow-[0_0_0_2px_#007aff,_0_20px_40px_rgba(0,0,0,0.5)]' 
            : 'shadow-xl hover:shadow-2xl hover:border-white/20'
          }
        `}
      >
        {/* Category Visual Signature */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5" 
          style={{ background: category.color }} 
        />

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
             <div 
                className="flex items-center justify-center rounded-xl w-12 h-12 bg-white/5 border border-white/10 shadow-inner" 
                style={{ color: category.color }}
             >
                <Icon size={22} strokeWidth={2.5} />
             </div>
             {execution && (
                <StatusBadge 
                  status={execution.status} 
                  size="small" 
                  className="scale-90 origin-right" 
                />
             )}
          </div>
          
          <div className="space-y-1.5">
            <div className="font-bold text-[16px] text-white tracking-tight truncate">
              {nodeType?.name || data.label}
            </div>
             <div className="text-[13px] text-[#86868b] font-medium truncate">
                {data.config?.url || data.config?.topic || nodeType?.description || 'Workflow Step'}
             </div>
          </div>
        </div>
        
        {execution?.status === 'running' && (
          <div className="absolute inset-0 bg-[#007aff]/5 pointer-events-none animate-pulse" />
        )}
      </motion.div>

      {/* Connection Ports */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-4 !h-4 !bg-white/10 !border-2 !border-[#1e1e1e] !rounded-full !left-[-8px] transition-all hover:!scale-110 shadow-md"
      />
      
      {data.type === 'if_condition' ? (
        <>
          <Handle 
            type="source" 
            position={Position.Right} 
            id="true"
            className="!w-4 !h-4 !bg-[#34c759] !border-2 !border-[#1e1e1e] !rounded-full !right-[-8px] !top-[40%] hover:!scale-110 transition-transform shadow-md"
          />
          <div className="absolute top-[34%] -right-14 text-[11px] font-bold text-[#34c759] uppercase tracking-wider">TRUE</div>
          
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="false"
            className="!w-4 !h-4 !bg-[#ff2d55] !border-2 !border-[#1e1e1e] !rounded-full !bottom-[-8px] !left-1/2 hover:!scale-110 transition-transform shadow-md"
          />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[11px] font-bold text-[#ff2d55] uppercase tracking-wider">FALSE</div>
        </>
      ) : (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!w-4 !h-4 !bg-emerald-400 !border-2 !border-[#1e1e1e] !rounded-full !right-[-8px] transition-all hover:!scale-110 shadow-md"
        />
      )}
    </div>
  );
};

export default memo(GenericNode);
