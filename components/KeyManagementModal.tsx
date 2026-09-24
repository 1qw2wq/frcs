'use client';

import React, { useState } from 'react';
import { useAuthKey } from '@/context/AuthKeyContext';
import { ShieldAlert, Users, Copy, Check, Save, X, AlertTriangle } from 'lucide-react';

export const KeyManagementModal: React.FC = () => {
  const { isKeyManagementOpen, closeKeyManagement, keys, updateKeys, isAdmin } = useAuthKey();
  const [adminKeyInput, setAdminKeyInput] = useState(keys.adminKey);
  const [memberKeyInput, setMemberKeyInput] = useState(keys.memberKey);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isKeyManagementOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage(null);
    const result = updateKeys(adminKeyInput, memberKeyInput);
    if (result.success) {
      setResultMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        closeKeyManagement();
      }, 1200);
    } else {
      setResultMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <button
          onClick={closeKeyManagement}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Dual-Key Access Management</h2>
            <p className="text-xs text-slate-400">Configure credentials for Administrator and Team Members</p>
          </div>
        </div>

        {!isAdmin ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            Administrator permissions are required to modify access keys. Please authenticate with the Administrator key first.
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
              {/* Administrator Key Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>ADMINISTRATOR ACCESS KEY</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(adminKeyInput, 'admin')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'admin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'admin' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-sm text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Grants full control: SQL server configuration, query console, editing matches, strategy picklists.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                {/* Member Key Field */}
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>TEAM MEMBER ACCESS KEY</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(memberKeyInput, 'member')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'member' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'member' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={memberKeyInput}
                  onChange={(e) => setMemberKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-cyan-500/40 rounded-lg text-sm text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Grants member permissions: submit match & pit scouting, view analytics, read-only picklists.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Key changes take effect immediately across all dashboard pages, tabs, and connected sessions.
              </span>
            </div>

            {resultMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  resultMessage.type === 'error'
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                {resultMessage.text}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeKeyManagement}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save New Keys</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
