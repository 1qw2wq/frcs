'use client';

import React from 'react';
import { Bell, IdCard, LogOut, KeyRound, Clock } from 'lucide-react';

interface TopBarProps {
  shopOccupancy: number;
  isCheckedIn: boolean;
  onOpenFloorEntry?: () => void;
  studentName?: string;
  roleTitle?: string;
  onOpenRoleSwitcher?: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
  onManageKeys?: () => void;
  showFloorControls?: boolean;
  lastEntryTime?: string | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  shopOccupancy,
  isCheckedIn,
  onOpenFloorEntry,
  studentName = 'Team Member',
  roleTitle = 'MEMBER',
  onOpenRoleSwitcher,
  isAdmin = false,
  onLogout,
  onManageKeys,
  showFloorControls = true,
  lastEntryTime = null,
}) => {
  const initials = String(studentName || 'TM')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#0B0F17]/90 px-4 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-mono font-bold ${
            isAdmin
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
          }`}
        >
          <IdCard className={`h-3.5 w-3.5 ${isAdmin ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span>{isAdmin ? 'ADMIN CONSOLE' : 'MEMBER PORTAL'}</span>
        </div>
        <button
          type="button"
          onClick={onOpenRoleSwitcher}
          title="Switch access"
          className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 font-mono text-xs text-slate-400 transition hover:border-slate-600 hover:text-white md:flex"
        >
          <span className="max-w-[220px] truncate">{roleTitle}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isAdmin && (
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 py-1 px-3 font-mono text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="whitespace-nowrap font-bold text-slate-200">
              {shopOccupancy} IN SHOP
            </span>
          </div>
        )}

        {showFloorControls && !isAdmin && onOpenFloorEntry && (
          <button
            type="button"
            onClick={onOpenFloorEntry}
            title={isCheckedIn ? `On floor${lastEntryTime ? ` since ${lastEntryTime}` : ''}` : 'Log floor entry with admin code'}
            className={`hidden items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition sm:flex ${
              isCheckedIn
                ? 'border-emerald-800/80 bg-emerald-950/60 text-emerald-300'
                : 'border-cyan-800/60 bg-cyan-950/40 text-cyan-300 hover:border-cyan-500/50'
            }`}
          >
            <Clock className={`h-3 w-3 ${isCheckedIn ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span>{isCheckedIn ? (lastEntryTime ? `IN ${lastEntryTime}` : 'ON FLOOR') : 'LOG ENTRY'}</span>
          </button>
        )}

        <button
          type="button"
          className="relative rounded-xl border border-slate-800 bg-slate-900/70 p-2 text-slate-300 transition hover:border-slate-700 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {onManageKeys && isAdmin && (
          <button
            type="button"
            onClick={onManageKeys}
            className="hidden items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 font-mono text-[11px] text-amber-300 transition hover:bg-amber-500/20 sm:inline-flex"
          >
            <KeyRound className="h-3 w-3" />
            Keys
          </button>
        )}

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-[11px] text-slate-400 transition hover:border-rose-500/40 hover:text-rose-300"
          >
            <LogOut className="h-3 w-3" />
            Logout
          </button>
        )}

        <div className="flex items-center gap-2.5 pl-1">
          <div
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-200 ring-2 ring-amber-500/50'
                : 'bg-cyan-500/20 text-cyan-200 ring-2 ring-cyan-500/40'
            }`}
          >
            {initials || 'TM'}
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-xs font-bold text-white">{studentName}</p>
            <p
              className={`font-mono text-[10px] uppercase tracking-wider ${
                isAdmin ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              {isAdmin ? 'ADMIN' : 'MEMBER'} · #5419
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
