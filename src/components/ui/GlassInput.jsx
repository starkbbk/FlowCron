import { forwardRef, useState } from 'react'

const baseStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '16px',
  color: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  transition: 'all 200ms ease',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

export const GlassInput = forwardRef(
  ({ label, error, className = '', startIcon: StartIcon, endAdornment, ...props }, ref) => {
    const padLeft = StartIcon ? 40 : 12
    const padRight = endAdornment ? 44 : 12
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {label && (
          <label className="text-[13px] font-bold text-[#a1a1aa] uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {StartIcon ? (
            <StartIcon
              aria-hidden
              className="absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-[#71717a] pointer-events-none"
              size={20}
              strokeWidth={2}
            />
          ) : null}
          <input
            ref={ref}
            style={{
              ...baseStyles,
              paddingTop: '24px',
              paddingBottom: '24px',
              paddingLeft: `${padLeft + 32}px`,
              paddingRight: `${padRight + 32}px`,
              borderColor: error ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)',
              fontSize: '16px'
            }}
            className="focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/20 shadow-sm"
            {...props}
          />
          {endAdornment ? (
            <div className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 flex items-center justify-center">
              {endAdornment}
            </div>
          ) : null}
        </div>
        {error && <span className="text-[13px] text-[#ef4444] font-semibold ml-1">{error}</span>}
      </div>
    )
  },
)
GlassInput.displayName = 'GlassInput'

export const GlassTextarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && (
      <label className="text-[12px] font-medium text-[#71717a] uppercase tracking-wider ml-0.5">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      style={{
        ...baseStyles,
        padding: '10px 12px',
        resize: 'vertical',
        minHeight: '100px',
        borderColor: error ? '#ef4444' : '#27272a',
      }}
      className="focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/20"
      {...props}
    />
    {error && <span className="text-[12px] text-[#ef4444] font-medium ml-0.5">{error}</span>}
  </div>
))
GlassTextarea.displayName = 'GlassTextarea'

export const GlassSelect = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && (
      <label className="text-[12px] font-medium text-[#71717a] uppercase tracking-wider ml-0.5">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        style={{
          ...baseStyles,
          backgroundColor: '#080f1f',
          appearance: 'none',
          padding: '10px 40px 10px 12px',
          cursor: 'pointer',
          borderColor: error ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)',
        }}
        className="focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/20"
        {...props}
      >
        {options.map((opt) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value} style={{ background: '#080f1f', color: '#f8fafc' }}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#52525b]">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
    {error && <span className="text-[12px] text-[#ef4444] font-medium ml-0.5">{error}</span>}
  </div>
))
GlassSelect.displayName = 'GlassSelect'

export function GlassToggle({ label, checked: initialChecked, onChange, className = '' }) {
  const [isOn, setIsOn] = useState(initialChecked ?? false);
  
  const handleToggle = () => {
    const newVal = !isOn;
    setIsOn(newVal);
    onChange?.(newVal);
  };

  return (
    <label className={`flex items-center cursor-pointer group ${className}`} style={{ gap: '16px' }}>
      <div
        onClick={handleToggle}
        style={{
          width: '52px',
          height: '28px',
          borderRadius: '14px',
          padding: '3px',
          transition: 'all 0.2s ease',
          backgroundColor: isOn ? '#0a84ff' : 'rgba(255,255,255,0.08)',
          boxShadow: isOn ? '0 0 16px rgba(10, 132, 255, 0.4)' : 'none',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '11px',
            backgroundColor: '#ffffff',
            transition: 'transform 0.2s ease',
            transform: isOn ? 'translateX(24px)' : 'translateX(0)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      {label && <span className="font-semibold text-[#a1a1aa] group-hover:text-white transition-colors" style={{ fontSize: '15px' }}>{label}</span>}
    </label>
  )
}
