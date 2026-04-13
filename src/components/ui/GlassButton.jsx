import { motion } from 'framer-motion';

const variantStyles = {
  primary: {
    backgroundColor: '#3b82f6',
    border: 'none',
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    color: '#fafafa',
  },
  danger: {
    backgroundColor: '#dc2626',
    border: 'none',
    color: '#ffffff',
  },
  success: {
    backgroundColor: '#16a34a',
    border: 'none',
    color: '#ffffff',
  },
  ghost: {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    color: '#a1a1aa',
  },
};

const hoverStyles = {
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#27272a',
  },
  danger: {
    backgroundColor: '#b91c1c',
  },
  success: {
    backgroundColor: '#15803d',
  },
  ghost: {
    backgroundColor: '#18181b',
    color: '#fafafa',
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
        borderRadius: '8px',
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
