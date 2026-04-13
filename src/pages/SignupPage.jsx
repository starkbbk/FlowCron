import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
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
      const res = await api.post('/auth/signup', data);
      setAuth({ username: data.username, email: data.email }, res.data.access_token);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#161618]">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#007aff]/5 to-[#34c759]/5 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10 py-12"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-4 no-underline mb-10 group">
            <div className="bg-gradient-to-br from-[#007aff] to-[#34c759] rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-105">
              <Zap size={28} className="text-white fill-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">FlowCron</span>
          </Link>

          <h1 className="text-3xl font-bold text-white tracking-tight mb-4">Create Account</h1>
          <p className="text-[#86868b] text-[16px] font-medium leading-relaxed">
            Build powerful automated workflows in minutes.
          </p>
        </div>

        <GlassCard variant="strong" padding="large" hover={false} className="shadow-2xl border-white/10 rounded-3xl p-10 bg-[#1e1e1e]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
            <div className="flex flex-col gap-8">
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

              <div className="flex flex-col gap-4">
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
                      className="text-[#86868b] hover:text-white transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/5"
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
                      className="flex flex-col gap-2 px-1"
                    >
                      <div className="flex justify-between items-center text-[11px] uppercase font-bold tracking-widest mt-1">
                        <span className="text-[#86868b]">Password Strength</span>
                        <span style={{ color: strengthColor }} className="transition-colors duration-500">
                          {strengthLabel}
                        </span>
                      </div>
                      <div className="flex gap-2 h-1.5 mt-1">
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
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative w-6 h-6 rounded-md border border-[#3a3a3c] bg-[#1a1a1c] flex items-center justify-center group-hover:border-[#007aff] transition-all mt-0.5 shrink-0">
                  <input type="checkbox" required className="peer absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-3 h-3 rounded-sm bg-[#007aff] opacity-0 peer-checked:opacity-100 transition-opacity shadow-[0_0_8px_#007aff]" />
                </div>
                <p className="text-[14px] font-medium text-[#86868b] leading-relaxed group-hover:text-white transition-colors text-left">
                  {'I agree to the Terms & Conditions'}
                </p>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#007aff] text-white text-[16px] font-bold rounded-2xl shadow-lg hover:bg-[#006ce6] active:scale-95 transition-all mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </GlassCard>

        <p className="text-center mt-12 text-[15px] font-medium text-[#86868b]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#007aff] font-bold hover:text-[#34c759] no-underline transition-all inline-flex items-center gap-2 group ml-1">
            Sign in
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
