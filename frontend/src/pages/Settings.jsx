import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Save,
  RefreshCw,
  Server,
  KeyRound,
  CheckCircle2,
  Globe,
  Database,
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
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Account & Workspace Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Manage your personal profile, workspace preferences, and security settings</p>
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
              <p className="text-xs font-semibold text-slate-700">Workspace Profile Avatar</p>
              <p className="text-[11px] text-slate-400">Generated automatically based on your full name initials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Account Security & Verification */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Security & Access Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Email Verification</p>
              <p className="text-[11px] text-slate-500">{user?.isEmailVerified ? 'Account email verified & active' : 'Verification pending'}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${user?.isEmailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {user?.isEmailVerified ? 'Verified' : 'Pending'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Authentication Method</p>
              <p className="text-[11px] text-slate-500">Email & Encrypted Password</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              Active
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>All passwords and session tokens are encrypted with industry-standard cryptographic protection. Plaintext credentials are never accessible.</span>
        </div>
      </div>

      {/* Cloud Workspace & Data Protection */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          Workspace Privacy & Data Protection
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <strong className="text-slate-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Isolated Tenant Storage
            </strong>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Your inventory, sales, suppliers, and customer data are fully isolated to your private account workspace.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <strong className="text-slate-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Real-Time Stock Audit
            </strong>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Automated ledger tracking records all inventory movements, sales adjustments, and purchase workflows.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <strong className="text-slate-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Continuous Cloud Backups
            </strong>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              All transactions are backed by cloud infrastructure with high availability and redundancy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
