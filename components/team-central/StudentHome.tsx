'use client';

import React, { useState } from 'react';
import {
  Clock,
  Shield,
  Layers,
  IdCard,
  Radio,
  Wrench,
  RotateCw,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Plane,
  Eye,
  EyeOff,
  Copy,
  Check,
  MoreHorizontal,
  ChevronRight,
  GitPullRequest,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Certification, BuildScheduleItem, SubsystemTask } from '@/types/teamCentral';

interface StudentHomeProps {
  certifications: Certification[];
  schedule: BuildScheduleItem[];
  tasks: SubsystemTask[];
  onOpenNfc: () => void;
  onOpenMachineRequest: () => void;
  onOpenHourAppeal: () => void;
  onOpenFirstSync: () => void;
  onRequestTraining: () => void;
  onSelectTask?: (task: SubsystemTask) => void;
  loggedHours?: number;
  isCheckedIn?: boolean;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  certifications,
  schedule,
  tasks,
  onOpenNfc,
  onOpenMachineRequest,
  onOpenHourAppeal,
  onOpenFirstSync,
  onRequestTraining,
  onSelectTask,
  loggedHours = 64.5,
  isCheckedIn = true,
}) => {
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'AUTOS' | 'VISION'>('ALL');
  const [showPin, setShowPin] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === 'ALL') return true;
    return task.category === taskFilter;
  });

  const handleCopyPin = () => {
    navigator.clipboard.writeText('7419');
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top System Status Tags & Welcome Header */}
      <div className="space-y-3">
        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-emerald-800/50 bg-emerald-950/30 px-2.5 py-1 font-mono text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isCheckedIn ? 'ON FLOOR' : 'OFF FLOOR'} · {loggedHours}h logged
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-baseline gap-2">
              <span>Welcome back, Maya</span>
              <span className="text-blue-400 text-xl sm:text-2xl font-mono">#5419</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Member portal · tasks, hours, and scouting
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenNfc}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Scan In / Out (NFC)</span>
            </button>
            <button
              type="button"
              onClick={onOpenMachineRequest}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-95 text-slate-200 font-medium text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-slate-400" />
              <span>Request Machine</span>
            </button>
            <button
              type="button"
              onClick={onOpenHourAppeal}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-95 text-slate-200 font-medium text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Hour Appeal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Logged Shop Hours */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              LOGGED SHOP HOURS
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-tight">
              {loggedHours.toFixed(1)} <span className="text-slate-500 text-lg font-normal">/ 50.0 HRS</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono">
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold text-[10px]">
                129% THRESHOLD
              </span>
              <span className="text-slate-400 font-semibold">+14.5 HRS OVER</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">ELIGIBLE FOR MONTEREY BAY & SVR!</span>
          </div>
        </div>

        {/* Metric 2: Safety Clearances */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              SAFETY CLEARANCES
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
              7 <span className="text-slate-500 text-lg font-normal">/ 8 CERTIFIED</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono">
              <span className="text-slate-300 font-semibold">87.5% SHOP CLEAR</span>
              <span className="text-amber-400 font-semibold">1 REQUIREMENT LEFT</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">PENDING: WATERJET CNC EXAM (THU)</span>
          </div>
        </div>

        {/* Metric 3: Subsystem Sprints */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              SUBSYSTEM SPRINTS
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
              4 <span className="text-slate-400 text-sm font-semibold">ACTIVE</span>{' '}
              <span className="text-slate-600">/</span> 9{' '}
              <span className="text-slate-500 text-sm font-normal">DONE</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-400">
              <span className="text-slate-300 font-semibold">WEEK 4 DELIVERABLES</span>
              <span>69% BURNDOWN</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span className="truncate">LEAD REVIEW: 2 PRS AWAITING APPROVAL</span>
          </div>
        </div>

        {/* Metric 4: FIRST Registration */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              FIRST REGISTRATION
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <IdCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-tight">
              CLEARED
            </div>
            <div className="space-y-1 mt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>STIMS WAIVER 2025</span>
                <span className="text-emerald-400 font-bold">VERIFIED</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>MED RELEASE FORM</span>
                <span className="text-emerald-400 font-bold">ON FILE</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
            ID: #5419-STU-0042 • EXP 08/2025
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Certifications + Assigned Tasks */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Machine & Safety Certifications */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Machine & Safety Certifications</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Validated shop authorizations issued by mentor safety board
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestTraining}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 hover:text-white transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>+ REQUEST TRAINING CHECKOUT</span>
              </button>
            </div>

            {/* Certifications 4x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {certifications.map((cert) => {
                const isPending = cert.status === 'PENDING';
                return (
                  <div
                    key={cert.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                        {cert.id.includes('waterjet') || cert.name.includes('Waterjet') ? (
                          <span className="text-amber-400 text-xs">💧</span>
                        ) : cert.category === 'electrical' ? (
                          <span className="text-cyan-400 text-xs">⚡</span>
                        ) : (
                          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                          isPending
                            ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                            : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                        }`}
                      >
                        {isPending ? '⏱ PENDING' : '✓ CERT'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{cert.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{cert.model}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-400 space-y-0.5">
                      <div className="truncate">Mentor: {cert.mentor}</div>
                      {cert.slotInfo ? (
                        <div className="text-amber-400 font-semibold truncate">{cert.slotInfo}</div>
                      ) : (
                        <div>Exp: {cert.expDate}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Assigned Subsystem Tasks & PR Sprint */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-blue-400" />
                  <span>Assigned Subsystem Tasks & PR Sprint</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Software & Vision Backlog • FRC Crescendo / Reefscape 2025
                </p>
              </div>

              {/* Category Filter Buttons */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                {(['ALL', 'AUTOS', 'VISION'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTaskFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                      taskFilter === filter
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter} ({filter === 'ALL' ? tasks.length : tasks.filter((t) => t.category === filter).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask && onSelectTask(task)}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40 transition cursor-pointer group space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-white">{task.taskId}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {task.priority}
                      </span>
                      <span className="text-slate-500 font-normal">|</span>
                      <span className="text-slate-400 text-[11px] truncate max-w-[200px] sm:max-w-none">
                        {task.branchOrSubsystem}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                        task.statusType === 'success'
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                          : task.statusType === 'info'
                          ? 'bg-blue-950/70 text-blue-300 border-blue-800/60'
                          : task.statusType === 'purple'
                          ? 'bg-purple-950/70 text-purple-300 border-purple-800/60'
                          : 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                      }`}
                    >
                      {task.statusTag}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>{task.metadata}</span>
                    <div className="flex items-center gap-1 text-blue-400 opacity-0 group-hover:opacity-100 transition">
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Build Schedule + Travel Roster + Quick PIN */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Build Schedule (Wk 4) */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Build Schedule (Wk 4)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-mono font-bold">
                CURRENT
              </span>
            </div>

            <div className="space-y-3">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{item.dayLabel}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        item.badge === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : item.badge === 'OPEN SHOP'
                          ? 'bg-slate-900 text-slate-300 border-slate-800'
                          : item.badge === 'EXAM DAY'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                          : 'bg-blue-950 text-blue-300 border-blue-800/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200">{item.timeRange}</p>
                  <p className="text-xs text-slate-400">Focus: {item.focus}</p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                    <span>Mentor: {item.mentor}</span>
                    <span className="text-slate-300">{item.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Travel Roster Status */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plane className="w-4 h-4 text-emerald-400" />
                <span>Travel Roster Status</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono font-bold">
                LOCKED IN
              </span>
            </div>

            <div className="space-y-3">
              {/* Event 1: Monterey Bay Regional */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white">Monterey Bay Regional</h4>
                  <p className="text-[11px] text-slate-400">Week 3 • Cal State Monterey</p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500 text-slate-950 text-[10px] font-mono font-black tracking-wider uppercase shrink-0">
                  TRAVEL CONFIRMED
                </span>
              </div>

              {/* Event 2: Silicon Valley Regional */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white">Silicon Valley Regional</h4>
                  <p className="text-[11px] text-slate-400">Week 5 • SJSU Event Center</p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500 text-slate-950 text-[10px] font-mono font-black tracking-wider uppercase shrink-0">
                  TRAVEL CONFIRMED
                </span>
              </div>
            </div>

            {/* Travel Logistics Metadata Table */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-900 space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>HOTEL ROOMING ALLOCATION</span>
                <span className="text-white font-bold">ROOM 312</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>BUS TRANSPORT PASS</span>
                <span className="text-emerald-400 font-bold">ISSUED (#B-12)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>PARENT TRAVEL CONSENT</span>
                <span className="text-emerald-400 font-bold">SIGNED ON 01/18</span>
              </div>
            </div>
          </div>

          {/* Card: Quick Shop Kiosk PIN */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                QUICK SHOP KIOSK PIN
              </span>
              <button
                type="button"
                className="p-1 text-slate-500 hover:text-slate-300"
                aria-label="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-mono text-xl font-bold tracking-widest text-white">
                {showPin ? '7419' : '••••'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition flex items-center gap-1.5"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? 'HIDE' : 'REVEAL'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  title="Copy 4-digit PIN"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Tap your RFID sticker on the pit reader or enter your 4-digit token at the entryway terminal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
