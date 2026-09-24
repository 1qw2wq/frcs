'use client';

import React from 'react';
import { Shield, ShieldCheck, Wrench, AlertCircle, Plus } from 'lucide-react';
import { Certification } from '@/types/teamCentral';

interface SafetyClearancesViewProps {
  certifications: Certification[];
  onRequestTraining: () => void;
}

export const SafetyClearancesView: React.FC<SafetyClearancesViewProps> = ({
  certifications,
  onRequestTraining,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Shop Machine & Safety Clearances Board</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Student: Maya Patel • 7 Certified / 1 Pending Practical Checkout
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestTraining}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs font-mono flex items-center gap-2 shadow-md shadow-emerald-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Machine Checkout</span>
        </button>
      </div>

      {/* Grid of full certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert) => {
          const isPending = cert.status === 'PENDING';
          return (
            <div
              key={cert.id}
              className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{cert.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{cert.model}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider uppercase border ${
                    isPending
                      ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                      : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                  }`}
                >
                  {isPending ? '⏱ PENDING' : '✓ CERTIFIED'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-xs font-mono space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Authorizing Mentor:</span>
                  <span className="text-white font-semibold">{cert.mentor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Validity Period:</span>
                  <span className={isPending ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {cert.slotInfo || cert.expDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discipline:</span>
                  <span className="text-blue-400 font-bold uppercase">{cert.category}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <span className="text-slate-500">PPE: Z87.1 Safety Glasses + Closed Shoes</span>
                {isPending && (
                  <button
                    type="button"
                    onClick={onRequestTraining}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    Confirm Proctor Slot →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
