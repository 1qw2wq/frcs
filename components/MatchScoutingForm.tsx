'use client';

import React, { useState } from 'react';
import { MatchScoutingEntry, FrcTeam } from '@/types/frc';
import {
  ClipboardCheck,
  Plus,
  Minus,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  Shield,
  Star,
  Activity,
} from 'lucide-react';

interface MatchScoutingFormProps {
  teams: FrcTeam[];
  scoutingEntries: MatchScoutingEntry[];
  onSubmitEntry: (entry: Partial<MatchScoutingEntry>) => Promise<void>;
  prefilledMatch?: number;
  prefilledTeam?: number;
  prefilledAlliance?: 'Red' | 'Blue';
}

interface CounterProps {
  label: string;
  value: number;
  setValue: (val: number) => void;
  color?: 'blue' | 'cyan' | 'amber' | 'emerald';
}

const Counter: React.FC<CounterProps> = ({ label, value, setValue }) => (
  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
    <span className="text-xs font-mono text-slate-300">{label}</span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setValue(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-6 text-center font-mono font-bold text-sm text-white">{value}</span>
      <button
        type="button"
        onClick={() => setValue(value + 1)}
        className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition active:scale-95"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

export const MatchScoutingForm: React.FC<MatchScoutingFormProps> = ({
  teams,
  scoutingEntries,
  onSubmitEntry,
  prefilledMatch,
  prefilledTeam,
  prefilledAlliance,
}) => {
  const [matchNumber, setMatchNumber] = useState<number>(prefilledMatch || 44);
  const [teamNumber, setTeamNumber] = useState<number>(prefilledTeam || 254);
  const [scoutName, setScoutName] = useState<string>('Scout Member');
  const [alliance, setAlliance] = useState<'Red' | 'Blue'>(prefilledAlliance || 'Red');
  const [driverStation, setDriverStation] = useState<1 | 2 | 3>(1);

  // Auto
  const [autoLeave, setAutoLeave] = useState<boolean>(true);
  const [autoCoralL1, setAutoCoralL1] = useState<number>(0);
  const [autoCoralL2, setAutoCoralL2] = useState<number>(1);
  const [autoCoralL3, setAutoCoralL3] = useState<number>(2);
  const [autoCoralL4, setAutoCoralL4] = useState<number>(1);
  const [autoAlgaeProcessor, setAutoAlgaeProcessor] = useState<number>(1);
  const [autoAlgaeNet, setAutoAlgaeNet] = useState<number>(0);

  // Teleop
  const [teleopCoralL1, setTeleopCoralL1] = useState<number>(1);
  const [teleopCoralL2, setTeleopCoralL2] = useState<number>(2);
  const [teleopCoralL3, setTeleopCoralL3] = useState<number>(3);
  const [teleopCoralL4, setTeleopCoralL4] = useState<number>(4);
  const [teleopAlgaeProcessor, setTeleopAlgaeProcessor] = useState<number>(2);
  const [teleopAlgaeNet, setTeleopAlgaeNet] = useState<number>(1);
  const [defenseRating, setDefenseRating] = useState<number>(2);

  // Endgame
  const [climbStatus, setClimbStatus] = useState<'None' | 'Park' | 'Shallow Cage' | 'Deep Cage'>('Deep Cage');
  const [climbTimeSeconds, setClimbTimeSeconds] = useState<number>(4.5);

  // Post match
  const [diedOrTipped, setDiedOrTipped] = useState<boolean>(false);
  const [cards, setCards] = useState<'None' | 'Yellow' | 'Red'>('None');
  const [driverSkill, setDriverSkill] = useState<number>(5);
  const [notes, setNotes] = useState<string>('Rapid swerve cycles with tight cornering around the reef.');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const totalAutoPoints =
    (autoLeave ? 3 : 0) +
    autoCoralL1 * 3 +
    autoCoralL2 * 4 +
    autoCoralL3 * 6 +
    autoCoralL4 * 7 +
    autoAlgaeProcessor * 6 +
    autoAlgaeNet * 4;

  const totalTeleopCoral = teleopCoralL1 + teleopCoralL2 + teleopCoralL3 + teleopCoralL4;
  const estimatedCycles = (autoCoralL1 + autoCoralL2 + autoCoralL3 + autoCoralL4) + totalTeleopCoral + teleopAlgaeProcessor + teleopAlgaeNet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await onSubmitEntry({
        matchNumber,
        teamNumber,
        scoutName,
        alliance,
        driverStation,
        autoLeave,
        autoCoralL1,
        autoCoralL2,
        autoCoralL3,
        autoCoralL4,
        autoAlgaeProcessor,
        autoAlgaeNet,
        autoMissed: 0,
        teleopCoralL1,
        teleopCoralL2,
        teleopCoralL3,
        teleopCoralL4,
        teleopAlgaeProcessor,
        teleopAlgaeNet,
        cycles: estimatedCycles,
        defenseRating,
        climbStatus,
        climbTimeSeconds,
        diedOrTipped,
        cards,
        driverSkill,
        notes,
      });

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-400" />
            Match Scouting Input Sheet
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Record real-time field observations. Saved directly to the SQL Server database.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Est. Auto Points: <span className="text-amber-400 font-bold">{totalAutoPoints}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Total Cycles: <span className="text-cyan-400 font-bold">{estimatedCycles}</span>
          </div>
        </div>
      </div>

      {/* Main Scouting Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PRE-MATCH SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
            1. Pre-Match Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">MATCH #</label>
              <input
                type="number"
                value={matchNumber}
                onChange={(e) => setMatchNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">TEAM #</label>
              {teams.length === 0 ? (
                <input
                  type="number"
                  min={1}
                  value={teamNumber || ''}
                  onChange={(e) => setTeamNumber(Number(e.target.value))}
                  placeholder="Add teams above, or type #"
                  className="w-full px-3 py-2 bg-slate-950 border border-amber-500/40 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              ) : (
                <select
                  value={teams.some((t) => t.number === teamNumber) ? teamNumber : teams[0].number}
                  onChange={(e) => setTeamNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                >
                  {teams.map((t) => (
                    <option key={t.number} value={t.number}>
                      #{t.number} - {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">ALLIANCE</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAlliance('Red')}
                  className={`py-1 text-xs font-bold font-mono rounded-lg transition ${
                    alliance === 'Red'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  RED
                </button>
                <button
                  type="button"
                  onClick={() => setAlliance('Blue')}
                  className={`py-1 text-xs font-bold font-mono rounded-lg transition ${
                    alliance === 'Blue'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BLUE
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">DRIVER STATION</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                {[1, 2, 3].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDriverStation(st as 1 | 2 | 3)}
                    className={`py-1 rounded-lg font-bold transition ${
                      driverStation === st ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    DS{st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">SCOUT NAME</label>
              <input
                type="text"
                value={scoutName}
                onChange={(e) => setScoutName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* 2. AUTONOMOUS PERIOD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              2. Autonomous Period (15 Seconds)
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
              <input
                type="checkbox"
                checked={autoLeave}
                onChange={(e) => setAutoLeave(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
              />
              <span>Auto Leave Line (+3 pts)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Counter label="Coral L1 (Trough)" value={autoCoralL1} setValue={setAutoCoralL1} />
            <Counter label="Coral L2" value={autoCoralL2} setValue={setAutoCoralL2} />
            <Counter label="Coral L3" value={autoCoralL3} setValue={setAutoCoralL3} />
            <Counter label="Coral L4 (High)" value={autoCoralL4} setValue={setAutoCoralL4} />
            <Counter label="Algae Processor" value={autoAlgaeProcessor} setValue={setAutoAlgaeProcessor} />
            <Counter label="Algae Net Throw" value={autoAlgaeNet} setValue={setAutoAlgaeNet} />
          </div>
        </div>

        {/* 3. TELEOPERATED PERIOD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
            3. Teleoperated Period (135 Seconds)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <Counter label="Teleop Coral L1" value={teleopCoralL1} setValue={setTeleopCoralL1} />
            <Counter label="Teleop Coral L2" value={teleopCoralL2} setValue={setTeleopCoralL2} />
            <Counter label="Teleop Coral L3" value={teleopCoralL3} setValue={setTeleopCoralL3} />
            <Counter label="Teleop Coral L4" value={teleopCoralL4} setValue={setTeleopCoralL4} />
            <Counter label="Teleop Processor" value={teleopAlgaeProcessor} setValue={setTeleopAlgaeProcessor} />
            <Counter label="Teleop Net Throw" value={teleopAlgaeNet} setValue={setTeleopAlgaeNet} />
          </div>

          {/* Defense Rating Slider */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-300">DEFENSE PLAYED & EFFECTIVENESS</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {defenseRating === 1 && '1 - No Defense Played'}
                {defenseRating === 2 && '2 - Light Screen / Pinning'}
                {defenseRating === 3 && '3 - Moderate T-Bone Defense'}
                {defenseRating === 4 && '4 - Heavy Disruption / Trapping'}
                {defenseRating === 5 && '5 - Elite Brick Wall Defense'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={defenseRating}
              onChange={(e) => setDefenseRating(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 4. ENDGAME & POST-MATCH */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            4. Endgame Cage Climb & Post-Match Assessment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Climb Status */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">CLIMB STATUS</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                {(['None', 'Park', 'Shallow Cage', 'Deep Cage'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setClimbStatus(status)}
                    className={`py-2 rounded-lg font-medium transition ${
                      climbStatus === status
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Climb Time */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">CLIMB DURATION (SECONDS)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={30}
                value={climbTimeSeconds}
                onChange={(e) => setClimbTimeSeconds(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Driver Skill & Flags */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">DRIVER SKILL (1 - 5)</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDriverSkill(star)}
                    className="p-1 text-slate-500 hover:text-amber-400 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= driverSkill ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-auto font-mono text-xs text-amber-400 font-bold">{driverSkill}/5</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={diedOrTipped}
                onChange={(e) => setDiedOrTipped(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700"
              />
              <span className="text-xs text-rose-300 font-mono font-medium">
                Robot Died on Field or Tipped Over
              </span>
            </label>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">REFEREE CARDS:</span>
              <div className="flex items-center gap-1">
                {(['None', 'Yellow', 'Red'] as const).map((card) => (
                  <button
                    key={card}
                    type="button"
                    onClick={() => setCards(card)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      cards === card
                        ? card === 'Yellow'
                          ? 'bg-amber-500 text-black'
                          : card === 'Red'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {card}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Qualitative Notes */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">QUALITATIVE SCOUT NOTES</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Swerve alignment speed, intake recovery under collision, human player feeder timing..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between">
          {submitSuccess && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Scout record successfully written to SQL Server backend!</span>
            </div>
          )}

          <div className="ml-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition active:scale-[0.99] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Writing to SQL...' : 'Submit to SQL Backend'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* RECENT MATCH SCOUTING LOG */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Recent Tournament Scout Records ({scoutingEntries.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Live synchronized with SQL server</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">MATCH</th>
                <th className="py-2.5 px-3">TEAM</th>
                <th className="py-2.5 px-3">ALLIANCE</th>
                <th className="py-2.5 px-3">SCOUT</th>
                <th className="py-2.5 px-3">AUTO CORAL</th>
                <th className="py-2.5 px-3">TELEOP CORAL</th>
                <th className="py-2.5 px-3">CLIMB</th>
                <th className="py-2.5 px-3">DRIVER</th>
                <th className="py-2.5 px-3">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {scoutingEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3 font-bold text-white">Q{entry.matchNumber}</td>
                  <td className="py-2 px-3 font-bold text-cyan-400">#{entry.teamNumber}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        entry.alliance === 'Red'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {entry.alliance}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">{entry.scoutName}</td>
                  <td className="py-2 px-3 text-amber-400">
                    {entry.autoCoralL1 + entry.autoCoralL2 + entry.autoCoralL3 + entry.autoCoralL4} pcs
                  </td>
                  <td className="py-2 px-3 text-cyan-400">
                    {entry.teleopCoralL1 + entry.teleopCoralL2 + entry.teleopCoralL3 + entry.teleopCoralL4} pcs
                  </td>
                  <td className="py-2 px-3 text-emerald-400">{entry.climbStatus}</td>
                  <td className="py-2 px-3 text-amber-300">{entry.driverSkill}/5 ★</td>
                  <td className="py-2 px-3 text-slate-400 max-w-xs truncate">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
