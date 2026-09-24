'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Zap,
  Code2,
  Gamepad2,
  Megaphone,
  CheckCircle2,
  User,
  GitPullRequest,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Shield,
  FileText,
  Clock,
} from 'lucide-react';
import { SubsystemTask, MemberRosterItem, EngineeringNote, OutreachDemo } from '@/types/teamCentral';

interface SubteamViewProps {
  subteamId: string;
  tasks: SubsystemTask[];
  roster: MemberRosterItem[];
  notes: EngineeringNote[];
  demos: OutreachDemo[];
  onSelectTask: (task: SubsystemTask) => void;
  onAddTask: (task: SubsystemTask) => void;
  onAddNote: (note: EngineeringNote) => void;
}

export const SubteamView: React.FC<SubteamViewProps> = ({
  subteamId,
  tasks,
  roster,
  notes,
  demos,
  onSelectTask,
  onAddTask,
  onAddNote,
}) => {
  const [subteamTab, setSubteamTab] = useState<'tasks' | 'notes' | 'demos' | 'roster'>('tasks');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');

  // Modal for new task
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<SubsystemTask['priority']>('P1 - SPRINT');
  const [taskBranch, setTaskBranch] = useState('');

  const metaMap: Record<
    string,
    {
      title: string;
      lead: string;
      mentor: string;
      desc: string;
      icon: any;
      categoryTag: SubsystemTask['category'];
      rosterKey: MemberRosterItem['subteam'];
      color: string;
      cadLink?: string;
    }
  > = {
    'subteam-mech': {
      title: 'Mechanical & CAD Subteam',
      lead: 'Liam Zhang (#5419-STU-0007)',
      mentor: 'Bob K. (Lead Machinist)',
      desc: 'Chassis, superstructures, intake linkages, elevator rigging, and Onshape 3D parametric CAD modeling.',
      icon: Wrench,
      categoryTag: 'MECHANICAL',
      rosterKey: 'Mechanical',
      color: 'emerald',
      cadLink: 'https://cad.onshape.com/documents/vortex5419-reefscape-feeder-rev2',
    },
    'subteam-elec': {
      title: 'Electrical & Pneumatics Subteam',
      lead: 'Jordan Lin (#5419-STU-0018)',
      mentor: 'Elena V. (Electrical Safety Lead)',
      desc: 'CANivore CAN FD wiring, Kraken X60 power distribution, battery health & pneumatics regulator.',
      icon: Zap,
      categoryTag: 'ELECTRICAL',
      rosterKey: 'Electrical',
      color: 'amber',
      cadLink: 'https://github.com/frc5419/Vortex-2025-Schematics',
    },
    'subteam-soft': {
      title: 'Software & Vision Subteam',
      lead: 'Maya Patel (#5419-STU-0042)',
      mentor: 'Austin_Mentor (Senior WPILib Architect)',
      desc: 'WPILib Swerve controller, Limelight 3G AprilTag Megatag2, autonomous path planning & telemetry.',
      icon: Code2,
      categoryTag: 'AUTOS',
      rosterKey: 'Software',
      color: 'blue',
      cadLink: 'https://github.com/frc5419/Vortex-2025-Robot',
    },
    'subteam-strat': {
      title: 'Strategy & Drive Team',
      lead: 'Sophia Miller (#5419-STU-0033)',
      mentor: 'Dave R. (Head Drive Coach)',
      desc: 'Match scouting data analysis, picklist draft prioritization, drive practice scrimmages & rule optimization.',
      icon: Gamepad2,
      categoryTag: 'AUTOS',
      rosterKey: 'Strategy',
      color: 'purple',
    },
    'subteam-biz': {
      title: 'Business & Outreach Subteam',
      lead: 'Chloe Kim (#5419-STU-0029)',
      mentor: 'Karen S. (FIRST Operations & Safety)',
      desc: 'Sponsorship decks, pit banners, FIRST Impact award submission, community robot demos, and media documentation.',
      icon: Megaphone,
      categoryTag: 'MECHANICAL',
      rosterKey: 'Business',
      color: 'cyan',
    },
  };

  const current = metaMap[subteamId] || metaMap['subteam-soft'];
  const Icon = current.icon;

  // Filter tasks for this subteam
  const subteamTasks = tasks.filter((t) => {
    if (subteamId === 'subteam-mech') return t.category === 'MECHANICAL';
    if (subteamId === 'subteam-elec') return t.category === 'ELECTRICAL';
    if (subteamId === 'subteam-soft') return t.category === 'AUTOS' || t.category === 'VISION';
    return true;
  });

  const filteredTasks = subteamTasks.filter((t) => {
    if (taskStatusFilter === 'ALL') return true;
    if (taskStatusFilter === 'DONE') return t.statusTag.includes('READY') || t.statusTag.includes('DONE');
    if (taskStatusFilter === 'PROGRESS') return t.statusTag.includes('PROGRESS') || t.statusTag.includes('TESTING');
    if (taskStatusFilter === 'BLOCKED') return t.statusTag.includes('BLOCKED');
    return true;
  });

  // Filter notes for this subteam
  const subteamNotes = notes.filter((n) => n.subteamId === subteamId);

  // Filter roster for this subteam
  const subteamRoster = roster.filter((r) => r.subteam === current.rosterKey);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: SubsystemTask = {
      id: `task-${Date.now()}`,
      taskId: `#${subteamId.slice(8, 10).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      priority: taskPriority,
      category: current.categoryTag,
      subteamId,
      branchOrSubsystem: taskBranch || `SUBSYSTEM: ${current.title.toUpperCase()}`,
      statusTag: 'IN PROGRESS (0%)',
      statusType: 'info',
      title: taskTitle,
      description: taskDesc || 'Sprint task registered for engineering review and deployment.',
      metadata: `Assignee: ${current.lead.split(' ')[0]}`,
      comments: [
        {
          id: `comm-${Date.now()}`,
          author: 'System',
          text: 'Task initialized in active sprint backlog.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    onAddTask(newTask);
    setIsNewTaskOpen(false);
    setTaskTitle('');
    setTaskDesc('');
    setTaskBranch('');
  };

  return (
    <div className="space-y-6">
      {/* Subteam Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
            <Icon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{current.title}</h2>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-mono font-bold uppercase">
                ACTIVE SPRINT WK 4
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">{current.desc}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span className="text-blue-400 font-semibold">Lead: {current.lead}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">Mentor: {current.mentor}</span>
              {current.cadLink && (
                <>
                  <span className="text-slate-500">|</span>
                  <a
                    href={current.cadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>CAD / Repository Source</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNewTaskOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-blue-600/30 transition self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Subteam Task</span>
        </button>
      </div>

      {/* Subteam Internal Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setSubteamTab('tasks')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              subteamTab === 'tasks' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sprint Tasks ({subteamTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setSubteamTab('notes')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              subteamTab === 'notes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Engineering Notes ({subteamNotes.length})
          </button>
          <button
            type="button"
            onClick={() => setSubteamTab('roster')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              subteamTab === 'roster' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Subteam Roster ({subteamRoster.length})
          </button>
        </div>

        {subteamTab === 'tasks' && (
          <div className="flex items-center gap-1 text-xs font-mono bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {['ALL', 'PROGRESS', 'DONE', 'BLOCKED'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTaskStatusFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  taskStatusFilter === f ? 'bg-slate-800 text-blue-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Tasks & Sprints */}
      {subteamTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 transition cursor-pointer space-y-3 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{task.taskId}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {task.priority}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      task.statusType === 'success'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        : task.statusType === 'purple'
                        ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                        : task.statusType === 'warning'
                        ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                        : 'bg-blue-950 text-blue-300 border-blue-800/60'
                    }`}
                  >
                    {task.statusTag}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                  {task.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                <span className="truncate max-w-[200px]">{task.branchOrSubsystem}</span>
                <div className="flex items-center gap-1 text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Inspect & Edit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="col-span-2 p-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-2">
              <GitPullRequest className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">No tasks found matching filter &ldquo;{taskStatusFilter}&rdquo;.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Engineering Notes */}
      {subteamTab === 'notes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subteamNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-bold uppercase">
                      {note.category}
                    </span>
                    <span className="text-slate-400">{note.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{note.title}</h4>
                  <div className="text-xs text-slate-300 font-sans line-clamp-3 leading-relaxed whitespace-pre-line">
                    {note.content.replace(/#+\s/g, '')}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>By: {note.author}</span>
                  {note.cadLink && (
                    <a
                      href={note.cadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>CAD Source</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {subteamNotes.length === 0 && (
            <div className="p-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">No engineering notes recorded yet for this subteam.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Subteam Roster */}
      {subteamTab === 'roster' && (
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              {current.title} Dedicated Students & Travel Qualification
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {subteamRoster.filter((r) => r.hoursLogged >= 50).length} / {subteamRoster.length} Qualified (50h bar)
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {subteamRoster.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
                    {member.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{member.name}</p>
                    <p className="text-slate-400 text-[11px]">{member.role} • {member.studentId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-emerald-400 text-sm">{member.hoursLogged.toFixed(1)} hrs</p>
                    <span className="text-[10px] text-slate-500">
                      {member.hoursLogged >= 50 ? 'Travel Ready ✓' : `${(50 - member.hoursLogged).toFixed(1)} hrs left`}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                      member.isCheckedIn
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {member.isCheckedIn ? 'ON FLOOR' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Create {current.title} Task</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTaskOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swerve Drivetrain Azimuth Encoder Alignment & Offsets"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="P0 - HIGH">P0 - HIGH (Blocker)</option>
                    <option value="P1 - SPRINT">P1 - SPRINT (Active)</option>
                    <option value="P2 - TEST">P2 - TEST (Bench)</option>
                    <option value="P3 - SPRINT">P3 - SPRINT (Backlog)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Branch / Mechanism Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. BRANCH: feature/feeder-rev2"
                    value={taskBranch}
                    onChange={(e) => setTaskBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specification & Definition of Done</label>
                <textarea
                  rows={3}
                  placeholder="Describe electrical connections, CAD drawings required, or unit tests to pass..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
