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
  ({ label, error, className = '', startIcon: StartIcon, endAdornment, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const padLeft = StartIcon ? 40 : 12
    const padRight = endAdornment ? 44 : 12

    return (
      <div className={`flex flex-col gap-2.5 ${className}`}>
        {label && (
          <label className="text-[12px] font-bold text-[#fafafa] uppercase tracking-widest ml-1 opacity-90">
            {label}
          </label>
        )}
        <div className="relative">
          {StartIcon ? (
            <StartIcon
              aria-hidden
              className={`absolute left-5 top-1/2 z-[1] -translate-y-1/2 transition-colors duration-200 ${
                isFocused ? 'text-[#0a84ff]' : 'text-[#86868b]'
              } pointer-events-none`}
              size={20}
              strokeWidth={2}
            />
          ) : null}
          <input
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            style={{
              ...baseStyles,
              paddingTop: '16px',
              paddingBottom: '16px',
              paddingLeft: `${padLeft + 16}px`,
              paddingRight: `${padRight + 16}px`,
              borderColor: error 
                ? 'rgba(239, 68, 68, 0.4)' 
                : isFocused 
                  ? '#0a84ff' 
                  : 'rgba(255, 255, 255, 0.08)',
              boxShadow: isFocused 
                ? '0 0 16px rgba(10, 132, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.05)' 
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.02)',
              fontSize: '15px'
            }}
            className="transition-all duration-200"
            {...props}
          />
          {endAdornment ? (
            <div className="absolute right-4 top-1/2 z-[2] -translate-y-1/2 flex items-center justify-center">
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

export const GlassTextarea = forwardRef(({ label, error, className = '', onFocus, onBlur, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {label && (
        <label className="text-[12px] font-bold text-[#fafafa] uppercase tracking-widest ml-1 opacity-90">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          onBlur?.(e)
        }}
        style={{
          ...baseStyles,
          padding: '16px 20px',
          resize: 'vertical',
          minHeight: '120px',
          borderColor: error 
            ? 'rgba(239, 68, 68, 0.4)' 
            : isFocused 
              ? '#0a84ff' 
              : 'rgba(255, 255, 255, 0.08)',
          boxShadow: isFocused 
            ? '0 0 16px rgba(10, 132, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.05)' 
            : 'inset 0 1px 1px rgba(255, 255, 255, 0.02)',
          fontSize: '15px'
        }}
        className="transition-all duration-200"
        {...props}
      />
      {error && <span className="text-[12px] text-[#ef4444] font-medium ml-0.5">{error}</span>}
    </div>
  )
})
GlassTextarea.displayName = 'GlassTextarea'

export const GlassSelect = forwardRef(({ label, error, options = [], className = '', onFocus, onBlur, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {label && (
        <label className="text-[12px] font-bold text-[#fafafa] uppercase tracking-widest ml-1 opacity-90">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          style={{
            ...baseStyles,
            backgroundColor: '#050914',
            appearance: 'none',
            padding: '14px 44px 14px 20px',
            cursor: 'pointer',
            borderColor: error 
              ? 'rgba(239, 68, 68, 0.4)' 
              : isFocused 
                ? '#0a84ff' 
                : 'rgba(255, 255, 255, 0.08)',
            boxShadow: isFocused 
              ? '0 0 16px rgba(10, 132, 255, 0.25)' 
              : 'none',
            fontSize: '15px'
          }}
          className="transition-all duration-200"
          {...props}
        >
          {options.map((opt) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value} style={{ background: '#050914', color: '#f8fafc' }}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      {error && <span className="text-[12px] text-[#ef4444] font-medium ml-0.5">{error}</span>}
    </div>
  )
})
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
