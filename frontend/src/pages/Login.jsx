import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ui/ToastContainer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Signed in successfully! Welcome to StockFlow.', 'success');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Soft Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">StockFlow</span>
            <span className="text-xs text-indigo-600 font-bold block tracking-widest uppercase">Cloud SaaS</span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500">
          Enter your email and password to access your inventory workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 space-y-6">

          {/* Security Badge */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Supabase Authentication
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Encrypted
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Direct Email/Password Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* 1-Click Demo Account Autofill */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Demo Workspace Account:
              </span>
              <button
                type="button"
                onClick={() => handleUseDemo('admin@stockflow.dev', 'admin123')}
                className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">admin@stockflow.dev</p>
                    <p className="text-[10px] text-slate-500 font-mono">Password: admin123</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  Autofill
                </span>
              </button>
            </div>
          </form>

          {/* Footer Signup Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold transition">
                Create free account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
