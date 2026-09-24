/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { FrcTeam, MatchScoutingEntry, FrcMatch } from '@/types/frc';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface TeamAnalyticsProps {
  teams: FrcTeam[];
  scoutingEntries: MatchScoutingEntry[];
  matches: FrcMatch[];
  selectedTeamNumber: number;
  onSelectTeamNumber: (num: number) => void;
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({
  teams,
  scoutingEntries,
  matches,
  selectedTeamNumber,
  onSelectTeamNumber,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const currentTeam = teams.find((t) => t.number === selectedTeamNumber) || teams[0];
  const teamScouting = scoutingEntries.filter((s) => s.teamNumber === currentTeam.number);

  // Calculate statistics from scout entries
  const totalScouted = teamScouting.length;
  const avgCycles =
    totalScouted > 0
      ? Math.round((teamScouting.reduce((acc, s) => acc + s.cycles, 0) / totalScouted) * 10) / 10
      : 10.5;

  const deepClimbCount = teamScouting.filter((s) => s.climbStatus === 'Deep Cage').length;
  const climbSuccessRate = totalScouted > 0 ? Math.round((deepClimbCount / totalScouted) * 100) : 92;

  const avgDriverSkill =
    totalScouted > 0
      ? Math.round((teamScouting.reduce((acc, s) => acc + s.driverSkill, 0) / totalScouted) * 10) / 10
      : 4.8;

  // Filtered teams list for search
  const filteredTeams = teams.filter(
    (t) =>
      t.number.toString().includes(searchQuery) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Team Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Team Analytics & Performance Engine</h2>
            <p className="text-xs text-slate-400">EPA progression, cycle metrics, and match breakdown</p>
          </div>
        </div>

        {/* Quick Team Search / Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team # or name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <select
            value={currentTeam.number}
            onChange={(e) => onSelectTeamNumber(Number(e.target.value))}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-blue-500"
          >
            {filteredTeams.map((t) => (
              <option key={t.number} value={t.number}>
                #{t.number} - {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Profile Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-slate-950 shadow-xl flex-shrink-0">
              <img
                src={currentTeam.imageUrl}
                alt={currentTeam.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black font-mono text-white">#{currentTeam.number}</span>
                <span className="text-xl font-bold text-cyan-300">{currentTeam.name}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-xs font-mono font-bold border border-blue-700/60">
                  Rank #{currentTeam.rank}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {currentTeam.organization} • {currentTeam.location} • Rookie Year {currentTeam.rookieYear}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                <span className="text-emerald-400 font-semibold">
                  Record: {currentTeam.record.wins}W - {currentTeam.record.losses}L - {currentTeam.record.ties}T
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300">Chassis: {currentTeam.drivetrain}</span>
              </div>
            </div>
          </div>

          {/* Overall EPA Badge */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-slate-500 block uppercase">OVERALL RATING</span>
              <span className="text-3xl font-black font-mono text-amber-400">{currentTeam.epa}</span>
              <span className="text-[10px] font-mono text-slate-400 block">Expected Points Added</span>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Award className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* EPA Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-slate-400">AUTO EPA</span>
              <span className="text-sm font-mono font-bold text-amber-400">{currentTeam.autoEpa} pts</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (currentTeam.autoEpa / 30) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">5-piece coral consistency</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-slate-400">TELEOP EPA</span>
              <span className="text-sm font-mono font-bold text-cyan-400">{currentTeam.teleopEpa} pts</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (currentTeam.teleopEpa / 40) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">L4 coral & Algae processor cycles</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-slate-400">ENDGAME EPA</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{currentTeam.endgameEpa} pts</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (currentTeam.endgameEpa / 12) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Sub-5s Deep Cage latch</span>
          </div>
        </div>
      </div>

      {/* Scouted Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">AVG CYCLE SPEED</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">{avgCycles}</div>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Scored game pieces placed per qualification match.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">CLIMB SUCCESS RATE</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mb-1">{climbSuccessRate}%</div>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Deep Cage hang conversion in endgame under match pressure.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">DRIVER SKILL RATING</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-400 mb-1">{avgDriverSkill} / 5.0</div>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Field positioning, evasive maneuvers, and defense resilience.
          </p>
        </div>
      </div>

      {/* Scout Match History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Field Scouting Log for Team #{currentTeam.number} ({teamScouting.length} entries)
          </h3>
          <span className="text-xs font-mono text-slate-400">Direct SQL Sync</span>
        </div>

        {teamScouting.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-500">
            No match scouting records entered yet for Team #{currentTeam.number}. Go to Match Scouting to record observations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">MATCH</th>
                  <th className="py-2.5 px-3">ALLIANCE</th>
                  <th className="py-2.5 px-3">AUTO LEAVE</th>
                  <th className="py-2.5 px-3">CORAL CYCLES</th>
                  <th className="py-2.5 px-3">ALGAE</th>
                  <th className="py-2.5 px-3">CLIMB</th>
                  <th className="py-2.5 px-3">DRIVER</th>
                  <th className="py-2.5 px-3">SCOUT NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {teamScouting.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-white">Q{s.matchNumber}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          s.alliance === 'Red' ? 'text-red-400 bg-red-950/60' : 'text-blue-400 bg-blue-950/60'
                        }`}
                      >
                        {s.alliance}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">{s.autoLeave ? 'YES (+3)' : 'NO'}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{s.cycles} total</td>
                    <td className="py-2.5 px-3 text-amber-300">
                      {s.teleopAlgaeProcessor + s.autoAlgaeProcessor} P / {s.teleopAlgaeNet} N
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">{s.climbStatus}</td>
                    <td className="py-2.5 px-3 text-amber-300">{s.driverSkill}/5 ★</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-sm">{s.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
