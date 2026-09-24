'use client';

import React from 'react';
import {
  LayoutDashboard,
  Award,
  Layers,
  BarChart3,
  Users,
  ShieldCheck,
  Radio,
  Tablet,
  Wrench,
  Zap,
  Code2,
  Gamepad2,
  Megaphone,
  Database,
  ChevronRight,
  BookOpen,
  Server,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenScoutingConsole?: () => void;
  role?: 'admin' | 'member' | 'none';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenScoutingConsole,
  role = 'member',
}) => {
  const isAdmin = role === 'admin';

  const memberItems = [
    { id: 'student-home', label: 'Home', icon: LayoutDashboard },
    { id: 'badges-hours', label: 'Badges & Hours', icon: Award },
    { id: 'assigned-subsystems', label: 'My Subsystems', icon: Layers },
    { id: 'notes-demos', label: 'Notes & Demos', icon: BookOpen },
    { id: 'safety-clearances', label: 'Safety', icon: ShieldCheck },
  ];

  const adminItems = [
    { id: 'lead-overview', label: 'Lead Overview', icon: BarChart3 },
    { id: 'all-members', label: 'All Members', icon: Users },
    { id: 'live-floor-log', label: 'Live Floor Log', icon: Radio },
    { id: 'kiosk-eligibility', label: 'Kiosk', icon: Tablet },
    { id: 'safety-clearances', label: 'Safety Clearances', icon: ShieldCheck },
  ];

  const subteams = [
    { id: 'subteam-mech', label: 'Mechanical', icon: Wrench },
    { id: 'subteam-elec', label: 'Electrical', icon: Zap },
    { id: 'subteam-soft', label: 'Software', icon: Code2 },
    { id: 'subteam-strat', label: 'Strategy', icon: Gamepad2 },
    { id: 'subteam-biz', label: 'Business', icon: Megaphone },
  ];

  const navItems = isAdmin ? adminItems : memberItems;

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 select-none flex-col justify-between overflow-y-auto border-r border-slate-800/80 bg-[#0B0F17]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div>
        <div className="relative overflow-hidden border-b border-slate-800/80 p-4">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border p-1 text-white shadow-lg ${
                isAdmin
                  ? 'border-amber-300/30 from-amber-400 via-orange-500 to-rose-600 bg-gradient-to-br shadow-amber-500/30'
                  : 'border-cyan-300/30 from-cyan-400 via-blue-500 to-indigo-700 bg-gradient-to-br shadow-cyan-500/30'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-white stroke-[2.2]">
                <polygon points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2" />
                <path d="M12 7v5l4 2" />
              </svg>
            </div>
            <div>
              <h1 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-white">
                VORTEX{' '}
                <span
                  className={`bg-clip-text text-transparent ${
                    isAdmin
                      ? 'bg-gradient-to-r from-amber-300 to-orange-400'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-400'
                  }`}
                >
                  5419
                </span>
              </h1>
              <p
                className={`font-mono text-[10px] uppercase tracking-widest ${
                  isAdmin ? 'text-amber-400/80' : 'text-cyan-400/80'
                }`}
              >
                {isAdmin ? 'Admin Console' : 'Member Portal'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-3 py-3">
          <div>
            <p className="mb-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isAdmin ? 'Operations' : 'My Portal'}
            </p>
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                      isActive
                        ? isAdmin
                          ? 'border border-amber-500/30 bg-amber-600/15 font-semibold text-amber-300 shadow-sm'
                          : 'border border-blue-500/30 bg-blue-600/15 font-semibold text-blue-400 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? (isAdmin ? 'text-amber-400' : 'text-blue-400') : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subteams — both roles, slimmed */}
          <div>
            <p className="mb-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Subteams
            </p>
            <div className="space-y-0.5">
              {subteams.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                      isActive
                        ? 'border border-blue-500/30 bg-blue-600/15 font-semibold text-blue-400 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-800/80 bg-slate-950/40 p-3">
        <button
          type="button"
          onClick={onOpenScoutingConsole}
          className={`group flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
            isAdmin
              ? 'border-amber-500/25 bg-gradient-to-r from-amber-950/80 to-slate-950 text-amber-100 hover:border-amber-400/40'
              : 'border-cyan-500/25 bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-100 hover:border-cyan-400/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Server className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <ClipboardList className="h-3.5 w-3.5 text-cyan-400" />
            )}
            <span className="font-mono text-[11px]">
              {isAdmin ? 'Scouting + SQL' : 'Match Scouting'}
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 transition-transform group-hover:translate-x-0.5" />
        </button>
        {!isAdmin && (
          <p className="px-1 text-center font-mono text-[10px] text-slate-600">
            SQL admin tools require Admin key
          </p>
        )}
      </div>
    </aside>
  );
};
