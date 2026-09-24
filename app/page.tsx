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

// Modals
import { NfcScanModal } from '@/components/team-central/NfcScanModal';
import { RequestMachineModal } from '@/components/team-central/RequestMachineModal';
import { HourAppealModal } from '@/components/team-central/HourAppealModal';
import { FirstSyncModal } from '@/components/team-central/FirstSyncModal';
import { RequestTrainingModal } from '@/components/team-central/RequestTrainingModal';
import { TaskDetailModal } from '@/components/team-central/TaskDetailModal';
import { KioskModal } from '@/components/team-central/KioskModal';
import { KeyAuthModal } from '@/components/KeyAuthModal';
import { KeyManagementModal } from '@/components/KeyManagementModal';

// Tournament Scouting & SQL Components
import { Navbar } from '@/components/Navbar';
import { MatchCenter } from '@/components/MatchCenter';
import { MatchScoutingForm } from '@/components/MatchScoutingForm';
import { PitScouting } from '@/components/PitScouting';
import { TeamAnalytics } from '@/components/TeamAnalytics';
import { PicklistBuilder } from '@/components/PicklistBuilder';
import { RobotTelemetry } from '@/components/RobotTelemetry';
import { SqlServerManager } from '@/components/SqlServerManager';

// Initial Data & Types
import {
  INITIAL_CERTIFICATIONS,
  INITIAL_BUILD_SCHEDULE,
  INITIAL_TASKS,
  INITIAL_ROSTER,
  INITIAL_FLOOR_LOG,
  INITIAL_ENGINEERING_NOTES,
  INITIAL_OUTREACH_DEMOS,
  INITIAL_MACHINE_RESERVATIONS,
  INITIAL_HOUR_APPEALS,
} from '@/lib/teamCentralData';
import {
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_SCOUTING_ENTRIES,
  INITIAL_PIT_DATA,
  INITIAL_PICKLIST,
} from '@/lib/defaultData';
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
import { ArrowLeft, Database, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

function DashboardContent() {
  const { role, activeKey, isAdmin, isMember, openAuthModal, sqlConnectionKey } = useAuthKey();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('student-home');
  const [portalMode, setPortalMode] = useState<'student' | 'admin'>('student');

  // Team Central State
  const [certifications, setCertifications] = useState<Certification[]>(INITIAL_CERTIFICATIONS);
  const [tasks, setTasks] = useState<SubsystemTask[]>(INITIAL_TASKS);
  const [roster, setRoster] = useState<MemberRosterItem[]>(INITIAL_ROSTER);
  const [floorLog, setFloorLog] = useState<FloorCheckIn[]>(INITIAL_FLOOR_LOG);
  const [notes, setNotes] = useState<EngineeringNote[]>(INITIAL_ENGINEERING_NOTES);
  const [demos, setDemos] = useState<OutreachDemo[]>(INITIAL_OUTREACH_DEMOS);
  const [machineReservations, setMachineReservations] = useState<MachineReservation[]>(INITIAL_MACHINE_RESERVATIONS);
  const [hourAppeals, setHourAppeals] = useState<HourAppealRecord[]>(INITIAL_HOUR_APPEALS);

  const [loggedHours, setLoggedHours] = useState<number>(64.5);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(true);

  // Modals state
  const [isNfcOpen, setIsNfcOpen] = useState(false);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isHourAppealOpen, setIsHourAppealOpen] = useState(false);
  const [isFirstSyncOpen, setIsFirstSyncOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SubsystemTask | null>(null);

  // Tournament Scouting State
  const [scoutingTab, setScoutingTab] = useState<string>('matches');
  const [teams, setTeams] = useState<FrcTeam[]>(INITIAL_TEAMS);
  const [matches, setMatches] = useState<FrcMatch[]>(INITIAL_MATCHES);
  const [scoutingEntries, setScoutingEntries] = useState<MatchScoutingEntry[]>(INITIAL_SCOUTING_ENTRIES);
  const [pitData, setPitData] = useState<PitScoutingData[]>(INITIAL_PIT_DATA);
  const [picklist, setPicklist] = useState<PicklistTeam[]>(INITIAL_PICKLIST);
  const [selectedTeamNumber, setSelectedTeamNumber] = useState<number>(254);
  const [prefilledMatch, setPrefilledMatch] = useState<number>(44);
  const [prefilledTeam, setPrefilledTeam] = useState<number>(254);
  const [prefilledAlliance, setPrefilledAlliance] = useState<'Red' | 'Blue'>('Red');

  // Load backend API data if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.teams) setTeams(data.teams);
          if (data.matches) setMatches(data.matches);
          if (data.scoutingEntries) setScoutingEntries(data.scoutingEntries);
          if (data.pitData) setPitData(data.pitData);
          if (data.picklist) setPicklist(data.picklist);
        }
      } catch (e) {
        console.warn('Using local client state for FRC dataset', e);
      }
    };
    fetchData();
  }, []);

  // Floor Check-in Handlers
  const handleToggleMyCheckIn = () => {
    setIsCheckedIn((prev) => {
      const next = !prev;
      setRoster((currentRoster) =>
        currentRoster.map((m) =>
          m.id === 'm-1' ? { ...m, isCheckedIn: next } : m
        )
      );
      if (!next) {
        setLoggedHours((h) => Math.round((h + 0.5) * 10) / 10);
      }
      return next;
    });
  };

  const handleToggleStudentCheckIn = (studentId: string) => {
    setRoster((currentRoster) =>
      currentRoster.map((m) => {
        if (m.id === studentId) {
          const nextState = !m.isCheckedIn;
          if (m.id === 'm-1') setIsCheckedIn(nextState);
          return { ...m, isCheckedIn: nextState };
        }
        return m;
      })
    );
  };

  const handleHourAppealSubmitted = (appeal: HourAppealRecord) => {
    setHourAppeals((prev) => [appeal, ...prev]);
    setLoggedHours((prev) => Math.round((prev + appeal.hoursRequested) * 10) / 10);
  };

  const handleApproveAppeal = (appealId: string) => {
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

  // Machine Reservation Handler
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

  // Engineering Notes & Demos Handlers
  const handleAddNote = (newNote: EngineeringNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleAddDemo = (newDemo: OutreachDemo) => {
    setDemos((prev) => [newDemo, ...prev]);
  };

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

  // Task Handlers
  const handleAddTask = (newTask: SubsystemTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: SubsystemTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  // Member Handlers
  const handleAddMember = (newMember: MemberRosterItem) => {
    setRoster((prev) => [...prev, newMember]);
  };

  // Tournament Scouting Handlers
  const handleSelectScoutMatch = (matchNumber: number, teamNumber: number, alliance: 'Red' | 'Blue') => {
    setPrefilledMatch(matchNumber);
    setPrefilledTeam(teamNumber);
    setPrefilledAlliance(alliance);
    setScoutingTab('scout-match');
  };

  const handleSelectTeam = (teamNumber: number) => {
    setSelectedTeamNumber(teamNumber);
    setScoutingTab('analytics');
  };

  const handleSaveScoutingEntry = async (entry: Partial<MatchScoutingEntry>) => {
    const fullEntry: MatchScoutingEntry = {
      id: entry.id || `entry-${Date.now()}`,
      matchNumber: entry.matchNumber || prefilledMatch,
      teamNumber: entry.teamNumber || prefilledTeam,
      alliance: entry.alliance || prefilledAlliance,
      driverStation: entry.driverStation || 1,
      scoutName: entry.scoutName || 'Maya Patel',
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
    setScoutingEntries((prev) => [fullEntry, ...prev]);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'scoutingEntry', data: fullEntry }),
      });
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
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pitData', data }),
      });
    } catch (e) {
      console.warn('Pit data saved in local state');
    }
  };

  const handleSavePicklist = async (newPicklist: PicklistTeam[]) => {
    setPicklist(newPicklist);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'picklist', data: newPicklist }),
      });
    } catch (e) {
      console.warn('Picklist saved in local state');
    }
  };

  // Occupancy count
  const shopOccupancy = roster.filter((r) => r.isCheckedIn).length;

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col font-sans">
      {/* If currentTab === 'scouting-console', render Tournament Scouting Sub-App */}
      {currentTab === 'scouting-console' ? (
        <div className="flex-1 flex flex-col">
          {/* Scouting Top Navigation Bar */}
          <header className="border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur sticky top-0 z-40">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab('student-home')}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Team Central</span>
                </button>
                <div className="h-4 w-px bg-slate-800" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                    5419
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide leading-none">
                      FRC MATCH & PIT SCOUTING CONSOLE
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400">
                      Reefscape 2025 • SQL Central Storage
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden md:flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                  <Database className="w-3 h-3 text-cyan-400" />
                  {sqlConnectionKey ? 'SQL DB CONNECTED' : 'SQL DB READY'}
                </span>
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {role.toUpperCase()} MODE
                </button>
              </div>
            </div>

            {/* Scouting Navigation Bar */}
            <div className="border-t border-slate-900">
              <Navbar
                activeTab={scoutingTab}
                setActiveTab={setScoutingTab}
                sqlStatus={sqlConnectionKey ? 'connected' : 'local_fallback'}
              />
            </div>
          </header>

          {/* Scouting Main View Container */}
          <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
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

                {scoutingTab === 'picklist' && (
                  <PicklistBuilder
                    teams={teams}
                    picklist={picklist}
                    onSavePicklist={handleSavePicklist}
                    onSelectTeam={handleSelectTeam}
                  />
                )}

                {scoutingTab === 'telemetry' && <RobotTelemetry />}
                {scoutingTab === 'sql' && <SqlServerManager />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      ) : (
        /* Team Central Layout: Left Sidebar + Top Bar + Responsive Content */
        <div className="flex-1 flex min-h-screen">
          {/* Left Navigation Sidebar */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            portalMode={portalMode}
            setPortalMode={setPortalMode}
            onOpenScoutingConsole={() => setCurrentTab('scouting-console')}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#070A10]">
            {/* Top Navigation Bar */}
            <TopBar
              portalMode={portalMode}
              setPortalMode={setPortalMode}
              shopOccupancy={shopOccupancy}
              onOpenKiosk={() => setIsKioskOpen(true)}
              isCheckedIn={isCheckedIn}
              onOpenNfc={() => setIsNfcOpen(true)}
              studentName="Maya Patel"
              roleTitle="CO-CAPTAIN / SOFTWARE LEAD"
              onOpenRoleSwitcher={() => openAuthModal()}
            />

            {/* View Container */}
            <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1600px] w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {currentTab === 'student-home' && (
                    <StudentHome
                      certifications={certifications}
                      schedule={INITIAL_BUILD_SCHEDULE}
                      tasks={tasks}
                      onOpenNfc={() => setIsNfcOpen(true)}
                      onOpenMachineRequest={() => setIsMachineModalOpen(true)}
                      onOpenHourAppeal={() => setIsHourAppealOpen(true)}
                      onOpenFirstSync={() => setIsFirstSyncOpen(true)}
                      onRequestTraining={() => setIsTrainingModalOpen(true)}
                      onSelectTask={(task) => setSelectedTask(task)}
                      loggedHours={loggedHours}
                      isCheckedIn={isCheckedIn}
                    />
                  )}

                  {currentTab === 'badges-hours' && (
                    <BadgesAndHoursView
                      onOpenHourAppeal={() => setIsHourAppealOpen(true)}
                      loggedHours={loggedHours}
                      hourAppeals={hourAppeals}
                      onApproveAppeal={handleApproveAppeal}
                    />
                  )}

                  {currentTab === 'assigned-subsystems' && (
                    <AssignedSubsystemsView
                      tasks={tasks}
                      onSelectTask={(task) => setSelectedTask(task)}
                    />
                  )}

                  {currentTab === 'notes-demos' && (
                    <EngineeringNotesAndDemosView
                      notes={notes}
                      demos={demos}
                      onAddNote={handleAddNote}
                      onAddDemo={handleAddDemo}
                      onToggleDemoChecklistItem={handleToggleDemoChecklistItem}
                    />
                  )}

                  {(currentTab === 'lead-overview' || currentTab === 'metrics-operations') && (
                    <LeadOverviewView
                      roster={roster}
                      onOpenKiosk={() => setIsKioskOpen(true)}
                    />
                  )}

                  {currentTab === 'all-members' && (
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

                  {currentTab === 'live-floor-log' && (
                    <LiveFloorLogView
                      floorLog={floorLog}
                      machineReservations={machineReservations}
                      onOpenKiosk={() => setIsKioskOpen(true)}
                      onOpenMachineRequest={() => setIsMachineModalOpen(true)}
                    />
                  )}

                  {currentTab === 'kiosk-eligibility' && (
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-4">
                        <h2 className="text-xl font-bold text-white">Shop Entryway Kiosk Mode</h2>
                        <p className="text-xs text-slate-400 max-w-lg mx-auto font-mono">
                          Launch the fullscreen kiosk terminal for iPad/touch monitors mounted at the machine shop entryway.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsKioskOpen(true)}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono uppercase tracking-wider shadow-lg shadow-blue-600/30 transition cursor-pointer"
                        >
                          Open Kiosk Terminal Now
                        </button>
                      </div>
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

      {/* Interactive Modals */}
      <NfcScanModal
        isOpen={isNfcOpen}
        onClose={() => setIsNfcOpen(false)}
        isCheckedIn={isCheckedIn}
        onToggleCheckIn={handleToggleMyCheckIn}
        studentName="Maya Patel"
        studentId="#5419-STU-0042"
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

      <FirstSyncModal
        isOpen={isFirstSyncOpen}
        onClose={() => setIsFirstSyncOpen(false)}
      />

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

      <KioskModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        roster={roster}
        floorLog={floorLog}
        onToggleStudentCheckIn={handleToggleStudentCheckIn}
      />

      {/* Security & Access Key Modals */}
      <KeyAuthModal />
      <KeyManagementModal />
    </div>
  );
}

export default function Page() {
  return (
    <AuthKeyProvider>
      <DashboardContent />
    </AuthKeyProvider>
  );
}
