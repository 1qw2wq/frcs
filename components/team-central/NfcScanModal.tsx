'use client';

import React, { useState } from 'react';
import { X, Radio, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

interface NfcScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCheckedIn: boolean;
  onToggleCheckIn: () => void;
  studentName?: string;
  studentId?: string;
}

export const NfcScanModal: React.FC<NfcScanModalProps> = ({
  isOpen,
  onClose,
  isCheckedIn,
  onToggleCheckIn,
  studentName = 'Maya Patel',
  studentId = '#5419-STU-0042',
}) => {
  const [pinInput, setPinInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSimulateTap = () => {
    setScanning(true);
    setFeedback(null);
    setTimeout(() => {
      setScanning(false);
      onToggleCheckIn();
      setFeedback({
        success: true,
        message: !isCheckedIn
          ? `RFID Verified! Clocked IN to Shop Floor at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : `RFID Verified! Clocked OUT of Shop Floor at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Hours added to your season ledger.`,
      });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1400);
    }, 800);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '7419' || pinInput.length === 4) {
      handleSimulateTap();
      setPinInput('');
    } else {
      setFeedback({
        success: false,
        message: 'Invalid 4-digit token. Default demo token is 7419.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">NFC / RFID Shop Floor Scan</h3>
              <p className="text-xs text-slate-400 font-mono">PN532 Reader • 13.56 MHz</p>
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

        {/* Sensor Simulation Graphic */}
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden">
          {/* Animated concentric radio rings */}
          <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-blue-500/40 flex items-center justify-center mb-3">
            {scanning && (
              <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
            )}
            <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Radio className={`w-8 h-8 ${scanning ? 'animate-spin' : ''}`} />
            </div>
          </div>

          <p className="text-sm font-bold text-white">
            {scanning ? 'Reading NFC Card Tag...' : 'Ready for Badge Tap'}
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Target: {studentName} ({studentId})
          </p>
          <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
            Current Status: {isCheckedIn ? 'CURRENTLY IN SHOP' : 'OFF FLOOR'}
          </p>

          <button
            type="button"
            onClick={handleSimulateTap}
            disabled={scanning}
            className="mt-4 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-95 text-white font-medium text-xs font-mono tracking-wider uppercase transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isCheckedIn ? 'Tap Badge to Check OUT' : 'Tap Badge to Check IN'}</span>
          </button>
        </div>

        {/* Feedback Alert */}
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

        {/* Alternative: 4-digit PIN Entry */}
        <div className="pt-2 border-t border-slate-800">
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Or Enter 4-Digit Kiosk Token:</span>
              <span className="text-blue-400 font-bold">PIN: 7419</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="7419"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono font-bold tracking-widest text-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
