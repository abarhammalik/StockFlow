import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  MailCheck,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail } from '../services/api';
import { showToast } from '../components/ui/ToastContainer';
import logoImg from '../assets/logo.png';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Verification email sent state
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup(name.trim(), email.trim(), password);
      if (res.success && res.requiresEmailVerification) {
        setVerifiedEmail(res.email || email.trim());
        setVerificationSent(true);
        setResendCooldown(60);
        showToast('Verification email sent! Check your inbox.', 'success');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      await resendVerificationEmail({ email: verifiedEmail });
      setResendCooldown(60);
      showToast('Verification email resent! Check your inbox and spam folder.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to resend. Please try again.', 'error');
    } finally {
      setResending(false);
    }
  };

  // ─── Verification Email Sent Screen ───────────────────────────────
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-50/80 to-transparent pointer-events-none"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
          <div className="bg-white border border-slate-200 py-10 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 space-y-6 text-center">

            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center animate-[bounce_1s_ease-in-out]">
                <MailCheck className="w-10 h-10 text-emerald-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Verify Your Email
              </h2>
              <p className="text-sm text-slate-500">
                We've sent a verification link to
              </p>
              <p className="text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl inline-block">
                {verifiedEmail}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <p className="text-xs text-slate-600">Open your email inbox and look for the verification message</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <p className="text-xs text-slate-600">Click the <span className="font-semibold text-slate-800">"Confirm your mail"</span> button in the email</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <p className="text-xs text-slate-600">Come back here and <span className="font-semibold text-slate-800">sign in</span> with your credentials</p>
              </div>
            </div>

            {/* Spam warning */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Can't find the email? Check your <span className="font-bold">Spam</span> or <span className="font-bold">Promotions</span> folder.</span>
            </div>

            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend in {resendCooldown}s</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            {/* Go to Sign In */}
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Go to Sign In</span>
            </Link>

            {/* Back to Signup */}
            <button
              onClick={() => {
                setVerificationSent(false);
                setVerifiedEmail('');
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 transition flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" />
              Create a different account
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ─── Signup Form ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Soft Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-3 group">
          <img
            src={logoImg}
            alt="StockFlow Logo"
            className="w-12 h-12 rounded-2xl object-contain shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">StockFlow</span>
            <span className="text-xs text-indigo-600 font-bold block tracking-widest uppercase">Inventory Workspace</span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Create your free account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500">
          Sign up with your email to start managing your inventory workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 space-y-6">

          {/* Security Badge */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Enterprise Cloud Security
            </span>
            <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Email Verification
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name / Business Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arham Malik"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
