import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, ArrowRight, HeartPulse, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex relative overflow-hidden">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal relative flex-col justify-between p-16 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=2070&auto=format&fit=crop"
            alt="texture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal mix-blend-color" />
        </div>

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full border border-white/5" />
          <div className="absolute inset-8 rounded-full border border-clay/20 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-20 rounded-full border border-white/10 border-dashed animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="font-serif italic text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-clay" />
            MedBuddy
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote className="text-white/60 text-lg leading-relaxed max-w-md mb-8">
            "Clinical intelligence simplified safely. The AI that sits between a patient and confusion."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['bg-clay', 'bg-moss', 'bg-white/30'].map((color, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-charcoal flex items-center justify-center`}>
                  <User className="w-3 h-3 text-white" />
                </div>
              ))}
            </div>
            <span className="text-white/40 text-sm font-mono">50K+ active users</span>
          </div>
        </div>

        {/* Status */}
        <div className="relative z-10 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full w-fit">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white/40 text-xs font-mono uppercase">System Operational</span>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <Activity className="w-6 h-6 text-clay" />
            <span className="font-serif italic text-xl font-bold text-moss">MedBuddy</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <span className="text-clay font-mono text-xs uppercase tracking-widest block mb-3">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </span>
            <h1 className="text-4xl font-serif italic text-moss mb-3">
              {isSignUp ? 'Join MedBuddy.' : 'Sign in.'}
            </h1>
            <p className="text-charcoal/50 text-sm">
              {isSignUp
                ? 'Start simplifying your healthcare journey today.'
                : 'Access your AI-powered medical document analyzer.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-charcoal/10 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/10 transition-all text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-charcoal/10 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/10 transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-charcoal/10 bg-white text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/10 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-clay hover:text-clay/80 transition-colors font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-moss text-cream py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-moss/90 transition-all magnetic disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-charcoal/10" />
            <span className="text-xs text-charcoal/30 font-mono uppercase">or</span>
            <div className="flex-1 h-px bg-charcoal/10" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  await signIn('demo@medbuddy.com', 'demo123');
                  navigate('/');
                } catch (err) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-charcoal/10 text-sm text-charcoal/60 hover:border-moss/30 hover:bg-moss/5 transition-all disabled:opacity-60"
            >
              <HeartPulse className="w-4 h-4 text-clay" />
              Demo Login
            </button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  await signIn('patient@example.com', 'patient123');
                  navigate('/');
                } catch (err) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-charcoal/10 text-sm text-charcoal/60 hover:border-moss/30 hover:bg-moss/5 transition-all disabled:opacity-60"
            >
              <User className="w-4 h-4 text-moss" />
              Patient Demo
            </button>
          </div>

          {/* Toggle */}
          <p className="text-center mt-8 text-sm text-charcoal/50">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-clay font-medium hover:text-clay/80 transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
