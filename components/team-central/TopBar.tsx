'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, IdCard, Radio } from 'lucide-react';

interface TopBarProps {
  portalMode: 'student' | 'admin';
  setPortalMode: (mode: 'student' | 'admin') => void;
  shopOccupancy: number;
  onOpenKiosk: () => void;
  isCheckedIn: boolean;
  onOpenNfc: () => void;
  studentName?: string;
  roleTitle?: string;
  onOpenRoleSwitcher?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  portalMode,
  setPortalMode,
  shopOccupancy,
  onOpenKiosk,
  isCheckedIn,
  onOpenNfc,
  studentName = 'Maya Patel',
  roleTitle = 'CO-CAPTAIN / SOFTWARE LEAD',
  onOpenRoleSwitcher,
}) => {
  return (
    <header className="h-16 w-full border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Left: Mode Toggle (Student Portal vs Admin Console) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setPortalMode('student')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              portalMode === 'student'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Portal
          </button>
          <button
            type="button"
            onClick={() => setPortalMode('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              portalMode === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Console
          </button>
        </div>

        {/* Role Badge */}
        <button
          type="button"
          onClick={onOpenRoleSwitcher}
          title="Click to view/switch user role"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-mono text-slate-300 hover:border-slate-700 transition"
        >
          <IdCard className="w-3.5 h-3.5 text-blue-400" />
          <span>ROLE: {roleTitle}</span>
        </button>
      </div>

      {/* Right: Kiosk Shop occupancy, Notification Bell, User Avatar */}
      <div className="flex items-center gap-3">
        {/* In Shop Now Button / Kiosk launcher */}
        <div className="flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-200 font-bold whitespace-nowrap">{shopOccupancy} IN SHOP NOW</span>
          <button
            type="button"
            onClick={onOpenKiosk}
            className="px-2 py-0.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold tracking-wider uppercase transition active:scale-95 shadow-sm"
          >
            KIOSK
          </button>
        </div>

        {/* Check in badge trigger (quick NFC scan indicator) */}
        <button
          type="button"
          onClick={onOpenNfc}
          title={isCheckedIn ? 'You are currently clocked in' : 'Click to clock in/out with RFID'}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
            isCheckedIn
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className={`w-3 h-3 ${isCheckedIn ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span>{isCheckedIn ? 'ON FLOOR' : 'OFF FLOOR'}</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#0B0F17]" />
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-2.5 pl-1.5">
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-500/40 shrink-0 bg-slate-800">
            <Image
              src="/assets/maya_patel.jpg"
              alt={studentName}
              fill
              sizes="36px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-bold text-white">{studentName}</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">TEAM #5419</p>
          </div>
        </div>
      </div>
    </header>
  );
};
