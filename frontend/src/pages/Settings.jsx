import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Compass,
  Database,
  Loader2,
  Key,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ui/ToastContainer';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUser({ name, email, phone, avatar });
      if (res.success) {
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Account & Cloud Workspace Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Manage your profile, authentication methods, and Supabase cloud deployment</p>
      </div>

      {/* User Profile Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          Personal Profile
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl border-2 border-indigo-100 object-cover bg-indigo-50"
            />
            <div>
              <p className="text-xs font-semibold text-slate-700">Dynamic Profile Avatar</p>
              <p className="text-[11px] text-slate-400">Generated securely via DiceBear initials SVG avatar service</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (with Country Code)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Avatar URL (Optional)</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Authentication Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Authentication & Verification Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Email Verification</p>
              <p className="text-[11px] text-slate-500">{user?.isEmailVerified ? 'Supabase Auth 6-Digit OTP Verified' : 'Pending Verification'}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${user?.isEmailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {user?.isEmailVerified ? 'Verified & Active' : 'Pending'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Authentication Provider</p>
              <p className="text-[11px] text-slate-500">Supabase Auth (Email & Encrypted Password)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              Supabase Auth
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>All passwords and OTPs are cryptographically hashed with <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">bcryptjs</code> (salt rounds: 10). Plaintext credentials are never stored.</span>
        </div>
      </div>

      {/* Supabase PostgreSQL Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          Supabase PostgreSQL Cloud Guide
        </h3>

        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <strong className="text-slate-800 block font-mono text-sm mb-1">1. Cloud PostgreSQL Connection</strong>
            <p className="text-slate-500">Connected to Supabase Project: <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">https://ztlfcujtsolbbrrujauc.supabase.co</code></p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <strong className="text-slate-800 block font-mono text-sm mb-1">2. Verify Multi-User Data Isolation</strong>
            <p className="text-slate-500">Every row in all tables contains <code className="text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">owner_id</code> that maps to the authenticated user's <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">id</code>.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <strong className="text-slate-800 block font-mono text-sm mb-1">3. Relational ACID Stock Deductions</strong>
            <p className="text-slate-500">Every POS purchase transaction executes atomic quantity adjustments and records immutable stock movement ledger entries.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
