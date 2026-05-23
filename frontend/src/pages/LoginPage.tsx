import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, AlertCircle, Loader2, Smartphone, Mail, ChevronRight } from 'lucide-react';
import { loginWithGoogle, setupRecaptcha, sendOTP, verifyOTP } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

type Step = 'choose' | 'phone' | 'otp';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [step, setStep] = useState<Step>('choose');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<any>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { token, user } = await loginWithGoogle();
      login(token, user);
      toastSuccess(`Welcome, ${user.name}!`);
      navigate('/');
    } catch (e: any) {
      toastError(e.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toastError('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      recaptchaRef.current = recaptchaVerifier;
      const confirmation = await sendOTP(phone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      toastSuccess('OTP sent successfully!');
    } catch (e: any) {
      toastError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toastError('Enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await verifyOTP(confirmationResult, otp);
      login(token, user);
      toastSuccess(`Welcome, ${user.name}!`);
      navigate('/');
    } catch (e: any) {
      toastError(e.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-900/50 via-dark-card to-dark-bg items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-purple/15 rounded-full blur-3xl" />
        <div className="relative z-10 p-12 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center mb-8 shadow-glow-md">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
            Premium designs at your fingertips
          </h2>
          <p className="text-slate-400 leading-relaxed mb-8">
            Sign in to purchase and instantly download high-quality PSD files, 
            UI kits, mockups, and more.
          </p>
          <div className="space-y-3">
            {['One-time payment', 'Instant secure download', 'Lifetime access', 'No subscription needed'].map(f => (
              <div key={f} className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-brand-400" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                {step === 'otp' ? 'Enter OTP' : 'Welcome back'}
              </h1>
              <p className="text-slate-400 text-sm">
                {step === 'otp'
                  ? `We sent a code to ${phone}`
                  : 'Sign in to access your purchases and downloads'}
              </p>
            </div>

            {step === 'choose' && (
              <div className="space-y-4">
                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
                             bg-white hover:bg-slate-100 text-slate-900 font-semibold text-base
                             transition-all duration-200 active:scale-95 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-dark-border" />
                  <span className="text-xs text-slate-500">or</span>
                  <div className="flex-1 h-px bg-dark-border" />
                </div>

                {/* Phone OTP */}
                <button
                  onClick={() => setStep('phone')}
                  className="w-full flex items-center justify-center gap-3 btn-secondary py-4 text-base"
                >
                  <Smartphone className="w-5 h-5" />
                  Continue with Phone OTP
                </button>
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="input text-base"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-2">Include country code (e.g., +91 for India)</p>
                </div>
                <div id="recaptcha-container" />
                <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-4 text-base">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
                <button type="button" onClick={() => setStep('choose')} className="w-full btn-ghost justify-center py-3">
                  ← Back
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    6-digit OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="input text-center text-2xl tracking-widest"
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-4 text-base">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="w-full btn-ghost justify-center py-3"
                >
                  Resend OTP
                </button>
              </form>
            )}

            <p className="text-center text-xs text-slate-500 mt-8">
              By signing in, you agree to our{' '}
              <a href="#" className="text-brand-400 hover:text-brand-300">Terms</a> and{' '}
              <a href="#" className="text-brand-400 hover:text-brand-300">Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
