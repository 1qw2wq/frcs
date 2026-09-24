'use client';

import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';

interface FloorEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  onRedeem: (code: string) => Promise<{ success: boolean; message: string; checkInTime?: string }>;
}

export const FloorEntryModal: React.FC<FloorEntryModalProps> = ({
  isOpen,
  onClose,
  memberName,
  onRedeem,
}) => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setBusy(true);
    try {
      const result = await onRedeem(code.trim().toUpperCase());
      setFeedback({ success: result.success, message: result.message });
      if (result.success) {
        setCode('');
        setTimeout(() => {
          onClose();
          setFeedback(null);
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err?.message || 'Could not log entry' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pit / Floor Entry Log</h3>
              <p className="text-xs text-slate-400 font-mono">Admin-issued code · logs your enter time</p>
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

        <p className="text-xs text-slate-300 leading-relaxed">
          Enter the code your admin generated for this session. Your name (
          <span className="text-cyan-300 font-semibold">{memberName}</span>) and enter time will be
          written to the live floor log. There is no fixed PIN or NFC scale-in.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-mono text-slate-400">ENTRY CODE</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. K7M2QX"
            autoFocus
            disabled={busy}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold tracking-[0.35em] text-xl text-white focus:outline-none focus:border-cyan-500 uppercase"
            autoComplete="off"
            required
            minLength={4}
            maxLength={8}
          />

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                feedback.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || code.trim().length < 4}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging…
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Log enter time
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
