import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, GitBranch, ArrowRight, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
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
      setAuth({ email: data.email }, res.data.access_token);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#161618] selection:bg-[#007aff]/30 overflow-hidden font-['Inter']">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#007aff]/10 to-[#5856d6]/10 pointer-events-none" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-[460px]">
          <GlassCard variant="strong" padding="none" hover={false} className="overflow-hidden rounded-3xl border border-white/10 bg-[#1e1e1e] shadow-2xl">
            <div className="p-10">
              {/* Logo Group */}
              <div className="flex flex-col items-center mb-12">
                <Link to="/" className="mb-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007aff] to-[#34c759] flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
                    <Zap size={28} className="text-white fill-white" />
                  </div>
                </Link>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Welcome back</h1>
                <p className="text-[#86868b] text-[16px] font-medium">
                  Sign in to your FlowCron account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
                <div className="flex flex-col gap-8">
                  <GlassInput
                    label="Email Address"
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
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      }
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                    />
                    
                    <div className="flex items-center justify-between pt-2">
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
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-white text-black text-[16px] font-bold rounded-2xl hover:bg-gray-200 active:scale-95 transition-all mt-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-10">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[12px] font-bold text-[#86868b] uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                type="button"
                className="w-full h-14 flex items-center justify-center gap-3 bg-[#2c2c2e] border border-white/10 text-white text-[15px] font-semibold rounded-2xl hover:bg-[#3a3a3c] transition-all"
              >
                <GitBranch size={20} />
                Continue with GitHub
              </button>
            </div>
          </GlassCard>

          {/* Bottom Text */}
          <div className="text-center mt-10">
            <p className="text-[15px] font-medium text-[#86868b]">
              {"Don't have an account? "}
              <Link to="/signup" className="text-white hover:text-[#007aff] font-bold inline-flex items-center gap-1.5 group transition-colors ml-1">
                Sign up
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
