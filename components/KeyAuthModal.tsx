'use client';

import React, { useEffect, useState } from 'react';
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

  // Escape always dismisses (back to landing when logged out)
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        e.preventDefault();
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthModalOpen, isSubmitting, closeAuthModal]);

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

  const handleDismiss = () => {
    if (isSubmitting) return;
    setStatusMessage(null);
    closeAuthModal();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a0b]/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onMouseDown={(e) => {
        // Click outside the card closes
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div className="relative w-full max-w-md border border-[#f4f0ea]/10 bg-[#12141a] shadow-2xl overflow-hidden p-6 sm:p-7">
        {/* Always-visible close — works on landing before sign-in */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#f4f0ea]/12 bg-[#0a0a0b]/60 text-[#f4f0ea]/55 transition hover:border-[#f4f0ea]/25 hover:bg-[#f4f0ea]/10 hover:text-[#f4f0ea]"
          type="button"
          aria-label="Close sign in"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-10">
          <div className="flex h-11 w-11 items-center justify-center bg-[#c45c26]/15 text-[#e8a87c]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="font-display text-xl font-medium tracking-tight text-[#f4f0ea]">
              Sign in
            </h2>
            <p className="text-[12px] text-[#f4f0ea]/45">
              Members · name &amp; password · Admin · access token
            </p>
          </div>
        </div>

        <div
          className={`mb-4 flex items-start gap-2 border px-3 py-2.5 text-[11px] font-landing-mono ${
            keysFromEnv
              ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-200/90'
              : 'border-rose-500/30 bg-rose-950/40 text-rose-200'
          }`}
        >
          <Server className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
          <div className="leading-relaxed">
            {keysFromEnv ? (
              <>
                Tokens from env · admin{' '}
                <span className="text-emerald-300">{envSource.admin}</span> · member{' '}
                <span className="text-emerald-300">{envSource.member}</span>. Member token only at
                first setup.
              </>
            ) : (
              <>
                Set <span className="text-amber-200">FRC_ADMIN_KEY</span> and{' '}
                <span className="text-amber-200">FRC_MEMBER_KEY</span> in env, then restart. No built-in
                defaults.
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 grid grid-cols-3 gap-px bg-[#f4f0ea]/10 p-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setStatusMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-medium tracking-wide transition ${
                tab === t.id
                  ? t.id === 'admin'
                    ? 'bg-[#c45c26] text-[#f4f0ea]'
                    : 'bg-[#f4f0ea] text-[#0a0a0b]'
                  : 'bg-[#0a0a0b]/50 text-[#f4f0ea]/45 hover:bg-[#f4f0ea]/5 hover:text-[#f4f0ea]/80'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* MEMBER LOGIN — name + password only */}
        {tab === 'member-login' && (
          <form onSubmit={handleMemberLogin} className="space-y-3.5">
            <p className="text-[13px] leading-relaxed text-[#f4f0ea]/55">
              Returning members use the <span className="text-[#e8a87c]">name</span> and{' '}
              <span className="text-[#e8a87c]">password</span> from first setup. No token after that.
            </p>
            <div>
              <label className="mb-1.5 block font-landing-mono text-[10px] font-medium tracking-[0.18em] text-[#f4f0ea]/45 uppercase">
                Your name
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-[#f4f0ea]/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full border border-[#f4f0ea]/12 bg-[#0a0a0b] py-2.5 pl-10 pr-4 text-sm text-[#f4f0ea] placeholder:text-[#f4f0ea]/25 focus:border-[#e8a87c]/50 focus:outline-none"
                  autoFocus
                  autoComplete="username"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-landing-mono text-[10px] font-medium tracking-[0.18em] text-[#f4f0ea]/45 uppercase">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#f4f0ea]/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Your personal password"
                  className="w-full border border-[#f4f0ea]/12 bg-[#0a0a0b] py-2.5 pl-10 pr-4 font-landing-mono text-sm text-[#f4f0ea] placeholder:text-[#f4f0ea]/25 focus:border-[#e8a87c]/50 focus:outline-none"
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
              className="flex w-full items-center justify-center gap-2 bg-[#f4f0ea] py-3 text-[13px] font-semibold tracking-wide text-[#0a0a0b] transition hover:bg-[#e8a87c] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in as member'
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab('member-register')}
              className="w-full font-landing-mono text-[11px] text-[#f4f0ea]/40 transition hover:text-[#e8a87c]"
            >
              First time? Create your account →
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full pt-1 text-[12px] text-[#f4f0ea]/35 transition hover:text-[#f4f0ea]/70"
            >
              Cancel · back to landing
            </button>
          </form>
        )}

        {/* MEMBER REGISTER */}
        {tab === 'member-register' && (
          <form onSubmit={handleMemberRegister} className="space-y-3.5">
            <p className="text-[13px] leading-relaxed text-[#f4f0ea]/55">
              First setup: name, password, and the shared{' '}
              <span className="text-[#e8a87c]">member token</span> once. Later logins are name + password
              only.
            </p>
            <div>
              <label className="mb-1.5 block font-landing-mono text-[10px] font-medium tracking-[0.18em] text-[#f4f0ea]/45 uppercase">
                Your name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Full name (how teammates see you)"
                className="w-full border border-[#f4f0ea]/12 bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f4f0ea] placeholder:text-[#f4f0ea]/25 focus:border-[#e8a87c]/50 focus:outline-none"
                autoFocus
                autoComplete="name"
                disabled={isSubmitting}
                required
                minLength={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1.5 block font-landing-mono text-[10px] font-medium tracking-[0.18em] text-[#f4f0ea]/45 uppercase">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 4 chars"
                  className="w-full border border-[#f4f0ea]/12 bg-[#0a0a0b] px-3.5 py-2.5 font-landing-mono text-sm text-[#f4f0ea] placeholder:text-[#f4f0ea]/25 focus:border-[#e8a87c]/50 focus:outline-none"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  required
                  minLength={4}
                />
              </div>
              <div>
                <label className="mb-1.5 block font-landing-mono text-[10px] font-medium tracking-[0.18em] text-[#f4f0ea]/45 uppercase">
                  Confirm
                </label>
                <input
                  type="password"
                  value={regPassword2}
                  onChange={(e) => setRegPassword2(e.target.value)}
                  placeholder="Repeat"
                  className="w-full border border-[#f4f0ea]/12 bg-[#0a0a0b] px-3.5 py-2.5 font-landing-mono text-sm text-[#f4f0ea] placeholder:text-[#f4f0ea]/25 focus:border-[#e8a87c]/50 focus:outline-none"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  required
                  minLength={4}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-landing-mono text-[10px] font-medium tracking-[0.18em] text-[#f4f0ea]/45 uppercase">
                Member token <span className="text-[#e8a87c]">(once)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#f4f0ea]/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={regToken}
                  onChange={(e) => setRegToken(e.target.value)}
                  placeholder="Paste FRC_MEMBER_KEY from admin"
                  className="w-full border border-[#f4f0ea]/12 bg-[#0a0a0b] py-2.5 pl-10 pr-4 font-landing-mono text-sm text-[#f4f0ea] placeholder:text-[#f4f0ea]/25 focus:border-[#e8a87c]/50 focus:outline-none"
                  autoComplete="off"
                  disabled={isSubmitting}
                  required
                />
              </div>
              {showMemberTokenHint && keys.memberKey && (
                <button
                  type="button"
                  onClick={() => setRegToken(keys.memberKey)}
                  className="mt-1.5 font-landing-mono text-[10px] text-[#7eb8c9] hover:text-[#f4f0ea]"
                >
                  Fill from NEXT_PUBLIC_FRC_MEMBER_KEY
                </button>
              )}
            </div>

            {statusMessage && <StatusBanner msg={statusMessage} />}

            <button
              type="submit"
              disabled={
                isSubmitting || !regName.trim() || !regPassword || !regPassword2 || !regToken.trim()
              }
              className="flex w-full items-center justify-center gap-2 bg-[#f4f0ea] py-3 text-[13px] font-semibold tracking-wide text-[#0a0a0b] transition hover:bg-[#e8a87c] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Register & enter'
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab('member-login')}
              className="w-full font-landing-mono text-[11px] text-[#f4f0ea]/40 transition hover:text-[#e8a87c]"
            >
              Already registered? Sign in →
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full pt-1 text-[12px] text-[#f4f0ea]/35 transition hover:text-[#f4f0ea]/70"
            >
              Cancel · back to landing
            </button>
          </form>
        )}

        {/* ADMIN */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-3.5">
            <p className="text-[13px] leading-relaxed text-[#f4f0ea]/55">
              Admins use the shared <span className="text-[#e8a87c]">admin access token</span> from{' '}
              <span className="font-landing-mono text-[#f4f0ea]/40">FRC_ADMIN_KEY</span>.
            </p>
            <div>
              <label className="mb-1.5 block font-landing-mono text-[10px] font-medium tracking-[0.18em] text-[#f4f0ea]/45 uppercase">
                Admin access token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#f4f0ea]/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Paste administrator key"
                  className="w-full border border-[#f4f0ea]/12 bg-[#0a0a0b] py-2.5 pl-10 pr-4 font-landing-mono text-sm text-[#f4f0ea] placeholder:text-[#f4f0ea]/25 focus:border-[#c45c26]/60 focus:outline-none"
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
              className="flex w-full items-center justify-center gap-2 bg-[#c45c26] py-3 text-[13px] font-semibold tracking-wide text-[#f4f0ea] transition hover:bg-[#e07a3d] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating…
                </>
              ) : (
                'Continue as admin'
              )}
            </button>

            {showAdminValue && keys.adminKey && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleQuickAdmin}
                className="flex w-full flex-col items-start border border-[#c45c26]/35 bg-[#c45c26]/10 p-3 text-left transition hover:border-[#c45c26]/60 disabled:opacity-50"
              >
                <div className="mb-0.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#e8a87c]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Quick admin</span>
                </div>
                <span className="w-full truncate font-landing-mono text-[10px] text-[#f4f0ea]/40">
                  {keys.adminKey}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full pt-1 text-[12px] text-[#f4f0ea]/35 transition hover:text-[#f4f0ea]/70"
            >
              Cancel · back to landing
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

function StatusBanner({ msg }: { msg: { type: 'error' | 'success'; text: string } }) {
  return (
    <div
      className={`flex items-center gap-2 border p-3 text-xs ${
        msg.type === 'error'
          ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      }`}
    >
      {msg.type === 'error' ? (
        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
      ) : (
        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      )}
      <span className="leading-snug">{msg.text}</span>
    </div>
  );
}
