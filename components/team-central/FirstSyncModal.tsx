'use client';

import React, { useState } from 'react';
import { X, RotateCw, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

interface FirstSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstSyncModal: React.FC<FirstSyncModalProps> = ({ isOpen, onClose }) => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  if (!isOpen) return null;

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">FIRST® STIMS Registration Sync</h3>
              <p className="text-xs text-slate-400">Official FIRST Inspires youth database sync</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">TEAM AFFILIATION:</span>
              <span className="text-white font-bold">FRC #5419 VORTEX</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">STUDENT NAME:</span>
              <span className="text-white font-bold">Maya Patel</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">FIRST ROSTER ID:</span>
              <span className="text-blue-400 font-bold">#5419-STU-0042</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">2025 STIMS CONSENT:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">DISTRICT MED RELEASE:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ON FILE (08/2025)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-300 text-[11px] leading-relaxed">
            Connected to FIRST Dashboard API endpoint. Status is verified for competition badge printing at Monterey Bay Regional & Silicon Valley Regional.
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <a
            href="https://www.firstinspires.org"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 font-mono"
          >
            <span>Open STIMS Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs font-mono flex items-center gap-2 shadow-md shadow-blue-600/30"
          >
            <RotateCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : synced ? 'Sync Complete ✓' : 'Pull STIMS Records'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
