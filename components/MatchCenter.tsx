'use client';

import React, { useState } from 'react';
import { FrcMatch, FrcTeam } from '@/types/frc';
import { Trophy, Clock, Zap, ArrowRight, Shield, Award, Users, Filter, CheckCircle2 } from 'lucide-react';

interface MatchCenterProps {
  matches: FrcMatch[];
  teams: FrcTeam[];
  onSelectScoutMatch: (matchNumber: number, teamNumber: number, alliance: 'Red' | 'Blue') => void;
  onSelectTeam: (teamNumber: number) => void;
}

export const MatchCenter: React.FC<MatchCenterProps> = ({
  matches,
  teams,
  onSelectScoutMatch,
  onSelectTeam,
}) => {
  const [filter, setFilter] = useState<'all' | 'Completed' | 'In Progress' | 'Upcoming'>('all');
  const [selectedMatch, setSelectedMatch] = useState<FrcMatch | null>(null);

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const getTeamObj = (num: number) => teams.find((t) => t.number === num);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
              <Trophy className="w-5 h-5 text-amber-400" />
            </span>
            Tournament Match Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Live alliance schedule · win probabilities · SQL-backed scores · {matches.length} matches loaded
          </p>
        </div>

        <div className="relative flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          {(['all', 'In Progress', 'Upcoming', 'Completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition capitalize ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {f === 'all' ? 'All Matches' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMatches.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No matches in the SQL database</p>
            <p className="mt-1 text-xs text-slate-500 font-mono">
              Open SQL Server → Clear Data → Restore Seed Data, or insert rows via the query console.
            </p>
          </div>
        )}
        {filteredMatches.map((match) => {
          const isLive = match.status === 'In Progress';
          const isDone = match.status === 'Completed';
          const isUpcoming = match.status === 'Upcoming';

          const redWinProb = match.predictedWinner === 'Red' ? match.predictedWinProb : 1 - match.predictedWinProb;
          const blueWinProb = match.predictedWinner === 'Blue' ? match.predictedWinProb : 1 - match.predictedWinProb;

          return (
            <div
              key={match.matchNumber}
              className={`bg-slate-900/90 border rounded-2xl overflow-hidden transition shadow-lg backdrop-blur ${
                isLive
                  ? 'border-amber-500/60 shadow-amber-500/15 ring-1 ring-amber-500/20'
                  : 'border-slate-800 hover:border-cyan-500/30 hover:shadow-cyan-500/5'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-sm">
                    Match Q{match.matchNumber}
                  </span>
                  <span className="text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {match.scheduledTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isLive && (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                      LIVE IN ARENA
                    </span>
                  )}
                  {isDone && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Final Score
                    </span>
                  )}
                  {isUpcoming && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                      Queueing
                    </span>
                  )}
                </div>
              </div>

              {/* Match Arena Grid: Red Alliance vs Blue Alliance */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Red Alliance Column */}
                <div className="md:col-span-5 bg-gradient-to-r from-red-950/40 to-transparent p-3.5 rounded-xl border border-red-500/20">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold font-mono tracking-wider text-red-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      RED ALLIANCE
                    </span>
                    {match.redAlliance.score !== undefined && (
                      <span className="text-2xl font-black font-mono text-red-400">
                        {match.redAlliance.score}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {match.redAlliance.teams.map((tNum) => {
                      const t = getTeamObj(tNum);
                      return (
                        <div
                          key={tNum}
                          className="bg-slate-900/90 border border-red-500/30 p-2 rounded-lg text-center hover:border-red-400 transition cursor-pointer"
                          onClick={() => onSelectTeam(tNum)}
                        >
                          <div className="text-sm font-black font-mono text-white">#{tNum}</div>
                          <div className="text-[10px] text-slate-400 truncate">{t?.name || 'Team'}</div>
                          <div className="text-[9px] font-mono text-red-300 mt-1">EPA: {t?.epa || 50}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectScoutMatch(match.matchNumber, tNum, 'Red');
                            }}
                            className="mt-1.5 w-full py-0.5 text-[9px] font-semibold bg-red-950 hover:bg-red-900 text-red-200 rounded border border-red-800/60"
                          >
                            Scout
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* VS / Win Probability Predictor */}
                <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-2">
                  <span className="text-xs font-mono font-bold text-slate-500">VS</span>

                  <div className="w-full my-2">
                    <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                      <span className="text-red-400 font-bold">{Math.round(redWinProb * 100)}%</span>
                      <span className="text-slate-500">Win Prob</span>
                      <span className="text-blue-400 font-bold">{Math.round(blueWinProb * 100)}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{ width: `${redWinProb * 100}%` }}
                      />
                      <div
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${blueWinProb * 100}%` }}
                      />
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-amber-400/90 font-medium">
                    Pred: {match.predictedWinner} Alliance
                  </span>
                </div>

                {/* Blue Alliance Column */}
                <div className="md:col-span-5 bg-gradient-to-l from-blue-950/40 to-transparent p-3.5 rounded-xl border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2.5">
                    {match.blueAlliance.score !== undefined && (
                      <span className="text-2xl font-black font-mono text-blue-400">
                        {match.blueAlliance.score}
                      </span>
                    )}
                    <span className="text-xs font-bold font-mono tracking-wider text-blue-400 flex items-center gap-1.5 ml-auto">
                      BLUE ALLIANCE
                      <Shield className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {match.blueAlliance.teams.map((tNum) => {
                      const t = getTeamObj(tNum);
                      return (
                        <div
                          key={tNum}
                          className="bg-slate-900/90 border border-blue-500/30 p-2 rounded-lg text-center hover:border-blue-400 transition cursor-pointer"
                          onClick={() => onSelectTeam(tNum)}
                        >
                          <div className="text-sm font-black font-mono text-white">#{tNum}</div>
                          <div className="text-[10px] text-slate-400 truncate">{t?.name || 'Team'}</div>
                          <div className="text-[9px] font-mono text-blue-300 mt-1">EPA: {t?.epa || 50}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectScoutMatch(match.matchNumber, tNum, 'Blue');
                            }}
                            className="mt-1.5 w-full py-0.5 text-[9px] font-semibold bg-blue-950 hover:bg-blue-900 text-blue-200 rounded border border-blue-800/60"
                          >
                            Scout
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Match Breakdown Stats if Completed */}
              {isDone && match.redAlliance.autoScore !== undefined && (
                <div className="px-5 py-2.5 bg-slate-950/60 border-t border-slate-800/60 grid grid-cols-3 text-center text-xs font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px]">AUTO SCORE</span>
                    <span className="text-red-400 font-bold">{match.redAlliance.autoScore}</span>
                    <span className="text-slate-600 mx-1.5">-</span>
                    <span className="text-blue-400 font-bold">{match.blueAlliance.autoScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">TELEOP CORAL/ALGAE</span>
                    <span className="text-red-400 font-bold">{match.redAlliance.teleopScore}</span>
                    <span className="text-slate-600 mx-1.5">-</span>
                    <span className="text-blue-400 font-bold">{match.blueAlliance.teleopScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ENDGAME CAGE</span>
                    <span className="text-red-400 font-bold">{match.redAlliance.endgameScore}</span>
                    <span className="text-slate-600 mx-1.5">-</span>
                    <span className="text-blue-400 font-bold">{match.blueAlliance.endgameScore}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
