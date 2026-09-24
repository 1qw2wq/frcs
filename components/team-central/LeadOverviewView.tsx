'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, ShieldAlert, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { MemberRosterItem } from '@/types/teamCentral';

interface LeadOverviewViewProps {
  roster: MemberRosterItem[];
  onOpenKiosk: () => void;
}

export const LeadOverviewView: React.FC<LeadOverviewViewProps> = ({ roster, onOpenKiosk }) => {
  const eligibleStudents = roster.filter((r) => r.hoursLogged >= 50).length;
  const clearedSafety = roster.filter((r) => r.safetyPassed === r.safetyTotal).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Lead Overview & Operational Command</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Team 5419 VORTEX • Build Season Week 4 Lead Burndown Matrix
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenKiosk}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono shadow-md shadow-blue-600/30 transition self-start sm:self-auto"
        >
          Launch Entryway Kiosk
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">TRAVEL ELIGIBLE</span>
          <p className="text-2xl font-mono font-black text-emerald-400 mt-1">
            {eligibleStudents} / {roster.length}
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1">Met 50-hr minimum bar</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">SHOP SAFETY RATE</span>
          <p className="text-2xl font-mono font-black text-blue-400 mt-1">
            {Math.round((clearedSafety / roster.length) * 100)}%
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1">{clearedSafety} students 100% clear</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">WEEK 4 DELIVERABLES</span>
          <p className="text-2xl font-mono font-black text-white mt-1">
            69% <span className="text-xs font-normal text-slate-400">BURNDOWN</span>
          </p>
          <p className="text-xs text-amber-400 font-mono mt-1">2 PRs awaiting lead signoff</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">ROBOT READINESS</span>
          <p className="text-2xl font-mono font-black text-emerald-400 mt-1">
            85% <span className="text-xs font-normal text-slate-400">NOMINAL</span>
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1">Intake revision 2 on mill</p>
        </div>
      </div>

      {/* Subsystem Readiness Matrix */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          ROBOT SUBSYSTEM INTEGRATION STATUS
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Swerve Drivetrain (Kraken X60 + CANivore)</p>
              <p className="text-[11px] text-slate-400">Tested on carpet: 16.5 ft/s top speed, 120-ohm bus nominal</p>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold text-[10px]">
              100% COMPLETE
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Coral Intake & Feeder Rollers</p>
              <p className="text-[11px] text-slate-400">Plates being machined on Tormach; assembly tonight at 6:30 PM</p>
            </div>
            <span className="px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-bold text-[10px]">
              75% IN PROGRESS
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Limelight 3G Megatag2 Pose Estimation</p>
              <p className="text-[11px] text-slate-400">Kalman covariance matrix tuned. PR #88 awaiting review</p>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold text-[10px]">
              READY FOR FIELD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Elevator SysId Gain Profiling</p>
              <p className="text-[11px] text-slate-400">Waiting for hardstop bumper installation from Mech team</p>
            </div>
            <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-bold text-[10px]">
              BLOCKED BY MECH
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
