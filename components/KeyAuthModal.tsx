'use client';

import React, { useState } from 'react';
import { useAuthKey } from '@/context/AuthKeyContext';
import { ShieldAlert, Users, KeyRound, Check, AlertCircle, X, Lock, Loader2, Server } from 'lucide-react';

export const KeyAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithKey,
    keys,
    isAuthenticated,
    keysFromEnv,
    envSource,
  } = useAuthKey();
  const [inputKey, setInputKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);
    try {
      const result = await loginWithKey(inputKey);
      if (!result.success) {
        setStatusMessage({ type: 'error', text: result.message });
      } else {
        setStatusMessage({
          type: 'success',
          text: `${result.message} Opening ${result.role === 'admin' ? 'Admin Console' : 'Member Portal'}…`,
        });
        setInputKey('');
        setTimeout(() => {
          closeAuthModal();
          setStatusMessage(null);
        }, 600);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSelect = async (keyToUse: string) => {
    if (!keyToUse) return;
    setInputKey(keyToUse);
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const result = await loginWithKey(keyToUse);
      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          closeAuthModal();
          setStatusMessage(null);
        }, 600);
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canQuickAdmin = Boolean(keys.adminKey);
  const canQuickMember = Boolean(keys.memberKey);
  // Hide actual key text when env secrets aren't exposed publicly
  const showAdminValue = !keysFromEnv || envSource.admin.startsWith('NEXT_PUBLIC') || envSource.admin === 'default';
  const showMemberValue = !keysFromEnv || envSource.member.startsWith('NEXT_PUBLIC') || envSource.member === 'default';

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

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">FRC Security Access</h2>
            <p className="text-xs text-slate-400">Enter your Administrator or Member access key</p>
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
            {keysFromEnv ? (
              <>
                Keys loaded from environment · admin:{' '}
                <span className="text-emerald-300">{envSource.admin}</span> · member:{' '}
                <span className="text-emerald-300">{envSource.member}</span>
              </>
            ) : (
              <>
                Using built-in defaults. Set <span className="text-cyan-300">FRC_ADMIN_KEY</span> and{' '}
                <span className="text-cyan-300">FRC_MEMBER_KEY</span> in <span className="text-cyan-300">.env</span> to
                customize.
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Access requires one of two keys:{' '}
          <span className="text-amber-400 font-semibold">Administrator</span> or{' '}
          <span className="text-cyan-400 font-semibold">Team Member</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              ACCESS KEY TOKEN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Paste admin or member key"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                autoFocus
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {statusMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
                statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !inputKey.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating…
              </>
            ) : (
              'Authenticate & Enter'
            )}
          </button>
        </form>

        {(canQuickAdmin || canQuickMember) && (showAdminValue || showMemberValue) && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 mb-2.5 flex items-center justify-between">
              <span>QUICK ACCESS:</span>
              <span className="text-slate-500">Click to fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {canQuickAdmin && showAdminValue && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickSelect(keys.adminKey)}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-500/60 transition group text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Administrator</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200 truncate w-full">
                    Key: {keys.adminKey}
                  </span>
                  <span className="text-[9px] text-amber-400/80 mt-1">Full Control & SQL Admin</span>
                </button>
              )}

              {canQuickMember && showMemberValue && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickSelect(keys.memberKey)}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-500/60 transition group text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-0.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Member</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200 truncate w-full">
                    Key: {keys.memberKey}
                  </span>
                  <span className="text-[9px] text-cyan-400/80 mt-1">Match & Pit Scouting</span>
                </button>
              )}
            </div>
          </div>
        )}

        {keysFromEnv && !showAdminValue && !showMemberValue && (
          <p className="mt-4 text-[11px] font-mono text-slate-500 text-center leading-relaxed">
            Server-only secrets are active. Paste the key from your secrets manager — values are not shown here.
          </p>
        )}
      </div>
    </div>
  );
};
