import { motion } from 'framer-motion';

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #0a84ff, #22d3ee)',
    border: 'none',
    color: '#ffffff',
    boxShadow: '0 4px 20px rgba(10, 132, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#f8fafc',
    backdropFilter: 'blur(10px)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f8fafc',
    backdropFilter: 'blur(10px)',
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    color: '#f8fafc',
    backdropFilter: 'blur(10px)',
  },
  ghost: {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    color: '#94a3b8',
  },
};

const hoverStyles = {
  primary: {
    boxShadow: '0 0 30px rgba(34, 211, 238, 0.6), 0 4px 20px rgba(10, 132, 255, 0.4)',
    scale: 1.02,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  ghost: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#f8fafc',
  },
};

export default function GlassButton({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  isLoading = false,
  icon: Icon,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 active:scale-95
        transition-all duration-150 ease-in-out
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      style={{
        ...variantStyles[variant],
        padding: '8px 16px',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
      }}
      whileHover={!disabled ? hoverStyles[variant] : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      {...props}
    >
      {isLoading ? (
        <motion.div
          className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : Icon ? (
        <Icon size={18} className="shrink-0" />
      ) : null}
      <span className="whitespace-nowrap">{children}</span>
    </motion.button>
  );
}
