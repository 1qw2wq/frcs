'use client';

import React, { useState } from 'react';
import { X, Clock, CheckCircle2 } from 'lucide-react';
import { HourAppealRecord } from '@/types/teamCentral';

interface HourAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (appeal: HourAppealRecord) => void;
}

export const HourAppealModal: React.FC<HourAppealModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [hours, setHours] = useState('3.5');
  const [date, setDate] = useState('2025-02-11');
  const [reason, setReason] = useState('Off-site Autonomous trajectory waypoint tuning and WPILib simulation logging');
  const [subteam, setSubteam] = useState('Software & Vision');
  const [witness, setWitness] = useState('Austin (Software Mentor)');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const parsedHours = parseFloat(hours) || 0;
    const newAppeal: HourAppealRecord = {
      id: `app-${Date.now()}`,
      studentName: 'Maya Patel',
      studentId: '#5419-STU-0042',
      hoursRequested: parsedHours,
      category: `${subteam} (Witness: ${witness})`,
      date,
      reason,
      status: 'APPROVED',
      reviewerNotes: `Auto-verified with supervising mentor ${witness}.`,
    };

    setTimeout(() => {
      if (onSuccess) onSuccess(newAppeal);
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Submit Shop Hours Appeal</h3>
              <p className="text-xs text-slate-400">Off-site work or missed badge tap appeal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Hour Appeal Submitted & Approved!</h4>
            <p className="text-xs text-slate-400 font-mono">
              +{hours} hrs credited to your attendance ledger ({witness})
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hours Requested</label>
                <input
                  type="number"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Date of Work</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Subteam Discipline</label>
              <select
                value={subteam}
                onChange={(e) => setSubteam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Software & Vision">Software & Vision</option>
                <option value="Mechanical & CAD">Mechanical & CAD</option>
                <option value="Electrical & Wiring">Electrical & Wiring</option>
                <option value="Strategy & Scouting">Strategy & Scouting</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason / Deliverables</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Supervising Mentor Witness</label>
              <input
                type="text"
                value={witness}
                onChange={(e) => setWitness(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
