import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Canvas Crash Detected:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] text-white p-10 text-center font-['Inter']">
          <div className="mac-os-wallpaper opacity-40" />
          <div className="relative z-10 space-y-6 max-w-md">
            <div className="w-20 h-20 bg-[#ff2d55]/10 rounded-3xl flex items-center justify-center border border-[#ff2d55]/20 mx-auto shadow-[0_0_30px_rgba(255,45,85,0.2)]">
               <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Editor Canvas Crashed</h2>
            <p className="text-[#86868b] font-medium leading-relaxed">
               A runtime error occurred while rendering the workflow nodes. This is often caused by missing data or incompatible plugins.
            </p>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[12px] font-mono text-[#ff2d55] text-left overflow-auto max-h-32 shadow-inner">
               {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#d1d1d6] transition-all shadow-2xl active:scale-95"
            >
              Reload Editor
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
