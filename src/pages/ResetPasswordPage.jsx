import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { GlassInput } from '../components/ui/GlassInput';
import api from '../services/api';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordValue = watch('new_password');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: data.new_password
      });
      setIsSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div 
        className="relative min-h-screen flex items-center justify-center font-['Inter']"
        style={{ 
          background: 'linear-gradient(135deg, #0f0f12 0%, #1a1a2e 50%, #16213e 100%)',
          padding: '32px'
        }}
      >
        <motion.div
           initial={{ opacity: 0, scale: 0.98, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="relative z-10 w-full flex flex-col items-center justify-center text-center"
           style={{ 
             maxWidth: '480px',
             borderRadius: '32px',
             background: 'rgba(30, 30, 32, 0.6)',
             backdropFilter: 'blur(40px)',
             border: '1px solid rgba(255,255,255,0.08)',
             boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5), 0 0 80px -20px rgba(0,122,255,0.15)',
             padding: '48px',
           }}
        >
          <div className="w-16 h-16 rounded-full bg-[#34c759]/20 text-[#34c759] flex items-center justify-center mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-4">Password Reset!</h2>
          <p className="text-[#86868b] font-medium mb-8" style={{ fontSize: '15px', lineHeight: 1.6 }}>
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Link
            to="/login"
            className="w-full text-white font-bold transition-all active:scale-95 flex items-center justify-center"
            style={{ 
              height: '52px', 
              fontSize: '15px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #007aff, #0066d6)',
              boxShadow: '0 8px 32px rgba(0,122,255,0.35)',
              textDecoration: 'none'
            }}
          >
            Continue to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center font-['Inter']"
      style={{ 
        background: 'linear-gradient(135deg, #0f0f12 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '32px'
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ width: '600px', height: '600px', top: '-10%', left: '-5%', background: 'radial-gradient(circle, #007aff, transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full flex flex-col"
        style={{ 
          maxWidth: '480px',
          borderRadius: '32px',
          background: 'rgba(30, 30, 32, 0.6)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5), 0 0 80px -20px rgba(0,122,255,0.15)',
          padding: '48px',
        }}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-3 no-underline mb-8 group">
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

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-3">
            Set New Password
          </h1>
          <p className="text-[#86868b] font-medium" style={{ fontSize: '15px' }}>
            Please enter your new password below.
          </p>
        </div>

        {!token ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 text-center">
            <span className="text-red-400 font-medium text-sm">Valid reset token is missing from the URL.</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" style={{ gap: '20px' }}>
          <GlassInput
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            startIcon={Lock}
            error={errors.new_password?.message}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#86868b] hover:text-white transition-colors flex items-center justify-center rounded-lg hover:bg-white/5"
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            {...register('new_password', {
              required: 'New Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />

          <GlassInput
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            startIcon={Lock}
            error={errors.confirm_password?.message}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[#86868b] hover:text-white transition-colors flex items-center justify-center rounded-lg hover:bg-white/5"
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            {...register('confirm_password', {
              required: 'Please confirm your password',
              validate: value => value === passwordValue || 'Passwords do not match'
            })}
          />

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full text-white font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            style={{ 
              height: '52px', 
              fontSize: '15px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #007aff, #0066d6)',
              boxShadow: '0 8px 32px rgba(0,122,255,0.35)',
              marginTop: '12px',
              letterSpacing: '-0.01em',
            }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
