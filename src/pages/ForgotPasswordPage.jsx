import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { GlassInput } from '../components/ui/GlassInput';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setIsSent(true);
      toast.success('If this email is registered, a password reset link has been sent.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

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
        <div 
          className="absolute rounded-full blur-[100px] opacity-15"
          style={{ width: '500px', height: '500px', bottom: '-15%', right: '-5%', background: 'radial-gradient(circle, #5856d6, transparent)', animation: 'float 20s infinite alternate ease-in-out' }}
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

        {isSent ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#007aff]/20 text-[#007aff] flex items-center justify-center mb-6">
              <Mail size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-4">Check your email</h2>
            <p className="text-[#86868b] font-medium mb-8" style={{ fontSize: '15px', lineHeight: 1.6 }}>
              We've sent a password reset link to your email address. Please check your inbox and spam folder.
            </p>
            <Link
              to="/login"
              className="text-[#007aff] hover:text-white font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-white tracking-tight mb-3">
                Forgot Password
              </h1>
              <p className="text-[#86868b] font-medium" style={{ fontSize: '15px' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" style={{ gap: '24px' }}>
              <GlassInput
                label="Email Address"
                placeholder="name@example.com"
                startIcon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                style={{ 
                  height: '52px', 
                  fontSize: '15px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #007aff, #0066d6)',
                  boxShadow: '0 8px 32px rgba(0,122,255,0.35)',
                  marginTop: '8px',
                  letterSpacing: '-0.01em',
                }}
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center" style={{ marginTop: '32px' }}>
              <Link
                to="/login"
                className="text-[#86868b] hover:text-white font-semibold transition-colors flex items-center justify-center gap-2"
                style={{ fontSize: '14px' }}
              >
                <ArrowLeft size={16} />
                Back to log in
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
