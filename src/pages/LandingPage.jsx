import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Play,
  Clock,
  Globe,
  Workflow,
  Plug,
  Sparkles,
  GitBranch,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen text-[#f5f5f7] selection:bg-[#007aff]/30 overflow-x-hidden pt-32 font-['Inter']">
      {/* Background */}
      <div className="mac-os-wallpaper" />

      {/* NAVBAR */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl rounded-full mac-glass-nav h-16 flex items-center justify-between shadow-xl border border-white/10" style={{ padding: '0 32px' }}>
        {/* LEFT: Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007aff] to-[#34c759] flex items-center justify-center shadow-lg">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="text-[18px] font-bold text-white tracking-tight ml-1">FlowCron</span>
        </Link>

        {/* CENTER: Navigation Links */}
        <div className="hidden md:flex items-center gap-12">
          <button onClick={() => scrollToSection('features')} className="text-[15px] font-medium text-[#c1c1c6] hover:text-white transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-[15px] font-medium text-[#c1c1c6] hover:text-white transition-colors">
            How It Works
          </button>
        </div>

        {/* RIGHT: Auth */}
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => navigate('/login')} className="hidden sm:block text-[15px] font-medium text-[#c1c1c6] hover:text-white transition-colors">
            Sign In
          </button>
          <button type="button" onClick={() => navigate('/signup')} className="h-10 btn-mac-primary text-[14px]" style={{ padding: '0 24px' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ADDED massive gap of 40 (160px) between major sections ensuring zero overlapping */}
      <main className="relative z-10 flex flex-col items-center gap-40 pb-40" style={{ paddingTop: '160px' }}>
        
        {/* HERO SECTION */}
        <section className="w-full max-w-6xl px-6 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10 shadow-sm"
            style={{ padding: '12px 28px', gap: '10px' }}
          >
             <Sparkles size={20} className="text-[#34c759]" />
            <span className="text-[17px] font-semibold text-[#f5f5f7] tracking-wide">Free Forever for Personal Use</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(3.5rem,8vw,6.5rem)] font-extrabold leading-[1.15] tracking-normal text-white mb-8 max-w-4xl"
          >
            Automate everything. <br/>
            <span className="text-[#86868b]">Code nothing.</span>
          </motion.h1>

          <motion.p 
             initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
             className="text-[21px] md:text-[24px] font-medium text-[#86868b] max-w-3xl mb-16 leading-relaxed"
          >
            Build powerful automated workflows with a visual drag-and-drop editor. Connect APIs, schedule tasks, and let your Mac handle the rest.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
             className="flex flex-wrap items-center justify-center gap-6"
             style={{ marginBottom: '120px' }}
          >
            <button onClick={() => navigate('/signup')} className="h-16 flex items-center gap-3 btn-mac-primary text-[17px] px-10 group shadow-xl">
              Start Building Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => toast.success('Video demo started!')} className="h-16 flex items-center gap-3 btn-mac-secondary text-[17px] px-10 border border-white/20">
              <Play size={20} className="fill-current" />
              Watch Video
            </button>
          </motion.div>

          {/* APP WINDOW MOCKUP */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
             className="w-full max-w-5xl mac-window min-h-[500px] h-auto shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/20"
          >
            {/* Title Bar */}
            <div className="mac-window-titlebar shrink-0 border-b border-black/80 h-10 w-full flex items-center px-4">
               <div className="flex gap-2.5">
                 <div className="mac-traffic-light traffic-close" />
                 <div className="mac-traffic-light traffic-min" />
                 <div className="mac-traffic-light traffic-max" />
               </div>
               <div className="flex-1 text-center text-[14px] font-semibold text-[#86868b]">FlowCron Editor — Untitled Workflow</div>
            </div>
            {/* Editor Canvas Area */}
            <div className="flex-1 min-h-[500px] bg-[#161618] relative overflow-hidden flex items-center justify-center p-12">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#2c2c2e 1.5px, transparent 1.5px)', backgroundSize: '32px 32px', opacity: 0.6 }} />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 p-10 w-full justify-center">
                {/* Node 1 */}
                <div className="bg-[#2c2c2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl w-72 shadow-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#ff2d55]/20 flex items-center justify-center">
                      <Clock size={20} className="text-[#ff2d55]" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-white mb-1">Schedule Trigger</div>
                      <div className="text-[12px] text-[#86868b]">Runs every 15 mins</div>
                    </div>
                  </div>
                </div>
                
                {/* Connection Line */}
                <div className="hidden md:block w-20 h-1 bg-[#007aff] relative rounded-full">
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-[#007aff] bg-[#1a1a1c]"></div>
                </div>

                {/* Node 2 */}
                <div className="bg-[#2c2c2e]/95 backdrop-blur-xl border border-[rgba(0,122,255,0.4)] rounded-2xl w-72 shadow-[0_0_0_2px_rgba(0,122,255,0.2),_0_20px_40px_rgba(0,0,0,0.4)] p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#007aff]/20 flex items-center justify-center">
                      <Globe size={20} className="text-[#007aff]" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-white mb-1">HTTP Request</div>
                      <div className="text-[12px] text-[#86868b]">POST /api/webhook</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section id="features" className="w-full max-w-5xl px-6 flex flex-col">
          <div className="text-center" style={{ marginBottom: '120px' }}>
            <h2 className="text-[44px] md:text-[56px] font-extrabold text-white tracking-tight mb-6">
              Designed for Professionals.
            </h2>
            <p className="text-[21px] text-[#86868b] max-w-2xl mx-auto font-medium leading-relaxed">
              Everything you need in a unified, Apple-like experience. Increased gaps and perfect padding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 rounded-3xl" style={{ gap: '40px' }}>
            {/* Box 1 (Large Span) */}
            <div className="md:col-span-2 mac-bento-card flex flex-col min-h-[380px] justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#007aff] to-[#34c759] flex items-center justify-center mb-8 shadow-lg">
                <Workflow size={32} className="text-white" />
              </div>
              <div className="mt-auto">
                <h3 className="text-[28px] font-bold text-white mb-6">Visual Logic Builder</h3>
                <p className="text-[17px] text-[#86868b] leading-relaxed max-w-md">
                  Drag and connect logical nodes freely on a limitless canvas. No syntax errors, just pure logic flow with massive breathing room.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="md:col-span-1 mac-bento-card flex flex-col min-h-[380px] justify-between">
              <div className="w-16 h-16 rounded-2xl bg-[#2c2c2e] border border-white/10 flex items-center justify-center mb-8 shadow-inner">
                <Clock size={28} className="text-[#ffcc00]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-[24px] font-bold text-white mb-6">Smart Schedulers</h3>
                <p className="text-[16px] text-[#86868b] leading-relaxed">
                  Precision background crons down to the minute.
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="md:col-span-1 mac-bento-card flex flex-col min-h-[380px] justify-between">
              <div className="w-16 h-16 rounded-2xl bg-[#2c2c2e] border border-white/10 flex items-center justify-center mb-8 shadow-inner">
                <Zap size={28} className="text-[#ff2d55]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-[24px] font-bold text-white mb-6">Real-time Data</h3>
                <p className="text-[16px] text-[#86868b] leading-relaxed">
                  Watch execution step-by-step live.
                </p>
              </div>
            </div>

            {/* Box 4 (Large Span) */}
            <div className="md:col-span-2 mac-bento-card flex flex-col relative overflow-hidden min-h-[380px] justify-between">
               <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[#5856d6]/30 to-transparent blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              
              <div className="w-16 h-16 rounded-2xl bg-[#5856d6] flex items-center justify-center mb-8 relative z-10 shadow-lg">
                <Plug size={32} className="text-white" />
              </div>
              <div className="mt-auto relative z-10">
                <h3 className="text-[28px] font-bold text-white mb-6">Connect Anything</h3>
                <p className="text-[17px] text-[#86868b] leading-relaxed max-w-md">
                  Integrates effortlessly with REST APIs, Webhooks, Slack, Discord, and Email providers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="w-full max-w-6xl px-6 flex flex-col relative z-20">
           <div className="mac-bento-card flex flex-col md:flex-row items-center gap-20 bg-gradient-to-b from-[rgba(44,44,46,0.9)] to-[rgba(28,28,30,0.9)] shadow-2xl overflow-visible py-24 px-16">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-[40px] md:text-[50px] font-extrabold text-white tracking-tight mb-8 leading-tight">
                  Three Steps to Automation.
                </h2>
                <p className="text-[20px] text-[#86868b] leading-relaxed">
                   You don't need to read manuals. The experience is native, intuitive, and blindingly fast.
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-8 w-full">
                 {[
                   { title: 'Design Your Flow', desc: 'Drag trigger & action nodes on canvas.' },
                   { title: 'Configure Node Options', desc: 'Set URL, tokens, variables visually.' },
                   { title: 'Activate & Relax', desc: 'Hit execute. We handle the infrastructure.' },
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center gap-6 bg-[#1e1e1e]/80 rounded-3xl p-6 border border-white/5 shadow-md">
                      <div className="w-14 h-14 rounded-full bg-[#007aff]/15 flex items-center justify-center shrink-0">
                         <span className="text-[#007aff] font-bold text-[20px]">{idx + 1}</span>
                      </div>
                      <div>
                        <div className="text-[18px] font-bold text-white mb-2">{item.title}</div>
                        <div className="text-[15px] text-[#86868b]">{item.desc}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="w-full px-6 flex items-center justify-center">
            <div className="relative w-full max-w-4xl mac-bento-card overflow-hidden text-center border-t border-[rgba(255,255,255,0.2)] shadow-2xl" style={{ padding: '100px 48px' }}>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[600px] h-[600px] bg-gradient-to-tr from-[#007aff] via-[#5856d6] to-[#ff2d55] opacity-[0.15] blur-[100px] rounded-full" />
               </div>
               
               <div className="relative z-10 flex flex-col items-center">
                 <h2 className="text-[48px] md:text-[64px] font-extrabold text-white tracking-tight mb-10 leading-tight">
                   Ready to automate?
                 </h2>
                 <p className="text-[22px] text-[#c1c1c6] max-w-2xl mx-auto font-medium mb-16 leading-relaxed">
                   Join thousands of modern developers who save hours every week. Built for speed, designed for Mac.
                 </p>
                 <button onClick={() => navigate('/signup')} className="h-16 bg-white text-black text-[18px] font-bold rounded-full hover:bg-gray-100 active:scale-95 transition-all shadow-xl hover:shadow-2xl" style={{ padding: '0 48px' }}>
                   Download Free
                 </button>
                 <p className="text-[14px] text-[#86868b] font-bold uppercase tracking-[0.2em] mt-10">
                   Web App • Instant Setup
                 </p>
               </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="w-full max-w-6xl pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-10" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
              <Zap size={16} className="text-[#1c1c1e] fill-current" />
            </div>
            <span className="text-[16px] font-bold text-white">FlowCron</span>
          </div>
          
          <p className="text-[15px] text-[#86868b] font-medium text-center md:text-left">
            © 2026 FlowCron Software Ltd. All rights reserved. macOS is a trademark of Apple Inc.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="w-12 h-12 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center text-[#86868b] hover:text-white transition-colors border border-white/5">
              <GitBranch size={20} />
            </a>
            <a href="#" className="w-12 h-12 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center text-[#86868b] hover:text-white transition-colors border border-white/5">
              <Share2 size={20} />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default memo(LandingPage);
