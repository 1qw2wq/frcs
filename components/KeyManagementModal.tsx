'use client';

import React, { useState, useEffect } from 'react';
import { useAuthKey } from '@/context/AuthKeyContext';
import { ShieldAlert, Users, Copy, Check, Save, X, AlertTriangle, Server } from 'lucide-react';

export const KeyManagementModal: React.FC = () => {
  const {
    isKeyManagementOpen,
    closeKeyManagement,
    keys,
    updateKeys,
    isAdmin,
    keysFromEnv,
    envSource,
  } = useAuthKey();
  const [adminKeyInput, setAdminKeyInput] = useState(keys.adminKey);
  const [memberKeyInput, setMemberKeyInput] = useState(keys.memberKey);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (isKeyManagementOpen) {
      setAdminKeyInput(keys.adminKey);
      setMemberKeyInput(keys.memberKey);
      setResultMessage(null);
    }
  }, [isKeyManagementOpen, keys.adminKey, keys.memberKey]);

  if (!isKeyManagementOpen) return null;

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
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
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Dual-Key Access Management</h2>
            <p className="text-xs text-slate-400">Administrator and Team Member credentials</p>
          </div>
        </div>

        {!isAdmin ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            Administrator permissions are required to view key settings. Authenticate with the Administrator key
            first.
          </div>
        ) : keysFromEnv ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-100">
              <Server className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed space-y-2">
                <p className="font-semibold text-emerald-200">Keys are managed by environment variables</p>
                <p className="text-emerald-100/80">
                  Edit your <code className="text-emerald-300">.env</code> / deployment secrets and restart the
                  server. In-app edits are disabled while env keys are active.
                </p>
                <pre className="mt-2 rounded-lg bg-slate-950/80 border border-slate-800 p-3 font-mono text-[11px] text-cyan-200 overflow-x-auto">{`FRC_ADMIN_KEY=your-admin-secret
FRC_MEMBER_KEY=your-member-secret

# Optional (exposes values to the browser for quick-login):
NEXT_PUBLIC_FRC_ADMIN_KEY=your-admin-secret
NEXT_PUBLIC_FRC_MEMBER_KEY=your-member-secret`}</pre>
                <p className="text-[11px] font-mono text-emerald-300/80">
                  Active sources · admin: {envSource.admin} · member: {envSource.member}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Admin key
                </div>
                <p className="font-mono text-slate-400 text-[11px]">
                  Source: {envSource.admin}
                  {keys.adminKey ? (
                    <>
                      <br />
                      Value:{' '}
                      <span className="text-amber-200">
                        {envSource.admin.startsWith('NEXT_PUBLIC') || envSource.admin === 'default'
                          ? keys.adminKey
                          : '•••••••• (server secret)'}
                      </span>
                    </>
                  ) : (
                    <>
                      <br />
                      <span className="text-slate-500">Server secret (not shown)</span>
                    </>
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                  <Users className="w-3.5 h-3.5" /> Member key
                </div>
                <p className="font-mono text-slate-400 text-[11px]">
                  Source: {envSource.member}
                  {keys.memberKey ? (
                    <>
                      <br />
                      Value:{' '}
                      <span className="text-cyan-200">
                        {envSource.member.startsWith('NEXT_PUBLIC') || envSource.member === 'default'
                          ? keys.memberKey
                          : '•••••••• (server secret)'}
                      </span>
                    </>
                  ) : (
                    <>
                      <br />
                      <span className="text-slate-500">Server secret (not shown)</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeKeyManagement}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
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
                    {copiedKey === 'admin' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
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
                  Prefer setting <code className="text-cyan-300">FRC_ADMIN_KEY</code> in .env for production.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
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
                    {copiedKey === 'member' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
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
                  Prefer setting <code className="text-cyan-300">FRC_MEMBER_KEY</code> in .env for production.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Without env vars, keys are stored in this browser only. Set{' '}
                <code className="text-amber-100">FRC_ADMIN_KEY</code> /{' '}
                <code className="text-amber-100">FRC_MEMBER_KEY</code> for server-wide auth.
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
                <span>Save Session Keys</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
