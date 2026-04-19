import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Save, ArrowLeft, CheckCircle,
  FileText, Lock, Eye, EyeOff, ShieldCheck, Package,
  ChevronRight, Sparkles, BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import PasswordStrength, { isPasswordValid } from '../../components/PasswordStrength';

// ── Shared styles ─────────────────────────────────────────────────────────────
const INPUT = 'w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all';
const LABEL = 'block text-[11px] font-black text-gray-500 uppercase tracking-[0.12em] mb-2';

// ── Alert ─────────────────────────────────────────────────────────────────────
const Alert = ({ type, text }) => (
  <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold animate-[fadeIn_0.3s_ease] ${
    type === 'success'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-red-50 text-red-600 border border-red-200'
  }`}>
    {type === 'success'
      ? <CheckCircle size={16} className="flex-shrink-0 text-emerald-500" />
      : <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0" />}
    {text}
  </div>
);

// ── Solid card (no glass blur issues) ────────────────────────────────────────
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-100 rounded-3xl shadow-sm ${className}`}>
    {children}
  </div>
);

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', phone: '', address: '', gstNumber: '' });
  const [msg, setMsg]       = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [pw, setPw]           = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw]   = useState(false);
  const [pwMsg, setPwMsg]     = useState({ type: '', text: '' });
  const [savingPw, setSavingPw] = useState(false);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '', gstNumber: user.gstNumber || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg({ type: '', text: '' });
    try {
      const result = await updateProfile({ name: form.name, phone: form.phone, address: form.address, gstNumber: form.gstNumber || null });
      if (result.success) { setMsg({ type: 'success', text: 'Profile updated successfully!' }); setTimeout(() => setMsg({ type: '', text: '' }), 3000); }
      else setMsg({ type: 'error', text: result.error || 'Failed to update profile' });
    } catch { setMsg({ type: 'error', text: 'An unexpected error occurred' }); }
    finally { setSaving(false); }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault(); setPwMsg({ type: '', text: '' });
    if (!isPasswordValid(pw.newPassword)) { setPwMsg({ type: 'error', text: 'New password does not meet requirements.' }); return; }
    if (pw.newPassword !== pw.confirmPassword) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    setSavingPw(true);
    try {
      const res  = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }) });
      const data = await res.json();
      if (res.ok && data.success) { setPwMsg({ type: 'success', text: 'Password changed successfully!' }); setPw({ currentPassword: '', newPassword: '', confirmPassword: '' }); setTimeout(() => setPwMsg({ type: '', text: '' }), 3000); }
      else setPwMsg({ type: 'error', text: data.message || data.error || 'Failed to change password.' });
    } catch { setPwMsg({ type: 'error', text: 'Network error. Please try again.' }); }
    finally { setSavingPw(false); }
  };

  const initials = (user?.name || user?.email || 'U')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f6f9]">

      {/* ══════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════ */}
      <div className="relative bg-gray-950 overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-600/15 rounded-full blur-[80px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-32">
          {/* Back */}
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold mb-10 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
          </button>

          {/* Profile hero row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 ring-4 ring-white/10">
                <span className="text-5xl font-black text-white leading-none">{initials}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-emerald-500 rounded-xl border-4 border-gray-950 flex items-center justify-center shadow-lg">
                <BadgeCheck size={16} className="text-white" />
              </div>
            </div>

            {/* Name + meta */}
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{user?.name || 'Your Profile'}</h1>
                <span className="hidden sm:flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                  <Sparkles size={10} /> Verified
                </span>
              </div>
              <p className="text-gray-400 font-medium text-base">{user?.email}</p>
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { icon: ShieldCheck, text: 'Verified Retailer' },
                  { icon: Package,     text: 'Wholesale Access' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
                    <Icon size={14} className="text-emerald-400" /> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Orders shortcut */}
            <button onClick={() => navigate('/my-orders')}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl font-bold text-sm transition-all flex-shrink-0">
              <Package size={16} /> My Orders <ChevronRight size={14} className="text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CONTENT (overlaps hero)
      ══════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left sidebar ── */}
          <div className="space-y-4">

            {/* Quick stats */}
            <GlassCard className="p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Account Overview</p>
              <div className="space-y-3">
                {[
                  { label: 'Account Type',  value: 'Retailer' },
                  { label: 'Status',        value: 'Active',   green: true },
                  { label: 'Member Since',  value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024' },
                  { label: 'Phone',         value: user?.phone || 'Not set' },
                ].map(({ label, value, green }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-semibold text-gray-500">{label}</span>
                    <span className={`text-xs font-black ${green ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Orders card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl p-6 overflow-hidden border border-white/5 shadow-xl">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center mb-4">
                  <Package size={22} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-extrabold text-lg mb-1">Order History</h3>
                <p className="text-gray-400 text-xs font-medium mb-5 leading-relaxed">Track shipments and download invoices for all your orders.</p>
                <button onClick={() => navigate('/my-orders')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                  View Orders <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Verified badge */}
            <GlassCard className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900 mb-0.5">Verified Retailer</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">Your account has full access to wholesale catalogues and factory-direct pricing.</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ── Right: tabs + forms ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Tab switcher */}
            <GlassCard className="p-1.5">
              <div className="flex gap-1">
                {[
                  { id: 'profile',  icon: User, label: 'Personal Details' },
                  { id: 'security', icon: Lock, label: 'Security' },
                ].map(({ id, icon: Icon, label }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                      activeTab === id
                        ? 'bg-white text-gray-900 shadow-md shadow-gray-200/60'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* ── Profile tab ── */}
            {activeTab === 'profile' && (
              <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Personal Details</h2>
                    <p className="text-xs text-gray-400 font-medium">Update your name, contact, and address</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {msg.text && <Alert type={msg.type} text={msg.text} />}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={LABEL}>Full Name *</label>
                      <div className="relative">
                        <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="name" type="text" required value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Your full name" className={`${INPUT} pl-10`} />
                      </div>
                    </div>

                    <div>
                      <label className={LABEL}>Email Address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" disabled value={form.email}
                          className="w-full pl-10 px-4 py-3.5 bg-gray-100 border border-gray-100 rounded-2xl text-sm font-medium text-gray-500 cursor-not-allowed" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium mt-1.5 ml-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className={LABEL}>Phone Number *</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="phone" type="tel" required value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+91 98765 43210" className={`${INPUT} pl-10`} />
                      </div>
                    </div>

                    <div>
                      <label className={LABEL}>GST Number <span className="text-gray-300 normal-case font-medium">(optional)</span></label>
                      <div className="relative">
                        <FileText size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="gstNumber" type="text" value={form.gstNumber}
                          onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                          maxLength={15} placeholder="22AAAAA0000A1Z5"
                          className={`${INPUT} pl-10 uppercase tracking-widest`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Shipping Address *</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-4 top-4 text-gray-400" />
                      <textarea name="address" required rows={4} value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="Your full delivery address — street, city, state, pincode…"
                        className={`${INPUT} pl-10 resize-none`} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={saving || authLoading}
                      className="flex items-center gap-2.5 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-60 shadow-xl shadow-gray-900/15 hover:shadow-emerald-500/25 hover:-translate-y-0.5">
                      {saving
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                        : <><Save size={15} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </GlassCard>
            )}

            {/* ── Security tab ── */}
            {activeTab === 'security' && (
              <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Lock size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Security Settings</h2>
                    <p className="text-xs text-gray-400 font-medium">Change your account password</p>
                  </div>
                </div>

                <form onSubmit={handlePwSubmit} className="space-y-5">
                  {pwMsg.text && <Alert type={pwMsg.type} text={pwMsg.text} />}

                  <div>
                    <label className={LABEL}>Current Password *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="currentPassword" type={showPw ? 'text' : 'password'} required value={pw.currentPassword}
                        onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="Enter your current password" className={`${INPUT} pl-10 pr-12`} />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={LABEL}>New Password *</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="newPassword" type={showPw ? 'text' : 'password'} required value={pw.newPassword}
                          onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
                          placeholder="New password" className={`${INPUT} pl-10`} />
                      </div>
                      <div className="mt-2.5"><PasswordStrength password={pw.newPassword} /></div>
                    </div>

                    <div>
                      <label className={LABEL}>Confirm Password *</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="confirmPassword" type={showPw ? 'text' : 'password'} required value={pw.confirmPassword}
                          onChange={e => setPw(p => ({ ...p, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password" className={`${INPUT} pl-10`} />
                      </div>
                      {pw.confirmPassword && pw.newPassword !== pw.confirmPassword && (
                        <p className="text-xs font-bold text-red-500 mt-2">Passwords do not match</p>
                      )}
                      {pw.confirmPassword && pw.newPassword === pw.confirmPassword && pw.confirmPassword.length > 0 && (
                        <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle size={11} /> Passwords match</p>
                      )}
                    </div>
                  </div>

                  {/* Security tips */}
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">Security Tips</p>
                    <ul className="space-y-1">
                      {['Use at least 8 characters', 'Mix uppercase, lowercase, numbers', 'Avoid using personal info'].map(tip => (
                        <li key={tip} className="text-xs text-amber-600 font-medium flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={savingPw}
                      className="flex items-center gap-2.5 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-purple-600 transition-all disabled:opacity-60 shadow-xl shadow-gray-900/15 hover:-translate-y-0.5">
                      {savingPw
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</>
                        : <><Lock size={15} /> Update Password</>}
                    </button>
                  </div>
                </form>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
