import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight, Mail, Lock, User, Shield, Workflow, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { GlassInput } from '../components/ui/GlassInput';
import useAuthStore from '../stores/authStore';
import api from '../services/api';

function getStrengthTier(pwd) {
  if (!pwd) return 0;
  if (pwd.length < 8) return 1;
  const hasNum = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  if (hasNum && hasSpecial) return 3;
  return 2;
}

export default function SignupPage() {
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

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  const strength = getStrengthTier(password);
  const strengthColor =
    strength === 1 ? '#FF3B30' : strength === 2 ? '#FFCC00' : strength === 3 ? '#34C759' : 'rgba(255,255,255,0.05)';
  const strengthLabel = strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : strength === 3 ? 'Strong' : '';

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Remove confirm_password and other non-schema fields before sending
      const { confirm_password, ...signupData } = data;
      const res = await api.post('/auth/signup', signupData);
      setAuth(res.data.user, res.data.access_token);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      // Improved error reporting: handle FastAPI validation errors (array) or custom detail (string)
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail) 
        ? detail[0]?.msg 
        : (typeof detail === 'string' ? detail : 'Signup failed');
        
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen overflow-hidden font-['Inter']"
    >
      {/* Main Split Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="flex w-full overflow-hidden max-w-[1240px]"
          style={{ 
            minHeight: '860px',
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
            className="flex flex-col justify-center w-full lg:w-1/2"
            style={{ padding: '56px' }}
          >
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 no-underline mb-10 group">
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
            <div style={{ marginBottom: '40px' }}>
              <h1 
                className="font-extrabold text-white tracking-tight"
                style={{ fontSize: '34px', lineHeight: 1.15, marginBottom: '12px' }}
              >
                Create Account
              </h1>
              <p className="text-[#86868b] font-medium" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                Build powerful automated workflows in minutes
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" style={{ gap: '24px' }}>
              <GlassInput
                label="Username"
                placeholder="Choose a username"
                startIcon={User}
                error={errors.username?.message}
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Minimum 3 characters required' },
                })}
              />

              <GlassInput
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                startIcon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' },
                })}
              />

              <div className="flex flex-col" style={{ gap: '12px' }}>
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  }
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters required' },
                  })}
                />

                <AnimatePresence>
                  {password ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col px-1"
                      style={{ gap: '8px' }}
                    >
                      <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
                        <span className="text-[#86868b] text-[11px] font-bold uppercase tracking-widest">Password Strength</span>
                        <span style={{ color: strengthColor, fontSize: '11px' }} className="font-bold uppercase tracking-widest transition-colors duration-500">
                          {strengthLabel}
                        </span>
                      </div>
                      <div className="flex h-1.5" style={{ gap: '8px', marginTop: '4px' }}>
                        {[1, 2, 3].map((s) => (
                          <div key={s} className="flex-1 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              initial={false}
                              animate={{ width: strength >= s ? '100%' : '0%' }}
                              transition={{ duration: 0.45, ease: 'easeOut' }}
                              className="h-full"
                              style={{ backgroundColor: strengthColor }}
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <GlassInput
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                startIcon={Lock}
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  validate: (val) => val === password || 'Passwords do not match',
                })}
              />

              <div 
                className="rounded-2xl"
                style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <label className="flex items-start cursor-pointer group" style={{ gap: '16px' }}>
                  <div className="relative w-6 h-6 rounded-md border border-[#3a3a3c] bg-[#1a1a1c] flex items-center justify-center group-hover:border-[#007aff] transition-all mt-0.5 shrink-0">
                    <input type="checkbox" required className="peer absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-3 h-3 rounded-sm bg-[#007aff] opacity-0 peer-checked:opacity-100 transition-opacity shadow-[0_0_8px_#007aff]" />
                  </div>
                  <p className="text-[14px] font-medium text-[#86868b] leading-relaxed group-hover:text-white transition-colors text-left">
                    I agree to the Terms & Conditions
                  </p>
                </label>
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Bottom Text */}
            <div className="text-center" style={{ marginTop: '32px' }}>
              <p className="text-[15px] font-medium text-[#86868b]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#007aff] font-bold hover:text-white no-underline transition-all inline-flex items-center gap-2 group" style={{ marginLeft: '4px' }}>
                  Sign in
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
