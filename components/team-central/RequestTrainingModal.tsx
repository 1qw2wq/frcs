'use client';

import React, { useState } from 'react';
import { X, Shield, Calendar, CheckCircle2 } from 'lucide-react';

interface RequestTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestTrainingModal: React.FC<RequestTrainingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [exam, setExam] = useState('OMAX Waterjet CNC Practical Exam');
  const [slot, setSlot] = useState('Thursday 5:15 PM (Feb 13)');
  const [mentor, setMentor] = useState('Bob K.');
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompleted(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      setCompleted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Request Safety Checkout</h3>
              <p className="text-xs text-slate-400">Practical exam signoff by mentor board</p>
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

        {completed ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Checkout Slot Confirmed!</h4>
            <p className="text-xs text-slate-400 font-mono">
              {exam} · {slot} · Proctor: {mentor}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Practical Exam / Tool</label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="OMAX Waterjet CNC Practical Exam">OMAX Waterjet CNC Practical Exam (1 Pending Req)</option>
                <option value="Precision Lathe Advanced Threading">Precision Lathe Advanced Threading</option>
                <option value="Hot Work / Tig Welding Signoff">Hot Work / Tig Welding Signoff</option>
                <option value="Anderson SB50 High Current Crimper">Anderson SB50 High Current Crimper</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Available Exam Slot</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Thursday 5:15 PM (Feb 13)">Thursday 5:15 PM (Feb 13) · Proctor: Bob K.</option>
                <option value="Thursday 6:30 PM (Feb 13)">Thursday 6:30 PM (Feb 13) · Proctor: Bob K.</option>
                <option value="Saturday 11:00 AM (Feb 15)">Saturday 11:00 AM (Feb 15) · Proctor: Elena V.</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              Requirements before exam: Complete the online safety quiz with 100% score and wear ANSI Z87.1 approved safety glasses with side shields.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-600/30"
              >
                Reserve Checkout Slot
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
