'use client';

import React, { useState } from 'react';
import { useAuthKey } from '@/context/AuthKeyContext';
import {
  ShieldAlert,
  Users,
  KeyRound,
  Check,
  AlertCircle,
  X,
  Lock,
  Loader2,
  Server,
  UserPlus,
  LogIn,
} from 'lucide-react';

type AuthTab = 'member-login' | 'member-register' | 'admin';

export const KeyAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithKey,
    registerMember,
    loginMember,
    keys,
    isAuthenticated,
    keysFromEnv,
    envSource,
  } = useAuthKey();

  const [tab, setTab] = useState<AuthTab>('member-login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  // Admin token
  const [adminKey, setAdminKey] = useState('');

  // Member login (name + password only)
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Member register (name + password + shared member token once)
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regToken, setRegToken] = useState('');

  if (!isAuthModalOpen) return null;

  const finishOk = (message: string, role?: string) => {
    setStatusMessage({
      type: 'success',
      text: `${message}${role ? ` Opening ${role === 'admin' ? 'Admin Console' : 'Member Portal'}…` : ''}`,
    });
    setTimeout(() => {
      closeAuthModal();
      setStatusMessage(null);
      setAdminKey('');
      setLoginPassword('');
      setRegPassword('');
      setRegPassword2('');
      setRegToken('');
    }, 700);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);
    try {
      const result = await loginWithKey(adminKey);
      if (!result.success) setStatusMessage({ type: 'error', text: result.message });
      else finishOk(result.message, result.role);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);
    try {
      const result = await loginMember({ name: loginName, password: loginPassword });
      if (!result.success) setStatusMessage({ type: 'error', text: result.message });
      else finishOk(result.message, result.role);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (regPassword !== regPassword2) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (regPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 4 characters.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await registerMember({
        name: regName,
        password: regPassword,
        memberToken: regToken,
      });
      if (!result.success) setStatusMessage({ type: 'error', text: result.message });
      else finishOk(result.message, result.role);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdmin = async () => {
    if (!keys.adminKey) return;
    setAdminKey(keys.adminKey);
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const result = await loginWithKey(keys.adminKey);
      if (result.success) finishOk(result.message, result.role);
      else setStatusMessage({ type: 'error', text: result.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAdminValue =
    !keysFromEnv || envSource.admin.startsWith('NEXT_PUBLIC') || envSource.admin === 'default';
  const showMemberTokenHint =
    !keysFromEnv || envSource.member.startsWith('NEXT_PUBLIC') || envSource.member === 'default';

  const tabs: { id: AuthTab; label: string; icon: React.ReactNode }[] = [
    { id: 'member-login', label: 'Member Sign In', icon: <LogIn className="w-3.5 h-3.5" /> },
    { id: 'member-register', label: 'First Setup', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { id: 'admin', label: 'Admin', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
        {isAuthenticated && (
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">FRC Security Access</h2>
            <p className="text-xs text-slate-400">
              Members: name + password · Admin: access token
            </p>
          </div>
        </div>

        <div
          className={`mb-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-mono ${
            keysFromEnv
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-slate-700 bg-slate-950/60 text-slate-400'
          }`}
        >
          <Server className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <div className="leading-relaxed">
            Shared access tokens load from env · admin:{' '}
            <span className="text-emerald-300">{envSource.admin}</span> · member:{' '}
            <span className="text-emerald-300">{envSource.member}</span>. Members need the member token{' '}
            <span className="text-cyan-300">only once</span> when registering.
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setStatusMessage(null);
              }}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[11px] font-semibold transition ${
                tab === t.id
                  ? t.id === 'admin'
                    ? 'bg-amber-600/90 text-white shadow'
                    : 'bg-cyan-600/90 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.icon}
              <span className="hidden xs:inline sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* MEMBER LOGIN — name + password only */}
        {tab === 'member-login' && (
          <form onSubmit={handleMemberLogin} className="space-y-3.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              Returning members sign in with the <span className="text-cyan-300 font-semibold">name</span> and{' '}
              <span className="text-cyan-300 font-semibold">password</span> they set at first setup. No token
              needed after registration.
            </p>
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">YOUR NAME</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  autoFocus
                  autoComplete="username"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">PASSWORD</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Your personal password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {statusMessage && <StatusBanner msg={statusMessage} />}

            <button
              type="submit"
              disabled={isSubmitting || !loginName.trim() || !loginPassword}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in as Member'
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab('member-register')}
              className="w-full text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition"
            >
              First time here? Create your account →
            </button>
          </form>
        )}

        {/* MEMBER REGISTER — name + password + member token once */}
        {tab === 'member-register' && (
          <form onSubmit={handleMemberRegister} className="space-y-3.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              First-time setup: choose a name and password, and enter the shared{' '}
              <span className="text-cyan-300 font-semibold">member access token</span> (same token model as
              admin). After this, you only use name + password.
            </p>
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">YOUR NAME</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Full name (how teammates see you)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
                autoFocus
                autoComplete="name"
                disabled={isSubmitting}
                required
                minLength={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">PASSWORD</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 4 chars"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  required
                  minLength={4}
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">CONFIRM</label>
                <input
                  type="password"
                  value={regPassword2}
                  onChange={(e) => setRegPassword2(e.target.value)}
                  placeholder="Repeat"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  required
                  minLength={4}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                MEMBER ACCESS TOKEN <span className="text-amber-400/90">(required once)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={regToken}
                  onChange={(e) => setRegToken(e.target.value)}
                  placeholder={
                    showMemberTokenHint && keys.memberKey
                      ? `Shared team token (e.g. ${keys.memberKey})`
                      : 'Paste FRC_MEMBER_KEY from your coach/admin'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  autoComplete="off"
                  disabled={isSubmitting}
                  required
                />
              </div>
              {showMemberTokenHint && keys.memberKey && (
                <button
                  type="button"
                  onClick={() => setRegToken(keys.memberKey)}
                  className="mt-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  Use demo member token: {keys.memberKey}
                </button>
              )}
            </div>

            {statusMessage && <StatusBanner msg={statusMessage} />}

            <button
              type="submit"
              disabled={
                isSubmitting || !regName.trim() || !regPassword || !regPassword2 || !regToken.trim()
              }
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Register & Enter'
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab('member-login')}
              className="w-full text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition"
            >
              Already registered? Sign in →
            </button>
          </form>
        )}

        {/* ADMIN — access token only (same token model) */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-3.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              Administrators authenticate with the shared{' '}
              <span className="text-amber-400 font-semibold">admin access token</span> (
              <span className="font-mono text-slate-400">FRC_ADMIN_KEY</span>). Members use the parallel
              member token only during first setup.
            </p>
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                ADMIN ACCESS KEY TOKEN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Paste administrator key"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  autoFocus
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {statusMessage && <StatusBanner msg={statusMessage} />}

            <button
              type="submit"
              disabled={isSubmitting || !adminKey.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating…
                </>
              ) : (
                'Authenticate as Admin'
              )}
            </button>

            {showAdminValue && keys.adminKey && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleQuickAdmin}
                className="w-full flex flex-col items-start p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-500/60 transition text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Quick Admin</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 truncate w-full">
                  Key: {keys.adminKey}
                </span>
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

function StatusBanner({ msg }: { msg: { type: 'error' | 'success'; text: string } }) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
        msg.type === 'error'
          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
      }`}
    >
      {msg.type === 'error' ? (
        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
      ) : (
        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      )}
      <span>{msg.text}</span>
    </div>
  );
}
