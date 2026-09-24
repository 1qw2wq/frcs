'use client';

import React, { useState } from 'react';
import { Layers, GitPullRequest, CheckCircle2, Clock, AlertCircle, ChevronRight, Plus } from 'lucide-react';
import { SubsystemTask } from '@/types/teamCentral';

interface AssignedSubsystemsViewProps {
  tasks: SubsystemTask[];
  onSelectTask: (task: SubsystemTask) => void;
}

export const AssignedSubsystemsView: React.FC<AssignedSubsystemsViewProps> = ({ tasks, onSelectTask }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AUTOS' | 'VISION' | 'ELECTRICAL' | 'MECHANICAL'>('ALL');

  const filtered = tasks.filter((t) => {
    if (activeFilter === 'ALL') return true;
    return t.category === activeFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Subsystem Engineering Sprint & PR Backlog</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            FRC 2025 Reefscape Build Season • Milestone: Week 4 Integration
          </p>
        </div>

        {/* Subteam Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 font-mono text-xs">
          {(['ALL', 'AUTOS', 'VISION', 'ELECTRICAL', 'MECHANICAL'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeFilter === cat ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((task) => (
          <div
            key={task.id}
            onClick={() => onSelectTask(task)}
            className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 transition cursor-pointer space-y-3 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-white text-sm">{task.taskId}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  {task.priority}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 text-xs truncate max-w-[160px]">
                  {task.branchOrSubsystem}
                </span>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                  task.statusType === 'success'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                    : task.statusType === 'info'
                    ? 'bg-blue-950/70 text-blue-300 border-blue-800/60'
                    : task.statusType === 'purple'
                    ? 'bg-purple-950/70 text-purple-300 border-purple-800/60'
                    : 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                }`}
              >
                {task.statusTag}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                {task.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{task.metadata}</span>
              <div className="flex items-center gap-1 text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
