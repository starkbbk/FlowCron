import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Shield, Workflow, Clock } from 'lucide-react';
import { SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import useAuthStore from '../stores/authStore';

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#34c759',
    colorBackground: 'rgba(255, 255, 255, 0.03)',
    colorText: '#ffffff',
    colorTextSecondary: '#86868b',
    colorInputBackground: 'rgba(255, 255, 255, 0.05)',
    colorInputText: '#ffffff',
    colorBorder: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    fontFamily: 'Inter, sans-serif'
  },
  elements: {
    cardBox: 'w-full shadow-none bg-transparent border-0',
    card: 'bg-transparent border-0 shadow-none p-0 w-full',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsBlockButton: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold h-14 rounded-2xl transition-all cursor-pointer',
    socialButtonsBlockButtonText: 'text-white font-semibold',
    formButtonPrimary: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold h-14 rounded-2xl shadow-[0_8px_32px_rgba(52,199,89,0.35)] transition-all active:scale-95 border-0 cursor-pointer',
    formFieldInput: 'bg-white/5 border border-white/10 text-white focus:border-[#34c759] rounded-xl h-12 px-4 transition-all',
    formFieldLabel: 'text-[#86868b] font-bold text-xs uppercase tracking-wider mb-2',
    footerActionText: 'text-[#86868b] font-semibold text-sm',
    footerActionLink: 'text-[#34c759] font-bold hover:text-white transition-colors no-underline',
    dividerLine: 'bg-white/10',
    dividerText: 'text-[#86868b] font-bold text-xs uppercase tracking-widest',
    formFieldInputShowPasswordButton: 'text-[#86868b] hover:text-white',
    identityPreviewText: 'text-white',
    identityPreviewEditButtonIcon: 'text-green-500',
    userButtonPopoverCard: 'bg-zinc-900 border border-zinc-800 text-white'
  }
};

export default function SignupPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  return (
    <div 
      className="relative min-h-screen overflow-hidden font-['Inter']"
    >
      {/* Main Split Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 lg:p-10 overflow-hidden">
        {/* Back to Home Button - Premium Glass Design */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-6 top-6 lg:left-12 lg:top-12 z-50"
        >
          <Link 
            to="/" 
            className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all no-underline group shadow-2xl"
          >
            <ArrowRight className="rotate-180 text-white group-hover:-translate-x-1 transition-transform" size={20} />
            <span className="text-[14px] font-bold text-white tracking-tight">Back to Home</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="flex w-full overflow-hidden max-w-[1240px] max-h-[85vh]"
          style={{ 
            borderRadius: '40px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(80px)',
            WebkitBackdropFilter: 'blur(80px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 40px 120px -20px rgba(0,0,0,0.8), 0 0 80px rgba(52,199,89,0.1)',
          }}
        >
          {/* LEFT — Hero Visual Side */}
          <div 
            className="hidden lg:flex flex-col justify-between relative overflow-hidden w-1/2"
            style={{ 
              borderRadius: '40px 0 0 40px',
              background: 'linear-gradient(135deg, #0a1628, #0d2137)',
            }}
          >
            {/* Hero Image */}
            <img 
              src="/login-hero.png" 
              alt="FlowCron Team" 
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.4, mixBlendMode: 'luminosity' }}
            />
            
            {/* Gradient Overlays */}
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, rgba(52,199,89,0.12) 0%, rgba(0,122,255,0.15) 50%, rgba(88,86,214,0.1) 100%)' }}
            />
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.3) 50%, rgba(10,22,40,0.6) 100%)' }}
            />

            {/* Content Over Image */}
            <div className="relative z-10 flex flex-col justify-between h-full" style={{ padding: '56px' }}>
              {/* Top floating card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '20px 28px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  maxWidth: '300px',
                }}
              >
                <div className="flex items-center" style={{ gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#007aff', boxShadow: '0 0 8px #007aff' }} />
                  <span className="text-white font-bold" style={{ fontSize: '14px' }}>30-Day Free Trial</span>
                </div>
                <span className="text-[#86868b] font-medium" style={{ fontSize: '13px' }}>No credit card required. Full access to all features.</span>
              </motion.div>

              {/* Bottom content */}
              <div>
                {/* Feature pills */}
                <div className="flex flex-wrap" style={{ gap: '12px', marginBottom: '40px' }}>
                  {[
                    { icon: Shield, label: 'Enterprise Security' },
                    { icon: Workflow, label: 'Visual Builder' },
                    { icon: Clock, label: 'Cron Scheduling' },
                  ].map((feat) => (
                    <motion.div
                      key={feat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="flex items-center text-white/80 font-medium"
                      style={{ 
                        gap: '8px', fontSize: '13px',
                        background: 'rgba(255,255,255,0.06)', 
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <feat.icon size={16} className="text-[#34c759]" />
                      {feat.label}
                    </motion.div>
                  ))}
                </div>

                <h2 
                  className="text-white font-extrabold tracking-tight"
                  style={{ fontSize: '34px', lineHeight: 1.2, marginBottom: '16px' }}
                >
                  Start building<br />
                  <span className="text-[#34c759]">in minutes.</span>
                </h2>
                <p className="text-white/60 font-medium" style={{ fontSize: '16px', lineHeight: 1.7, maxWidth: '400px' }}>
                  Join thousands of teams who automate their workflows with FlowCron's powerful visual editor.
                </p>

                {/* Trust badges */}
                <div className="flex items-center" style={{ gap: '24px', marginTop: '40px' }}>
                  <div className="flex flex-col">
                    <span className="text-white font-extrabold" style={{ fontSize: '28px' }}>10K+</span>
                    <span className="text-white/40 font-medium" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>WORKFLOWS</span>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
                  <div className="flex flex-col">
                    <span className="text-white font-extrabold" style={{ fontSize: '28px' }}>99.9%</span>
                    <span className="text-white/40 font-medium" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>UPTIME</span>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
                  <div className="flex flex-col">
                    <span className="text-white font-extrabold" style={{ fontSize: '28px' }}>500+</span>
                    <span className="text-white/40 font-medium" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>TEAMS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Form Side */}
          <div 
            className="flex flex-col justify-center w-full lg:w-1/2 overflow-y-auto no-scrollbar"
            style={{ padding: '40px 56px' }}
          >
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 no-underline mb-6 group">
              <div 
                className="flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105"
                style={{ 
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #007aff, #34c759)',
                }}
              >
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">FlowCron</span>
            </Link>

            {/* Heading */}
            <div style={{ marginBottom: '16px' }}>
              <h1 
                className="font-extrabold text-white tracking-tight"
                style={{ fontSize: '30px', lineHeight: 1.15, marginBottom: '8px' }}
              >
                Create Account
              </h1>
              <p className="text-[#86868b] font-medium" style={{ fontSize: '15px', lineHeight: 1.6 }}>
                Build powerful automated workflows in minutes
              </p>
            </div>

            {/* Clerk Sign Up Component */}
            <div className="mt-2">
              <SignUp 
                appearance={clerkAppearance} 
                signInUrl="/login" 
                forceRedirectUrl="/dashboard" 
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
