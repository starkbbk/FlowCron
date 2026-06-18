import { motion } from 'framer-motion';

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
    border: 'none',
    color: '#ffffff',
    boxShadow: '0 0 20px rgba(37, 99, 235, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#f8fafc',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f8fafc',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    color: '#f8fafc',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  ghost: {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    color: '#94a3b8',
  },
};

const hoverStyles = {
  primary: {
    boxShadow: '0 0 32px rgba(6, 182, 212, 0.5), 0 0 16px rgba(37, 99, 235, 0.4)',
    scale: 1.025,
    y: -1,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    scale: 1.015,
    y: -1,
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    scale: 1.015,
    y: -1,
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
    scale: 1.015,
    y: -1,
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
  const combinedStyle = {
    ...variantStyles[variant],
    padding: '8px 16px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    ...props.style
  };

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
      whileHover={!disabled ? hoverStyles[variant] : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      {...props}
      style={combinedStyle}
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
