/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { PitScoutingData, FrcTeam } from '@/types/frc';
import { useAuthKey } from '@/context/AuthKeyContext';
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Camera,
  Battery,
  Layers,
  Eye,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  Scale,
  Cpu,
} from 'lucide-react';

interface PitScoutingProps {
  teams: FrcTeam[];
  pitData: PitScoutingData[];
  onSavePitData: (data: PitScoutingData) => Promise<void>;
  onSelectTeam: (teamNumber: number) => void;
}

export const PitScouting: React.FC<PitScoutingProps> = ({
  teams,
  pitData,
  onSavePitData,
  onSelectTeam,
}) => {
  const { isAdmin } = useAuthKey();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamNum, setSelectedTeamNum] = useState<number | null>(teams[0]?.number || 254);
  const [isEditing, setIsEditing] = useState(false);

  // Filtered teams list
  const filteredTeams = teams.filter(
    (t) =>
      t.number.toString().includes(searchTerm) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTeam = teams.find((t) => t.number === selectedTeamNum) || teams[0];
  const selectedPit = pitData.find((p) => p.teamNumber === selectedTeamNum) || {
    teamNumber: selectedTeam?.number || 254,
    scoutName: 'Pit Inspector',
    drivetrain: selectedTeam?.drivetrain || 'Swerve SDS Mk4i',
    dimensions: '28 x 28 x 38 in',
    weightLbs: 120.0,
    motorsDrive: '4x Kraken X60',
    motorsSteer: '4x Falcon 500',
    intakeType: 'Under-bumper active motorized intake roller',
    scoringCapabilities: ['L1 Coral', 'L2 Coral', 'L3 Coral', 'L4 Coral', 'Algae Processor'],
    visionSystem: 'Dual Limelight 3G (AprilTags Megatag2)',
    preferredAutonomous: '4-piece autonomous coral routine',
    climbCapability: 'Deep Cage latch',
    photoUrl: selectedTeam?.imageUrl || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    pitNotes: 'Pit wiring clean and inspected. Pneumatics holding pressure.',
    inspectionPassed: true,
    batteryVoltage: 12.8,
    lastChecked: '2026-09-23 14:00',
  };

  const [formState, setFormState] = useState<PitScoutingData>(selectedPit);

  const handleSelect = (num: number) => {
    setSelectedTeamNum(num);
    const existing = pitData.find((p) => p.teamNumber === num);
    const tm = teams.find((t) => t.number === num);
    if (existing) {
      setFormState(existing);
    } else {
      setFormState({
        teamNumber: num,
        scoutName: 'Lead Pit Scout',
        drivetrain: tm?.drivetrain || 'Swerve SDS Mk4i',
        dimensions: '28 x 28 x 38 in',
        weightLbs: 119.0,
        motorsDrive: '4x Kraken X60',
        motorsSteer: '4x Falcon 500',
        intakeType: 'Motorized roller intake',
        scoringCapabilities: ['L1-L4 Coral', 'Algae Processor'],
        visionSystem: 'Limelight 3G + AprilTags',
        preferredAutonomous: 'Center auto routine',
        climbCapability: 'Deep Cage latch',
        photoUrl: tm?.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        pitNotes: 'Inspected and competition ready.',
        inspectionPassed: true,
        batteryVoltage: 12.8,
        lastChecked: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    }
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSavePitData(formState);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-cyan-400" />
            Pit Scouting & Robot Specifications
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Technical inspection records, drivetrain hardware, vision systems, and robot photos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team # or name..."
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Specs'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Teams List Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 max-h-[750px] overflow-y-auto scrollbar-thin">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Registered Teams ({filteredTeams.length})
          </div>

          {filteredTeams.map((team) => {
            const isSelected = team.number === selectedTeamNum;
            const pit = pitData.find((p) => p.teamNumber === team.number);

            return (
              <div
                key={team.number}
                onClick={() => handleSelect(team.number)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500/70 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0 relative">
                    <img
                      src={team.imageUrl}
                      alt={team.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-white text-sm">#{team.number}</span>
                      <span className="text-xs font-semibold text-slate-300 truncate max-w-[130px]">
                        {team.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-cyan-400">EPA: {team.epa}</span>
                      <span>•</span>
                      <span className="truncate max-w-[110px]">{team.drivetrain}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {pit?.inspectionPassed ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      PASS
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                      PENDING
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-500">Rank #{team.rank}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Team Pit Details */}
        <div className="lg:col-span-8 space-y-6">
          {isEditing ? (
            /* EDIT FORM */
            <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white font-mono">
                  Editing Pit Specs for Team #{selectedTeam.number} ({selectedTeam.name})
                </h3>
                <span className="text-xs text-slate-400 font-mono">Will commit to SQL server</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">DRIVETRAIN ARCHITECTURE</label>
                  <input
                    type="text"
                    value={formState.drivetrain}
                    onChange={(e) => setFormState({ ...formState, drivetrain: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">CHASSIS DIMENSIONS</label>
                  <input
                    type="text"
                    value={formState.dimensions}
                    onChange={(e) => setFormState({ ...formState, dimensions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">WEIGHT (LBS - MAX 125 LBS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formState.weightLbs}
                    onChange={(e) => setFormState({ ...formState, weightLbs: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">DRIVE MOTORS</label>
                  <input
                    type="text"
                    value={formState.motorsDrive}
                    onChange={(e) => setFormState({ ...formState, motorsDrive: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">INTAKE MECHANISM</label>
                  <input
                    type="text"
                    value={formState.intakeType}
                    onChange={(e) => setFormState({ ...formState, intakeType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">VISION COPROCESSOR & CAMERAS</label>
                  <input
                    type="text"
                    value={formState.visionSystem}
                    onChange={(e) => setFormState({ ...formState, visionSystem: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">PREFERRED AUTONOMOUS</label>
                  <input
                    type="text"
                    value={formState.preferredAutonomous}
                    onChange={(e) => setFormState({ ...formState, preferredAutonomous: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">HOTLINKED ROBOT PHOTO URL</label>
                  <input
                    type="url"
                    value={formState.photoUrl}
                    onChange={(e) => setFormState({ ...formState, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">PIT TECHNICAL NOTES</label>
                <textarea
                  value={formState.pitNotes}
                  onChange={(e) => setFormState({ ...formState, pitNotes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-emerald-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.inspectionPassed}
                    onChange={(e) => setFormState({ ...formState, inspectionPassed: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700"
                  />
                  <span>Official Pit Inspection Passed</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
                  >
                    Save Specifications
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* VIEW MODE */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Top Banner with Robot Photo */}
              <div className="relative h-64 w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                <img
                  src={formState.photoUrl}
                  alt={`Team ${selectedTeam.number} Robot`}
                  className="w-full h-full object-cover object-center opacity-85 hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black font-mono text-white">#{selectedTeam.number}</span>
                      <span className="text-xl font-bold text-cyan-300">{selectedTeam.name}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      {selectedTeam.organization} • {selectedTeam.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTeam.cadUrl && (
                      <a
                        href={selectedTeam.cadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 text-xs font-mono border border-cyan-500/30 backdrop-blur-sm transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Onshape CAD</span>
                      </a>
                    )}
                    <button
                      onClick={() => onSelectTeam(selectedTeam.number)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                    >
                      View Deep Analytics &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">CHASSIS WEIGHT</span>
                    <span className="text-lg font-black font-mono text-white">{formState.weightLbs} lbs</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">Under 125 lbs limit</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">FRAME SIZE</span>
                    <span className="text-lg font-black font-mono text-cyan-300">{formState.dimensions}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Compact footprint</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">BATTERY VOLTAGE</span>
                    <span className="text-lg font-black font-mono text-amber-400">{formState.batteryVoltage} V</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">Freshly Charged</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">INSPECTION STATUS</span>
                    <span className="text-lg font-black font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      PASSED
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">Inspected at {formState.lastChecked}</span>
                  </div>
                </div>

                {/* Subsystem Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="text-cyan-400 font-bold flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      DRIVETRAIN & MOTORS
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Architecture:</span>
                      <span className="text-white font-semibold">{formState.drivetrain}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Drive Motors:</span>
                      <span className="text-white">{formState.motorsDrive}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Steering Motors:</span>
                      <span className="text-white">{formState.motorsSteer}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="text-amber-400 font-bold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      VISION & MECHANISMS
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Vision System:</span>
                      <span className="text-white">{formState.visionSystem}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Intake Type:</span>
                      <span className="text-white">{formState.intakeType}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Endgame Climb:</span>
                      <span className="text-emerald-400">{formState.climbCapability}</span>
                    </div>
                  </div>
                </div>

                {/* Autonomous Routine & Qualitative Notes */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 block">
                    PREFERRED AUTONOMOUS ROUTINE & SCOUT NOTES
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    <span className="text-cyan-300 font-semibold">Auto:</span> {formState.preferredAutonomous}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    <span className="text-amber-300 font-semibold">Pit Observations:</span> {formState.pitNotes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
