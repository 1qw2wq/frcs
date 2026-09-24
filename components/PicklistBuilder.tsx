'use client';

import React, { useState } from 'react';
import { PicklistTeam, FrcTeam } from '@/types/frc';
import { useAuthKey } from '@/context/AuthKeyContext';
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Plus,
  Trash2,
  AlertOctagon,
  Save,
  CheckCircle2,
  Layers,
  Zap,
} from 'lucide-react';

interface PicklistBuilderProps {
  teams: FrcTeam[];
  picklist: PicklistTeam[];
  onSavePicklist: (list: PicklistTeam[]) => Promise<void>;
  onSelectTeam: (teamNumber: number) => void;
}

export const PicklistBuilder: React.FC<PicklistBuilderProps> = ({
  teams,
  picklist,
  onSavePicklist,
  onSelectTeam,
}) => {
  const { isAdmin } = useAuthKey();
  const [list, setList] = useState<PicklistTeam[]>(picklist);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Alliance Simulator state
  const [simRobot1, setSimRobot1] = useState<number>(254);
  const [simRobot2, setSimRobot2] = useState<number>(1678);
  const [simRobot3, setSimRobot3] = useState<number>(2910);

  const getTeam = (num: number) => teams.find((t) => t.number === num);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!isAdmin) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-index ranks
    const reindexed = updated.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setList(reindexed);
  };

  const handleToggleDnp = (teamNumber: number) => {
    if (!isAdmin) return;
    const updated = list.map((item) => {
      if (item.teamNumber === teamNumber) {
        return {
          ...item,
          flaggedDNP: !item.flaggedDNP,
          dnpReason: !item.flaggedDNP ? 'Flagged by drive coach' : undefined,
        };
      }
      return item;
    });
    setList(updated);
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSavePicklist(list);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Alliance simulator calculation
  const r1 = getTeam(simRobot1);
  const r2 = getTeam(simRobot2);
  const r3 = getTeam(simRobot3);
  const simCombinedAuto = (r1?.autoEpa || 0) + (r2?.autoEpa || 0) + (r3?.autoEpa || 0);
  const simCombinedTeleop = (r1?.teleopEpa || 0) + (r2?.teleopEpa || 0) + (r3?.teleopEpa || 0);
  const simCombinedEndgame = (r1?.endgameEpa || 0) + (r2?.endgameEpa || 0) + (r3?.endgameEpa || 0);
  const simTotalExpectedScore = Math.round((simCombinedAuto + simCombinedTeleop + simCombinedEndgame) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Alliance Selection & Picklist Strategy
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Drive team drafting board, DNP exclusions, and 3-robot alliance simulation
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Syncing...' : 'Save to SQL Server'}</span>
            </button>
          ) : (
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/60">
              Member Read-Only Mode
            </span>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Picklist successfully saved to the SQL Server database!</span>
        </div>
      )}

      {/* Alliance Simulator Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Alliance Simulator (Playoff Seed Modeling)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Simulated Total: <span className="text-xl font-black text-amber-400 font-mono">{simTotalExpectedScore}</span> pts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">CAPTAIN (ROBOT 1)</label>
            <select
              value={simRobot1}
              onChange={(e) => setSimRobot1(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            >
              {teams.map((t) => (
                <option key={t.number} value={t.number}>
                  #{t.number} - {t.name} (EPA: {t.epa})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">1ST PICK (ROBOT 2)</label>
            <select
              value={simRobot2}
              onChange={(e) => setSimRobot2(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            >
              {teams.map((t) => (
                <option key={t.number} value={t.number}>
                  #{t.number} - {t.name} (EPA: {t.epa})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">2ND PICK (ROBOT 3)</label>
            <select
              value={simRobot3}
              onChange={(e) => setSimRobot3(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            >
              {teams.map((t) => (
                <option key={t.number} value={t.number}>
                  #{t.number} - {t.name} (EPA: {t.epa})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-center font-mono text-xs">
          <div className="bg-slate-950/70 p-2 rounded-xl">
            <span className="text-[10px] text-slate-500 block">EST. AUTO COMBINED</span>
            <span className="text-amber-400 font-bold">{Math.round(simCombinedAuto * 10) / 10} pts</span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded-xl">
            <span className="text-[10px] text-slate-500 block">EST. TELEOP COMBINED</span>
            <span className="text-cyan-400 font-bold">{Math.round(simCombinedTeleop * 10) / 10} pts</span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded-xl">
            <span className="text-[10px] text-slate-500 block">EST. ENDGAME CAGE</span>
            <span className="text-emerald-400 font-bold">{Math.round(simCombinedEndgame * 10) / 10} pts</span>
          </div>
        </div>
      </div>

      {/* Picklist Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">STRATEGIC PICKLIST BOARD</span>
          </div>
          <span className="text-slate-400">
            {isAdmin ? 'Use arrow buttons to adjust priority ranks' : 'View only mode'}
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono">
          {list.map((item, index) => {
            const team = getTeam(item.teamNumber);
            return (
              <div
                key={item.teamNumber}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  item.flaggedDNP ? 'bg-rose-950/20 border-l-4 border-rose-500' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Number */}
                  <div className="w-8 text-center text-lg font-black text-slate-400">
                    #{item.rank}
                  </div>

                  {/* Team Info */}
                  <div className="cursor-pointer" onClick={() => onSelectTeam(item.teamNumber)}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-white">#{item.teamNumber}</span>
                      <span className="text-sm font-bold text-cyan-300">{team?.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {item.role}
                      </span>
                      {item.flaggedDNP && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          DO NOT PICK
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">{item.notes}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.strengths.map((str, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                        >
                          + {str}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Overall EPA</div>
                    <div className="text-base font-black text-amber-400">{team?.epa || 50}</div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === list.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleDnp(item.teamNumber)}
                        className={`p-1.5 rounded-lg border transition ${
                          item.flaggedDNP
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400'
                        }`}
                        title={item.flaggedDNP ? 'Unflag DNP' : 'Flag as Do Not Pick'}
                      >
                        <AlertOctagon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
