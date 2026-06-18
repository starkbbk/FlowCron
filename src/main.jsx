import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Beautiful Glassmorphic Config Warning if publishable key is missing
const MissingConfigFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#000000] z-[9999] font-sans selection:bg-[#007aff]/30 selection:text-white">
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-[#007aff]/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#af52de]/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
    <div 
      className="relative z-10 w-[90%] max-w-[560px] p-10 md:p-12 text-center"
      style={{
        borderRadius: '32px',
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}
    >
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
        style={{
          background: 'linear-gradient(135deg, #007aff, #af52de)',
        }}
      >
        <span className="text-white font-extrabold text-2xl">FC</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4">Clerk Integration Required</h1>
      <p className="text-[#86868b] font-medium leading-relaxed mb-8 text-[15px]">
        To enable modern authentication, please set your Clerk Publishable Key in a <code className="bg-white/10 px-2 py-1 rounded text-white font-mono text-[13px]">.env</code> file at the root of your project:
      </p>
      <div className="bg-[#1c1c1e] border border-white/10 rounded-xl p-4 mb-8 text-left font-mono text-[13px] text-white overflow-x-auto shadow-inner">
        VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
      </div>
      <p className="text-[#86868b] text-[13px] font-medium leading-relaxed">
        Get your keys from the <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-[#007aff] hover:underline font-semibold">Clerk Dashboard</a>. Once configured, restart your Vite dev server to sync.
      </p>
    </div>
  </div>
)

if (!PUBLISHABLE_KEY) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MissingConfigFallback />
    </React.StrictMode>
  )
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </React.StrictMode>
  )
}
