import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, GitBranch, ArrowRight, Mail, Lock, Shield, Workflow, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { GlassInput } from '../components/ui/GlassInput';
import useAuthStore from '../stores/authStore';
import api from '../services/api';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.access_token);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen overflow-hidden font-['Inter'] bg-[#09090b]"
    >
      {/* Main Split Container */}
      <div 
        className="relative z-10 flex min-h-screen items-center justify-center p-6 lg:p-12"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="flex w-full overflow-hidden max-w-[1240px]"
          style={{ 
            minHeight: '800px',
            borderRadius: '40px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(80px)',
            WebkitBackdropFilter: 'blur(80px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 40px 120px -20px rgba(0,0,0,0.8), 0 0 80px rgba(0,122,255,0.1)',
          }}
        >
          {/* LEFT — Form Side */}
          <div 
            className="flex flex-col justify-center w-full lg:w-1/2"
            style={{ padding: '64px' }}
          >
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 no-underline mb-12 group">
              <div 
                className="flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105"
                style={{ 
                  width: '48px', height: '48px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #007aff, #34c759)',
                }}
              >
                <Zap size={24} className="text-white fill-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">FlowCron</span>
            </Link>

            {/* Heading */}
            <div style={{ marginBottom: '48px' }}>
              <h1 
                className="font-extrabold text-white tracking-tight"
                style={{ fontSize: '36px', lineHeight: 1.15, marginBottom: '12px' }}
              >
                Welcome back
              </h1>
              <p className="text-[#86868b] font-medium" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                Sign in to your FlowCron account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" style={{ gap: '28px' }}>
              <GlassInput
                label="Username or Email"
                placeholder="name@example.com or username"
                startIcon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Username or Email is required',
                })}
              />

              <div className="flex flex-col" style={{ gap: '16px' }}>
                <GlassInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  startIcon={Lock}
                  error={errors.password?.message}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#86868b] hover:text-white transition-colors flex items-center justify-center rounded-lg hover:bg-white/5"
                      style={{ minWidth: '40px', minHeight: '40px' }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  }
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />

                <div className="flex items-center justify-between" style={{ paddingTop: '4px' }}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative w-5 h-5 rounded border border-[#3a3a3c] bg-[#1a1a1c] flex items-center justify-center transition-all group-hover:border-[#007aff]">
                      <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#007aff] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[14px] font-medium text-[#86868b] group-hover:text-white transition-colors">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[14px] text-[#007aff] hover:text-white font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{ 
                  height: '56px', 
                  fontSize: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #007aff, #0066d6)',
                  boxShadow: '0 8px 32px rgba(0,122,255,0.35)',
                  marginTop: '8px',
                  letterSpacing: '-0.01em',
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center" style={{ gap: '16px', marginTop: '32px', marginBottom: '32px' }}>
              <div className="flex-1" style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[12px] font-bold text-[#86868b] uppercase tracking-widest">or</span>
              <div className="flex-1" style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Social Login */}
            <button
              type="button"
              className="w-full flex items-center justify-center text-white font-semibold transition-all hover:bg-[#3a3a3c] cursor-pointer"
              style={{ 
                height: '56px', gap: '12px', fontSize: '15px',
                background: '#2c2c2e', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
              }}
            >
              <GitBranch size={20} />
              Continue with GitHub
            </button>

            {/* Bottom Text */}
            <div className="text-center" style={{ marginTop: '40px' }}>
              <p className="text-[15px] font-medium text-[#86868b]">
                {"Don't have an account? "}
                <Link to="/signup" className="text-white hover:text-[#007aff] font-bold inline-flex items-center gap-1.5 group transition-colors" style={{ marginLeft: '4px' }}>
                  Sign up
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          </div>

          {/* RIGHT — Hero Visual Side */}
          <div 
            className="hidden lg:flex flex-col justify-between relative overflow-hidden w-1/2"
            style={{ 
              borderRadius: '0 40px 40px 0',
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
            
            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, rgba(0,122,255,0.15) 0%, rgba(88,86,214,0.15) 50%, rgba(52,199,89,0.1) 100%)' }}
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
                className="self-end"
                style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '20px 28px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  maxWidth: '280px',
                }}
              >
                <div className="flex items-center" style={{ gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34c759', boxShadow: '0 0 8px #34c759' }} />
                  <span className="text-white font-bold" style={{ fontSize: '14px' }}>System Status</span>
                </div>
                <span className="text-[#86868b] font-medium" style={{ fontSize: '13px' }}>All systems operational — 99.9% uptime</span>
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
                      <feat.icon size={16} className="text-[#007aff]" />
                      {feat.label}
                    </motion.div>
                  ))}
                </div>

                <h2 
                  className="text-white font-extrabold tracking-tight"
                  style={{ fontSize: '34px', lineHeight: 1.2, marginBottom: '16px' }}
                >
                  Automate anything.<br />
                  <span className="text-[#007aff]">Ship faster.</span>
                </h2>
                <p className="text-white/60 font-medium" style={{ fontSize: '16px', lineHeight: 1.7, maxWidth: '400px' }}>
                  Build, schedule, and monitor powerful automation workflows with our visual drag-and-drop editor.
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
        </motion.div>
      </div>
    </div>
  );
}
