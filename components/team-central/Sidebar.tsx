'use client';

import React from 'react';
import {
  LayoutDashboard,
  Award,
  Layers,
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  Radio,
  Tablet,
  Wrench,
  Zap,
  Code2,
  Gamepad2,
  Megaphone,
  Flag,
  ExternalLink,
  MessageSquare,
  Database,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  portalMode: 'student' | 'admin';
  setPortalMode: (mode: 'student' | 'admin') => void;
  onOpenScoutingConsole?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  portalMode,
  setPortalMode,
  onOpenScoutingConsole,
}) => {
  const memberPortalItems = [
    { id: 'student-home', label: 'Student Home', icon: LayoutDashboard },
    { id: 'badges-hours', label: 'My Badges & Hours', icon: Award },
    { id: 'assigned-subsystems', label: 'Assigned Subsystems', icon: Layers },
    { id: 'notes-demos', label: 'Notes & Robot Demos', icon: BookOpen },
  ];

  const managementItems = [
    { id: 'lead-overview', label: 'Lead Overview', icon: BarChart3 },
    { id: 'metrics-operations', label: 'Metrics & Operations', icon: TrendingUp },
  ];

  const rosterFloorItems = [
    { id: 'all-members', label: 'All Members', icon: Users },
    { id: 'safety-clearances', label: 'Safety Clearances', icon: ShieldCheck },
    { id: 'live-floor-log', label: 'Live Floor Log', icon: Radio },
    { id: 'kiosk-eligibility', label: 'Kiosk & Eligibility', icon: Tablet },
  ];

  const subteams = [
    { id: 'subteam-mech', label: 'Mechanical & CAD', icon: Wrench },
    { id: 'subteam-elec', label: 'Electrical & Pneumatics', icon: Zap },
    { id: 'subteam-soft', label: 'Software & Vision', icon: Code2 },
    { id: 'subteam-strat', label: 'Strategy & Drive Team', icon: Gamepad2 },
    { id: 'subteam-biz', label: 'Business & Outreach', icon: Megaphone },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0B0F17] border-r border-slate-800/80 flex flex-col justify-between select-none h-screen sticky top-0 overflow-y-auto">
      {/* Top Brand Section */}
      <div>
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {/* Hexagonal Blue Team Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 p-1 border border-blue-400/30">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white stroke-[2.2]">
                <polygon points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2" />
                <path d="M12 7v5l4 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                VORTEX <span className="text-blue-400">5419</span>
              </h1>
              <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">TEAM CENTRAL</p>
            </div>
          </div>

          {/* Season Status Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-900/90 flex items-center justify-between">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">SEASON STATUS</div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-0.5 text-xs font-mono font-bold text-emerald-400">
            BUILD SEASON 2025: ACTIVE (WK 4)
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-3 space-y-5">
          {/* Member Portal */}
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              MEMBER PORTAL
            </p>
            <div className="space-y-0.5">
              {memberPortalItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                      setPortalMode('student');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Management & Admin */}
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              MANAGEMENT & ADMIN
            </p>
            <div className="space-y-0.5">
              {managementItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                      setPortalMode('admin');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Roster & Floor Ops */}
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              ROSTER & FLOOR OPS
            </p>
            <div className="space-y-0.5">
              {rosterFloorItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subteams */}
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              SUBTEAMS
            </p>
            <div className="space-y-0.5">
              {subteams.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Bottom Area */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
        {/* Next Event Card */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="uppercase tracking-wider">NEXT EVENT</span>
            <Flag className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xs font-bold text-white leading-tight">Silicon Valley Regional</p>
          <p className="text-xs font-mono font-bold text-emerald-400 mt-1">IN 24 DAYS</p>
        </div>

        {/* FRC Scouting & SQL Connector Button */}
        <button
          type="button"
          onClick={onOpenScoutingConsole}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition group"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">FRC Scouting & SQL DB</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* External Links */}
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-400">
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-400 transition"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Discord</span>
          </a>
          <a
            href="https://firstinspires.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-400 transition"
          >
            <ExternalLink className="w-3 h-3" />
            <span>FIRST Hub</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
