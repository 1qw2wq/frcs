'use client';

import React from 'react';
import { useAuthKey } from '@/context/AuthKeyContext';
import {
  ShieldAlert,
  Users,
  Database,
  KeyRound,
  LogOut,
  Radio,
  BarChart3,
  ClipboardList,
  Wrench,
  Trophy,
  Cpu,
  Server,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sqlStatus?: 'connected' | 'local_fallback';
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, sqlStatus = 'connected' }) => {
  const { role, activeKey, isAdmin, isMember, openAuthModal, openKeyManagement, logout } = useAuthKey();

  const navItems = [
    { id: 'matches', label: 'Match Center', icon: Trophy },
    { id: 'scouting', label: 'Match Scouting', icon: ClipboardList },
    { id: 'pit', label: 'Pit Specs', icon: Wrench },
    { id: 'analytics', label: 'Team Analytics', icon: BarChart3 },
    { id: 'picklist', label: 'Picklist Strategy', icon: Sparkles },
    { id: 'telemetry', label: 'Robot Telemetry', icon: Cpu },
    { id: 'sql', label: 'SQL Server', icon: Server, badge: sqlStatus === 'connected' ? 'LIVE' : 'SQL' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Telemetry Ticker */}
      <div className="flex items-center justify-between px-4 py-1 text-xs border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wider">FIRST® REEFSCAPE LIVE</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-300">Silicon Valley Regional • Match 44 in Progress</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">SQL Server:</span>
            {sqlStatus === 'connected' ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                <Database className="w-3 h-3 text-emerald-400" />
                Backend Key Linked
              </span>
            ) : (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <Database className="w-3 h-3 text-cyan-400" />
                SQL Server Active
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Telemetry: 12.8V | CAN 48%</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('matches')}>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-lg">
                  FRC
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  REEFSCAPE COMMAND
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Scouting & Telemetry Hub</p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1 py-0.2 text-[9px] font-mono rounded bg-slate-950/60 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Dual-Key Access Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium shadow-sm"
                  title={`Active Key: ${activeKey}`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">ADMINISTRATOR</span>
                </div>

                <button
                  onClick={openKeyManagement}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
                  title="Configure and manage the 2 access keys"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Manage Keys</span>
                </button>
              </div>
            )}

            {isMember && (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium shadow-sm"
                  title={`Active Key: ${activeKey}`}
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">MEMBER ACCESS</span>
                </div>

                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
                  title="Upgrade to Administrator Key"
                >
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Switch Key</span>
                </button>
              </div>
            )}

            {!isAdmin && !isMember && (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-lg shadow-blue-500/25 transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>Enter Key</span>
              </button>
            )}

            {(isAdmin || isMember) && (
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Lock Session / Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 scrollbar-none border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
