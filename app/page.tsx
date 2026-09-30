'use client';

import React, { useState, useEffect } from 'react';
import { AuthKeyProvider, useAuthKey } from '@/context/AuthKeyContext';
import { Sidebar } from '@/components/team-central/Sidebar';
import { TopBar } from '@/components/team-central/TopBar';
import { StudentHome } from '@/components/team-central/StudentHome';
import { BadgesAndHoursView } from '@/components/team-central/BadgesAndHoursView';
import { AssignedSubsystemsView } from '@/components/team-central/AssignedSubsystemsView';
import { AllMembersView } from '@/components/team-central/AllMembersView';
import { SafetyClearancesView } from '@/components/team-central/SafetyClearancesView';
import { LiveFloorLogView } from '@/components/team-central/LiveFloorLogView';
import { LeadOverviewView } from '@/components/team-central/LeadOverviewView';
import { SubteamView } from '@/components/team-central/SubteamView';
import { EngineeringNotesAndDemosView } from '@/components/team-central/EngineeringNotesAndDemosView';

import { FloorEntryModal } from '@/components/team-central/FloorEntryModal';
import { AdminFloorCodesPanel } from '@/components/team-central/AdminFloorCodesPanel';
import { RequestMachineModal } from '@/components/team-central/RequestMachineModal';
import { HourAppealModal } from '@/components/team-central/HourAppealModal';
import { FirstSyncModal } from '@/components/team-central/FirstSyncModal';
import { RequestTrainingModal } from '@/components/team-central/RequestTrainingModal';
import { TaskDetailModal } from '@/components/team-central/TaskDetailModal';
import { KeyAuthModal } from '@/components/KeyAuthModal';
import { KeyManagementModal } from '@/components/KeyManagementModal';

import { Navbar } from '@/components/Navbar';
import { MatchCenter } from '@/components/MatchCenter';
import { MatchScoutingForm } from '@/components/MatchScoutingForm';
import { PitScouting } from '@/components/PitScouting';
import { TeamAnalytics } from '@/components/TeamAnalytics';
import { PicklistBuilder } from '@/components/PicklistBuilder';
import { RobotTelemetry } from '@/components/RobotTelemetry';
import { SqlServerManager } from '@/components/SqlServerManager';
import { ScoutingTeamsPanel } from '@/components/ScoutingTeamsPanel';

import { INITIAL_BUILD_SCHEDULE } from '@/lib/teamCentralData';
import {
  Certification,
  SubsystemTask,
  MemberRosterItem,
  FloorCheckIn,
  EngineeringNote,
  OutreachDemo,
  MachineReservation,
  HourAppealRecord,
} from '@/types/teamCentral';
import { FrcTeam, FrcMatch, MatchScoutingEntry, PitScoutingData, PicklistTeam } from '@/types/frc';
import { LandingPage } from '@/components/LandingPage';
import { ArrowLeft, Database, Loader2, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

function DashboardContent() {
  const {
    role,
    isAdmin,
    isMember,
    isAuthenticated,
    authReady,
    openAuthModal,
    openKeyManagement,
    logout,
    activeKey,
    sqlConnectionKey,
    memberProfile,
  } = useAuthKey();

  const memberDisplayName = memberProfile?.displayName || memberProfile?.name || 'Team Member';

  // Separate home tabs per role — no shared Student/Admin toggle
  const [currentTab, setCurrentTab] = useState<string>('student-home');
  const [appMode, setAppMode] = useState<'team-central' | 'scouting'>('team-central');

  useEffect(() => {
    if (!authReady) return;
    if (role === 'admin') {
      setCurrentTab('lead-overview');
      setAppMode('team-central');
    } else if (role === 'member') {
      setCurrentTab('student-home');
      setAppMode('team-central');
      setScoutingTab((t) => (t === 'sql' || t === 'picklist' ? 'scout-match' : t));
    }
  }, [role, authReady]);

  // Team Central State — start empty; hydrate from /api/data (or seed after reset)
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [tasks, setTasks] = useState<SubsystemTask[]>([]);
  const [roster, setRoster] = useState<MemberRosterItem[]>([]);
  const [floorLog, setFloorLog] = useState<FloorCheckIn[]>([]);
  const [notes, setNotes] = useState<EngineeringNote[]>([]);
  const [demos, setDemos] = useState<OutreachDemo[]>([]);
  const [machineReservations, setMachineReservations] = useState<MachineReservation[]>([]);
  const [hourAppeals, setHourAppeals] = useState<HourAppealRecord[]>([]);

  const [loggedHours, setLoggedHours] = useState<number>(0);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);

  const [isFloorEntryOpen, setIsFloorEntryOpen] = useState(false);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isHourAppealOpen, setIsHourAppealOpen] = useState(false);
  const [isFirstSyncOpen, setIsFirstSyncOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SubsystemTask | null>(null);
  const [lastEntryTime, setLastEntryTime] = useState<string | null>(null);

  const [scoutingTab, setScoutingTab] = useState<string>('matches');
  const [teams, setTeams] = useState<FrcTeam[]>([]);
  const [matches, setMatches] = useState<FrcMatch[]>([]);
  const [scoutingEntries, setScoutingEntries] = useState<MatchScoutingEntry[]>([]);
  const [pitData, setPitData] = useState<PitScoutingData[]>([]);
  const [picklist, setPicklist] = useState<PicklistTeam[]>([]);
  const [selectedTeamNumber, setSelectedTeamNumber] = useState<number>(254);
  const [prefilledMatch, setPrefilledMatch] = useState<number>(44);
  const [prefilledTeam, setPrefilledTeam] = useState<number>(254);
  const [prefilledAlliance, setPrefilledAlliance] = useState<'Red' | 'Blue'>('Red');
  const [backendLabel, setBackendLabel] = useState<string>('SQL');

  const applyDataset = (data: {
    teams?: FrcTeam[];
    matches?: FrcMatch[];
    scoutingEntries?: MatchScoutingEntry[];
    pitData?: PitScoutingData[];
    picklist?: PicklistTeam[];
    certifications?: Certification[];
    tasks?: SubsystemTask[];
    roster?: MemberRosterItem[];
    floorLog?: FloorCheckIn[];
    notes?: EngineeringNote[];
    demos?: OutreachDemo[];
    machineReservations?: MachineReservation[];
    hourAppeals?: HourAppealRecord[];
    loggedHours?: number;
    isCheckedIn?: boolean;
    backend?: { engine?: string; message?: string };
  }) => {
    // Always set arrays (including empty) so clear-all updates the whole UI
    if (data.teams !== undefined) setTeams(data.teams);
    if (data.matches !== undefined) setMatches(data.matches);
    if (data.scoutingEntries !== undefined) setScoutingEntries(data.scoutingEntries);
    if (data.pitData !== undefined) setPitData(data.pitData);
    if (data.picklist !== undefined) setPicklist(data.picklist);

    if (data.certifications !== undefined) setCertifications(data.certifications);
    if (data.tasks !== undefined) setTasks(data.tasks);
    if (data.roster !== undefined) setRoster(data.roster);
    if (data.floorLog !== undefined) setFloorLog(data.floorLog);
    if (data.notes !== undefined) setNotes(data.notes);
    if (data.demos !== undefined) setDemos(data.demos);
    if (data.machineReservations !== undefined) setMachineReservations(data.machineReservations);
    if (data.hourAppeals !== undefined) setHourAppeals(data.hourAppeals);
    if (data.loggedHours !== undefined) setLoggedHours(data.loggedHours);
    if (data.isCheckedIn !== undefined) setIsCheckedIn(data.isCheckedIn);

    if (data.backend?.engine) {
      const eng = data.backend.engine;
      setBackendLabel(
        eng === 'postgres'
          ? 'Postgres'
          : eng === 'supabase'
            ? 'Supabase'
            : eng === 'sqlite'
              ? 'SQLite'
              : String(eng)
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          applyDataset(data);
        }
      } catch (e) {
        console.warn('Using local client state for FRC dataset', e);
      }
    };
    fetchData();
  }, []);

  const handleToggleStudentCheckIn = (studentId: string) => {
    // Admin-only roster flag toggle (no PIN/NFC). Prefer entry-code log for real time tracking.
    setRoster((currentRoster) =>
      currentRoster.map((m) => {
        if (m.id === studentId) {
          return { ...m, isCheckedIn: !m.isCheckedIn };
        }
        return m;
      })
    );
  };

  const handleRedeemFloorCode = async (code: string) => {
    const name = memberDisplayName;
    const res = await fetch('/api/floor', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        action: 'redeem',
        code,
        memberName: name,
        memberId: memberProfile?.id,
        accessKey: activeKey,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success) {
      return { success: false, message: body.message || body.error || 'Invalid entry code' };
    }
    if (body.dataset) applyDataset(body.dataset);
    else if (body.floorLog) setFloorLog(body.floorLog);
    else {
      const refreshed = await fetch('/api/data', { cache: 'no-store' });
      if (refreshed.ok) applyDataset(await refreshed.json());
    }
    const t = body.entry?.checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastEntryTime(t);
    setIsCheckedIn(true);
    return {
      success: true,
      message: body.message || `Enter time logged at ${t}`,
      checkInTime: t,
    };
  };

  const handleHourAppealSubmitted = (appeal: HourAppealRecord) => {
    setHourAppeals((prev) => [appeal, ...prev]);
    setLoggedHours((prev) => Math.round((prev + appeal.hoursRequested) * 10) / 10);
  };

  const handleApproveAppeal = (appealId: string) => {
    if (!isAdmin) return;
    setHourAppeals((prev) =>
      prev.map((a) => (a.id === appealId ? { ...a, status: 'APPROVED' } : a))
    );
  };

  const handleTrainingApproved = () => {
    setCertifications((prev) =>
      prev.map((c) =>
        c.id === 'cert-8'
          ? { ...c, status: 'CERT', slotInfo: undefined, expDate: 'Jan 2026' }
          : c
      )
    );
  };

  const handleMachineReserved = (details: {
    machine: string;
    timeSlot: string;
    material: string;
    mentor: string;
    notes: string;
  }) => {
    const newReservation: MachineReservation = {
      id: `res-${Date.now()}`,
      machine: details.machine,
      studentName: 'Maya Patel',
      studentId: '#5419-STU-0042',
      timeSlot: details.timeSlot,
      material: details.material || '6061-T6 Aluminum',
      notes: details.notes || 'Precision machining slot',
      status: 'ACTIVE',
      mentor: details.mentor || 'Bob K.',
    };
    setMachineReservations((prev) => [newReservation, ...prev]);
  };

  const handleAddNote = (newNote: EngineeringNote) => setNotes((prev) => [newNote, ...prev]);
  const handleAddDemo = (newDemo: OutreachDemo) => setDemos((prev) => [newDemo, ...prev]);

  const handleToggleDemoChecklistItem = (demoId: string, checklistId: string) => {
    setDemos((prev) =>
      prev.map((d) => {
        if (d.id === demoId) {
          const updatedChecklist = d.checklist.map((c) =>
            c.id === checklistId ? { ...c, completed: !c.completed } : c
          );
          const allDone = updatedChecklist.every((c) => c.completed);
          return {
            ...d,
            checklist: updatedChecklist,
            status: allDone ? 'COMPLETED' : d.status === 'COMPLETED' ? 'UPCOMING' : d.status,
          };
        }
        return d;
      })
    );
  };

  const handleAddTask = (newTask: SubsystemTask) => {
    if (!isAdmin && !isMember) return;
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: SubsystemTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const handleAddMember = (newMember: MemberRosterItem) => {
    if (!isAdmin) return;
    setRoster((prev) => [...prev, newMember]);
  };

  const handleSelectScoutMatch = (
    matchNumber: number,
    teamNumber: number,
    alliance: 'Red' | 'Blue'
  ) => {
    setPrefilledMatch(matchNumber);
    setPrefilledTeam(teamNumber);
    setPrefilledAlliance(alliance);
    setScoutingTab('scout-match');
  };

  const handleSelectTeam = (teamNumber: number) => {
    setSelectedTeamNumber(teamNumber);
    setScoutingTab('analytics');
  };

  const authHeaders = (): HeadersInit => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (activeKey) h['x-frc-access-key'] = activeKey;
    return h;
  };

  const handleSaveScoutingEntry = async (entry: Partial<MatchScoutingEntry>) => {
    const fullEntry: MatchScoutingEntry = {
      id: entry.id || `entry-${Date.now()}`,
      matchNumber: entry.matchNumber || prefilledMatch,
      teamNumber: entry.teamNumber || prefilledTeam,
      alliance: entry.alliance || prefilledAlliance,
      driverStation: entry.driverStation || 1,
      scoutName: entry.scoutName || memberDisplayName || 'Scout Member',
      timestamp: entry.timestamp || new Date().toISOString(),
      autoLeave: entry.autoLeave || false,
      autoCoralL1: entry.autoCoralL1 || 0,
      autoCoralL2: entry.autoCoralL2 || 0,
      autoCoralL3: entry.autoCoralL3 || 0,
      autoCoralL4: entry.autoCoralL4 || 0,
      autoAlgaeNet: entry.autoAlgaeNet || 0,
      autoAlgaeProcessor: entry.autoAlgaeProcessor || 0,
      autoMissed: entry.autoMissed || 0,
      teleopCoralL1: entry.teleopCoralL1 || 0,
      teleopCoralL2: entry.teleopCoralL2 || 0,
      teleopCoralL3: entry.teleopCoralL3 || 0,
      teleopCoralL4: entry.teleopCoralL4 || 0,
      teleopAlgaeNet: entry.teleopAlgaeNet || 0,
      teleopAlgaeProcessor: entry.teleopAlgaeProcessor || 0,
      cycles: entry.cycles || 0,
      climbStatus: entry.climbStatus || 'None',
      climbTimeSeconds: entry.climbTimeSeconds || 0,
      driverSkill: entry.driverSkill || 3,
      defenseRating: entry.defenseRating || 3,
      diedOrTipped: entry.diedOrTipped || false,
      cards: entry.cards || 'None',
      notes: entry.notes || '',
    };
    setScoutingEntries((prev) => {
      const without = prev.filter((e) => e.id !== fullEntry.id);
      return [fullEntry, ...without];
    });
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'scoutingEntry', data: fullEntry, accessKey: activeKey }),
      });
      if (res.ok) {
        const refreshed = await fetch('/api/data', { cache: 'no-store' });
        if (refreshed.ok) applyDataset(await refreshed.json());
      }
    } catch (e) {
      console.warn('Scouting entry saved in local state');
    }
  };

  const handleSavePitData = async (data: PitScoutingData) => {
    setPitData((prev) => {
      const idx = prev.findIndex((p) => p.teamNumber === data.teamNumber);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = data;
        return next;
      }
      return [...prev, data];
    });
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'pitData', data, accessKey: activeKey }),
      });
      if (res.ok) {
        const refreshed = await fetch('/api/data', { cache: 'no-store' });
        if (refreshed.ok) applyDataset(await refreshed.json());
      }
    } catch (e) {
      console.warn('Pit data saved in local state');
    }
  };

  const handleSavePicklist = async (newPicklist: PicklistTeam[]) => {
    if (!isAdmin) return;
    setPicklist(newPicklist);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'picklist', data: newPicklist, accessKey: activeKey }),
      });
    } catch (e) {
      console.warn('Picklist saved in local state');
    }
  };

  const handleAddScoutingTeam = async (input: {
    number: number;
    name: string;
    organization?: string;
    location?: string;
  }) => {
    if (!isAdmin && !isMember) throw new Error('Sign in with a member or admin key to add teams.');
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        type: 'addTeam',
        data: input,
        accessKey: activeKey,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Failed to add team');
    if (body.dataset) applyDataset(body.dataset);
    else {
      const refreshed = await fetch('/api/data', { cache: 'no-store' });
      if (refreshed.ok) applyDataset(await refreshed.json());
    }
    setSelectedTeamNumber(input.number);
    setPrefilledTeam(input.number);
  };

  const handleDeleteScoutingTeam = async (teamNumber: number) => {
    if (!isAdmin && !isMember) throw new Error('Sign in with a member or admin key to delete teams.');
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        type: 'deleteTeam',
        data: { number: teamNumber },
        accessKey: activeKey,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Failed to delete team');
    if (body.dataset) applyDataset(body.dataset);
    else {
      const refreshed = await fetch('/api/data', { cache: 'no-store' });
      if (refreshed.ok) applyDataset(await refreshed.json());
    }
    if (selectedTeamNumber === teamNumber) {
      setSelectedTeamNumber(0);
    }
  };

  const handleSqlDatasetChange = (dataset: Record<string, any>) => {
    applyDataset(dataset as any);
  };

  const shopOccupancy = roster.filter((r) => r.isCheckedIn).length;

  // Loading auth
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A10] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading Vortex Command…</p>
        </div>
      </div>
    );
  }

  // Public landing — no forced login modal
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onEnter={() => openAuthModal()} />
        <KeyAuthModal />
      </>
    );
  }

  const openScouting = () => {
    setAppMode('scouting');
    setScoutingTab(isAdmin ? 'matches' : 'scout-match');
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      {appMode === 'scouting' ? (
        <div className="flex-1 flex flex-col">
          <header className="border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAppMode('team-central');
                    setCurrentTab(isAdmin ? 'lead-overview' : 'student-home');
                  }}
                  className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Back to {isAdmin ? 'Admin Console' : 'Member Portal'}
                  </span>
                </button>
                <div className="h-4 w-px bg-slate-800" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-black text-xs shadow-lg shadow-cyan-500/10">
                    5419
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide leading-none">
                      FRC MATCH & PIT SCOUTING CONSOLE
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400">
                      {isAdmin ? 'ADMIN' : memberDisplayName} · {backendLabel} Backend
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden md:flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <Database className="w-3 h-3 text-cyan-400" />
                  {backendLabel} · {teams.length} teams · {scoutingEntries.length} scouts
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
                    isAdmin
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'MEMBER'}
                </span>
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-cyan-500/30 transition cursor-pointer"
                >
                  Switch Key
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-500/40 text-xs font-mono text-slate-400 hover:text-rose-300 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="border-t border-slate-900">
              <Navbar
                activeTab={scoutingTab}
                setActiveTab={(tab) => {
                  // Members cannot open SQL or picklist editor
                  if (!isAdmin && (tab === 'sql' || tab === 'picklist')) return;
                  setScoutingTab(tab);
                }}
                sqlStatus={
                  sqlConnectionKey ||
                  backendLabel === 'Supabase' ||
                  backendLabel === 'Postgres'
                    ? 'connected'
                    : 'local_fallback'
                }
              />
            </div>
          </header>

          <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
            {(isAdmin || isMember) &&
              (scoutingTab === 'matches' ||
                scoutingTab === 'scout-match' ||
                scoutingTab === 'scout-pit' ||
                scoutingTab === 'analytics') && (
                <ScoutingTeamsPanel
                  teams={teams}
                  onAddTeam={handleAddScoutingTeam}
                  onDeleteTeam={handleDeleteScoutingTeam}
                  canManage={isAdmin || isMember}
                  compact={scoutingTab !== 'matches' && scoutingTab !== 'scout-match'}
                />
              )}

            <AnimatePresence mode="wait">
              <motion.div
                key={scoutingTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {scoutingTab === 'matches' && (
                  <MatchCenter
                    matches={matches}
                    teams={teams}
                    onSelectScoutMatch={handleSelectScoutMatch}
                    onSelectTeam={handleSelectTeam}
                  />
                )}

                {scoutingTab === 'scout-match' && (
                  <MatchScoutingForm
                    teams={teams}
                    scoutingEntries={scoutingEntries}
                    prefilledMatch={prefilledMatch}
                    prefilledTeam={prefilledTeam}
                    prefilledAlliance={prefilledAlliance}
                    onSubmitEntry={handleSaveScoutingEntry}
                  />
                )}

                {scoutingTab === 'scout-pit' && (
                  <PitScouting
                    teams={teams}
                    pitData={pitData}
                    onSavePitData={handleSavePitData}
                    onSelectTeam={handleSelectTeam}
                  />
                )}

                {scoutingTab === 'analytics' && (
                  <TeamAnalytics
                    teams={teams}
                    scoutingEntries={scoutingEntries}
                    matches={matches}
                    selectedTeamNumber={selectedTeamNumber}
                    onSelectTeamNumber={setSelectedTeamNumber}
                  />
                )}

                {scoutingTab === 'picklist' && isAdmin && (
                  <PicklistBuilder
                    teams={teams}
                    picklist={picklist}
                    onSavePicklist={handleSavePicklist}
                    onSelectTeam={handleSelectTeam}
                  />
                )}

                {scoutingTab === 'telemetry' && <RobotTelemetry />}

                {scoutingTab === 'sql' && isAdmin && (
                  <SqlServerManager onDatasetChange={handleSqlDatasetChange} />
                )}

                {scoutingTab === 'sql' && !isAdmin && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center">
                    <Lock className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                    <h3 className="text-white font-bold">Administrator Only</h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      SQL Server management and clear-data require the Administrator key.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAuthModal()}
                      className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                    >
                      Switch to Admin Key
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      ) : (
        <div className="flex-1 flex min-h-screen">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenScoutingConsole={openScouting}
            role={role === 'admin' || role === 'member' ? role : 'member'}
          />

          <div className="flex-1 flex flex-col min-w-0 bg-[#070A10]">
            <TopBar
              shopOccupancy={shopOccupancy}
              isCheckedIn={isCheckedIn}
              onOpenFloorEntry={() => setIsFloorEntryOpen(true)}
              lastEntryTime={lastEntryTime}
              studentName={isAdmin ? 'Administrator' : memberDisplayName}
              roleTitle={
                isAdmin
                  ? 'Administrator · Full Access'
                  : `${memberDisplayName} · Member Portal`
              }
              onOpenRoleSwitcher={() => openAuthModal()}
              isAdmin={isAdmin}
              onLogout={logout}
              onManageKeys={isAdmin ? openKeyManagement : undefined}
              showFloorControls={!isAdmin}
            />

            <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1600px] w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Member-only home */}
                  {currentTab === 'student-home' && !isAdmin && (
                    <StudentHome
                      certifications={certifications}
                      schedule={roster.length || tasks.length ? INITIAL_BUILD_SCHEDULE : []}
                      tasks={tasks}
                      onOpenFloorEntry={() => setIsFloorEntryOpen(true)}
                      onOpenMachineRequest={() => setIsMachineModalOpen(true)}
                      onOpenHourAppeal={() => setIsHourAppealOpen(true)}
                      onOpenFirstSync={() => setIsFirstSyncOpen(true)}
                      onRequestTraining={() => setIsTrainingModalOpen(true)}
                      onSelectTask={(task) => setSelectedTask(task)}
                      loggedHours={loggedHours}
                      isCheckedIn={isCheckedIn}
                      memberName={memberDisplayName}
                      lastEntryTime={lastEntryTime}
                    />
                  )}

                  {currentTab === 'badges-hours' && !isAdmin && (
                    <BadgesAndHoursView
                      onOpenHourAppeal={() => setIsHourAppealOpen(true)}
                      loggedHours={loggedHours}
                      hourAppeals={hourAppeals}
                      onApproveAppeal={handleApproveAppeal}
                    />
                  )}

                  {currentTab === 'assigned-subsystems' && !isAdmin && (
                    <AssignedSubsystemsView
                      tasks={tasks}
                      onSelectTask={(task) => setSelectedTask(task)}
                    />
                  )}

                  {currentTab === 'notes-demos' && !isAdmin && (
                    <EngineeringNotesAndDemosView
                      notes={notes}
                      demos={demos}
                      onAddNote={handleAddNote}
                      onAddDemo={handleAddDemo}
                      onToggleDemoChecklistItem={handleToggleDemoChecklistItem}
                    />
                  )}

                  {/* Admin-only */}
                  {currentTab === 'lead-overview' && isAdmin && (
                    <div className="space-y-5">
                      <AdminFloorCodesPanel accessKey={activeKey} />
                      <LeadOverviewView roster={roster} onOpenKiosk={() => setCurrentTab('live-floor-log')} />
                    </div>
                  )}

                  {currentTab === 'all-members' && isAdmin && (
                    <AllMembersView
                      roster={roster}
                      onToggleStudentCheckIn={handleToggleStudentCheckIn}
                      onAddMember={handleAddMember}
                    />
                  )}

                  {currentTab === 'safety-clearances' && (
                    <SafetyClearancesView
                      certifications={certifications}
                      onRequestTraining={() => setIsTrainingModalOpen(true)}
                    />
                  )}

                  {currentTab === 'live-floor-log' && isAdmin && (
                    <div className="space-y-5">
                      <AdminFloorCodesPanel accessKey={activeKey} />
                      <LiveFloorLogView
                        floorLog={floorLog}
                        machineReservations={machineReservations}
                        onOpenKiosk={() => undefined}
                        onOpenMachineRequest={() => setIsMachineModalOpen(true)}
                      />
                    </div>
                  )}

                  {currentTab === 'kiosk-eligibility' && isAdmin && (
                    <div className="space-y-4">
                      <AdminFloorCodesPanel accessKey={activeKey} />
                      <AllMembersView
                        roster={roster}
                        onToggleStudentCheckIn={handleToggleStudentCheckIn}
                        onAddMember={handleAddMember}
                      />
                    </div>
                  )}

                  {currentTab.startsWith('subteam-') && (
                    <SubteamView
                      subteamId={currentTab}
                      tasks={tasks}
                      roster={roster}
                      notes={notes}
                      demos={demos}
                      onSelectTask={(task) => setSelectedTask(task)}
                      onAddTask={handleAddTask}
                      onAddNote={handleAddNote}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}

      <FloorEntryModal
        isOpen={isFloorEntryOpen}
        onClose={() => setIsFloorEntryOpen(false)}
        memberName={memberDisplayName}
        onRedeem={handleRedeemFloorCode}
      />

      <RequestMachineModal
        isOpen={isMachineModalOpen}
        onClose={() => setIsMachineModalOpen(false)}
        onSuccess={handleMachineReserved}
      />

      <HourAppealModal
        isOpen={isHourAppealOpen}
        onClose={() => setIsHourAppealOpen(false)}
        onSuccess={handleHourAppealSubmitted}
      />

      <FirstSyncModal isOpen={isFirstSyncOpen} onClose={() => setIsFirstSyncOpen(false)} />

      <RequestTrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        onSuccess={handleTrainingApproved}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
      />

      <KeyAuthModal />
      <KeyManagementModal />
    </div>
  );
}

class ClientErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Client error boundary:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#070A10] p-6 text-center">
          <div className="max-w-md space-y-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8">
            <h1 className="text-lg font-bold text-white">Something went wrong</h1>
            <p className="text-xs font-mono text-rose-200/90 break-words">{this.state.error.message}</p>
            <button
              type="button"
              className="mt-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white"
              onClick={() => {
                try {
                  localStorage.clear();
                } catch {
                  /* ignore */
                }
                window.location.reload();
              }}
            >
              Clear session & reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Page() {
  return (
    <AuthKeyProvider>
      <ClientErrorBoundary>
        <DashboardContent />
      </ClientErrorBoundary>
    </AuthKeyProvider>
  );
}
