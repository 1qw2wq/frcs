'use client';

import React, { useState } from 'react';
import { X, Wrench, Calendar, CheckCircle2 } from 'lucide-react';

interface RequestMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (details: any) => void;
}

export const RequestMachineModal: React.FC<RequestMachineModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [machine, setMachine] = useState('Tormach 1100MX Knee Mill');
  const [timeSlot, setTimeSlot] = useState('5:00 PM – 6:30 PM (Today)');
  const [material, setMaterial] = useState('6061-T6 Aluminum (1/4" Plate)');
  const [mentor, setMentor] = useState('Bob K.');
  const [notes, setNotes] = useState('Feeder plate revision 2 contouring & bearing bore pocketing');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (onSuccess) {
        onSuccess({ machine, timeSlot, material, mentor, notes });
      }
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Request Machine Slot</h3>
              <p className="text-xs text-slate-400">Shop reservation & safety proctor check</p>
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

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Machine Slot Reserved!</h4>
            <p className="text-xs text-slate-400 font-mono">
              {machine} · {timeSlot} · Supervisor: {mentor}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Tool / Machine</label>
              <select
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Tormach 1100MX Knee Mill">Tormach 1100MX Knee Mill (Certified)</option>
                <option value="Clausing 13'' Metal Lathe">Clausing 13&quot; Metal Lathe (Certified)</option>
                <option value="OMAX Abrasive Waterjet CNC">OMAX Abrasive Waterjet CNC (Requires Proctor)</option>
                <option value="Weller SMD Soldering Station">Weller SMD Soldering Station (Certified)</option>
                <option value="Formlabs Form 3L SLA Printer">Formlabs Form 3L SLA Printer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="4:30 PM – 6:00 PM">4:30 PM – 6:00 PM</option>
                  <option value="6:00 PM – 7:30 PM">6:00 PM – 7:30 PM</option>
                  <option value="7:30 PM – 9:00 PM">7:30 PM – 9:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proctor / Mentor</label>
                <select
                  value={mentor}
                  onChange={(e) => setMentor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Bob K.">Bob K. (Lead Machinist)</option>
                  <option value="Elena V.">Elena V. (Electrical/Safety)</option>
                  <option value="Dave R.">Dave R. (CAD / Fabrication)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stock Material & Dimensions</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project Purpose & Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
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
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/30"
              >
                Confirm Reservation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
