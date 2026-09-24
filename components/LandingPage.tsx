'use client';

import React from 'react';
import {
  ShieldAlert,
  Users,
  Database,
  Trophy,
  ClipboardList,
  ArrowRight,
  Radio,
  Server,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#05070d] text-slate-100">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[420px] rounded-full bg-blue-600/10 blur-[90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-10">
        {/* Top nav */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-700 shadow-lg shadow-cyan-500/30">
              <span className="text-sm font-black text-white">5419</span>
            </div>
            <div>
              <p className="text-sm font-black tracking-wider text-white">VORTEX COMMAND</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                FRC Scouting · Team Central
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onEnter}
            className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/40 hover:text-white"
          >
            Sign in
          </button>
        </header>

        {/* Hero */}
        <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            REEFSCAPE 2025 · SYSTEM ONLINE
          </div>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Tournament scouting &amp;{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              team operations
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Dual-key access for administrators and members. Live match scouting, pit specs, analytics,
            and a SQL-backed data layer — local SQLite or Supabase cloud.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onEnter}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition hover:from-blue-500 hover:to-cyan-500"
            >
              Enter Command Center
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Role cards */}
          <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 text-left">
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 backdrop-blur">
              <div className="mb-3 flex items-center gap-2 text-amber-300">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Administrator</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Full console: SQL backend, clear/reset data, picklist strategy, roster ops, lead
                metrics, and kiosk control.
              </p>
              <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-amber-200/70">
                <li className="flex items-center gap-1.5">
                  <Server className="h-3 w-3" /> SQL Server &amp; Clear Data
                </li>
                <li className="flex items-center gap-1.5">
                  <Trophy className="h-3 w-3" /> Picklist &amp; Lead Overview
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-5 backdrop-blur">
              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <Users className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Team Member</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Student portal: hours &amp; badges, subsystem tasks, match &amp; pit scouting, and team
                analytics — no admin tools.
              </p>
              <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-cyan-200/70">
                <li className="flex items-center gap-1.5">
                  <ClipboardList className="h-3 w-3" /> Match &amp; Pit Scouting
                </li>
                <li className="flex items-center gap-1.5">
                  <Radio className="h-3 w-3" /> Floor check-in &amp; hours
                </li>
              </ul>
            </div>
          </div>

          {/* Feature strip */}
          <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Database, label: 'SQL Backend' },
              { icon: ClipboardList, label: 'Live Scouting' },
              { icon: Sparkles, label: 'EPA Analytics' },
              { icon: Trophy, label: 'Picklist' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-3 text-xs font-medium text-slate-300"
              >
                <Icon className="h-3.5 w-3.5 text-cyan-400" />
                {label}
              </div>
            ))}
          </div>
        </main>

        <footer className="pb-4 text-center font-mono text-[10px] uppercase tracking-widest text-slate-600">
          Team 5419 Vortex · FIRST Robotics Competition
        </footer>
      </div>
    </div>
  );
};
