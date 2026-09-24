'use client';

import React, { useState } from 'react';
import { Award, Clock, Calendar, CheckCircle2, TrendingUp, Plus, Download, FileSpreadsheet, ShieldAlert, Check } from 'lucide-react';
import { HourAppealRecord } from '@/types/teamCentral';

interface BadgesAndHoursViewProps {
  onOpenHourAppeal: () => void;
  loggedHours?: number;
  hourAppeals?: HourAppealRecord[];
  onApproveAppeal?: (appealId: string) => void;
}

export const BadgesAndHoursView: React.FC<BadgesAndHoursViewProps> = ({
  onOpenHourAppeal,
  loggedHours = 64.5,
  hourAppeals = [],
  onApproveAppeal,
}) => {
  const [copiedLedger, setCopiedLedger] = useState(false);

  const weeklyHistory = [
    { week: 'Week 4 (Current)', days: 'Feb 10 - Feb 15', hours: 14.5, status: 'Active Sprint' },
    { week: 'Week 3', days: 'Feb 3 - Feb 8', hours: 18.0, status: 'Approved' },
    { week: 'Week 2', days: 'Jan 27 - Feb 1', hours: 16.5, status: 'Approved' },
    { week: 'Week 1 (Kickoff)', days: 'Jan 20 - Jan 25', hours: 15.5, status: 'Approved' },
  ];

  const earnedBadges = [
    {
      title: 'AprilTag Vision Specialist',
      level: 'Master',
      earned: 'Jan 2025',
      desc: 'Configured dual Limelight 3G Megatag2 pose estimation with sub-inch accuracy.',
      icon: '🎯',
    },
    {
      title: 'Swerve Drive Tuning',
      level: 'Advanced',
      earned: 'Dec 2024',
      desc: 'Validated Kraken X60 PID gains, azimuth encoder offsets, and wheel slip compensation.',
      icon: '⚙️',
    },
    {
      title: 'Precision Lathe Certified',
      level: 'Authorized',
      earned: 'Nov 2024',
      desc: 'Turned live axle spacers with +/- 0.002" tolerance on Clausing geared head lathe.',
      icon: '🔧',
    },
    {
      title: 'Pit Safety Captain',
      level: 'Certified',
      earned: 'Sep 2024',
      desc: 'Completed Red Cross CPR/AED certification and FIRST Regional Pit safety inspection protocol.',
      icon: '🛡️',
    },
  ];

  const handleExportCsv = () => {
    const csvContent = [
      'Week,Date Range,Hours Logged,Status',
      ...weeklyHistory.map((w) => `"${w.week}","${w.days}",${w.hours},"${w.status}"`),
      `"Total",,${loggedHours.toFixed(1)},"Verified"`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VORTEX_5419_Maya_Patel_Hours_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedLedger(true);
    setTimeout(() => setCopiedLedger(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            <span>My Badges & Shop Hours Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Student: Maya Patel (#5419-STU-0042) • Threshold Target: 50.0 Hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs font-mono flex items-center gap-2 transition cursor-pointer"
          >
            {copiedLedger ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{copiedLedger ? 'CSV Exported!' : 'Export Ledger'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenHourAppeal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono flex items-center gap-2 shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Hour Appeal</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">TOTAL LOGGED</span>
          <p className="text-3xl font-mono font-black text-emerald-400 mt-1">
            {loggedHours.toFixed(1)} <span className="text-sm font-normal text-slate-400">HRS</span>
          </p>
          <p className="text-xs text-emerald-400 font-mono mt-2">129% of regional travel qualification</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">SUBTEAM BREAKDOWN</span>
          <div className="space-y-1 mt-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span>Software & Vision:</span>
              <span className="font-bold text-blue-400">38.0 hrs</span>
            </div>
            <div className="flex justify-between">
              <span>Electrical & Wiring:</span>
              <span className="font-bold text-cyan-400">14.0 hrs</span>
            </div>
            <div className="flex justify-between">
              <span>Machining & Field:</span>
              <span className="font-bold text-slate-300">12.5 hrs</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">TRAVEL ELIGIBILITY</span>
          <div className="mt-2 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-emerald-400">
              <span>Monterey Bay Regional:</span>
              <span className="font-bold">QUALIFIED ✓</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span>Silicon Valley Regional:</span>
              <span className="font-bold">QUALIFIED ✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          EARNED TECHNICAL BADGES & ENDORSEMENTS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {earnedBadges.map((badge, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-mono text-[10px] font-bold">
                    {badge.level}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2 leading-tight">{badge.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{badge.desc}</p>
              </div>
              <p className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
                Endorsed: {badge.earned}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Hours Appeals & Adjustments Ledger */}
      {hourAppeals.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              SUBMITTED HOUR APPEALS & AUDIT TRAIL
            </h3>
            <span className="text-xs font-mono text-slate-400">{hourAppeals.length} records</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {hourAppeals.map((appeal) => (
              <div key={appeal.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">+{appeal.hoursRequested.toFixed(1)} hrs</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-blue-400">{appeal.category}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{appeal.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">{appeal.reason}</p>
                  {appeal.reviewerNotes && (
                    <p className="text-[10px] text-emerald-400 font-mono">Note: {appeal.reviewerNotes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      appeal.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        : 'bg-amber-950 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    {appeal.status === 'APPROVED' ? '✓ APPROVED' : 'PENDING REVIEW'}
                  </span>
                  {appeal.status === 'PENDING' && onApproveAppeal && (
                    <button
                      type="button"
                      onClick={() => onApproveAppeal(appeal.id)}
                      className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Shop Sessions */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          WEEKLY ATTENDANCE ARCHIVE
        </h3>
        <div className="divide-y divide-slate-800/80">
          {weeklyHistory.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs font-mono">
              <div>
                <p className="font-bold text-white">{item.week}</p>
                <p className="text-slate-400 text-[11px]">{item.days}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400 text-sm">{item.hours.toFixed(1)} hrs</p>
                <span className="text-[10px] text-slate-400">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
