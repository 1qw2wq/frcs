'use client';

import React, { useState } from 'react';
import { useAuthKey } from '@/context/AuthKeyContext';
import { ShieldAlert, Users, KeyRound, Check, AlertCircle, X, Lock } from 'lucide-react';

export const KeyAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithKey, keys } = useAuthKey();
  const [inputKey, setInputKey] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    const result = loginWithKey(inputKey);
    if (!result.success) {
      setStatusMessage({ type: 'error', text: result.message });
    } else {
      setStatusMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    }
  };

  const handleQuickSelect = (keyToUse: string) => {
    setInputKey(keyToUse);
    const result = loginWithKey(keyToUse);
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">FRC Security Access</h2>
            <p className="text-xs text-slate-400">Enter your assigned Access Key</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Access to this FRC Command Center requires one of two designated authentication keys:
          <span className="text-amber-400 font-semibold"> Administrator Key</span> or
          <span className="text-cyan-400 font-semibold"> Team Member Key</span>.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              ACCESS KEY TOKEN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="e.g. FRC-ADMIN-2025 or FRC-MEMBER-TEAM"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                autoFocus
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
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-[0.99]"
          >
            Authenticate & Enter
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 mb-2.5 flex items-center justify-between">
            <span>QUICK ACCESS (SELECT KEY):</span>
            <span className="text-slate-500">Click to fill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Admin Key Button */}
            <button
              onClick={() => handleQuickSelect(keys.adminKey)}
              className="flex flex-col items-start p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-500/60 transition group text-left"
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

            {/* Member Key Button */}
            <button
              onClick={() => handleQuickSelect(keys.memberKey)}
              className="flex flex-col items-start p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-500/60 transition group text-left"
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
          </div>
        </div>
      </div>
    </div>
  );
};
