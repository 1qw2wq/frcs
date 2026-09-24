'use client';

import React, { useState, useEffect } from 'react';
import { X, GitPullRequest, GitBranch, User, CheckCircle2, Terminal, MessageSquare, Send, Tag, AlertCircle } from 'lucide-react';
import { SubsystemTask } from '@/types/teamCentral';

interface TaskDetailModalProps {
  task: SubsystemTask | null;
  onClose: () => void;
  onUpdateTask?: (updatedTask: SubsystemTask) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdateTask }) => {
  const [commentText, setCommentText] = useState('');
  const [currentTask, setCurrentTask] = useState<SubsystemTask | null>(task);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  if (!currentTask) return null;

  const handleStatusChange = (newStatus: string) => {
    let statusType: SubsystemTask['statusType'] = 'info';
    if (newStatus.includes('READY') || newStatus.includes('MERGED')) statusType = 'success';
    else if (newStatus.includes('TESTING')) statusType = 'purple';
    else if (newStatus.includes('BLOCKED')) statusType = 'warning';

    const updated: SubsystemTask = {
      ...currentTask,
      statusTag: newStatus,
      statusType,
    };
    setCurrentTask(updated);
    if (onUpdateTask) onUpdateTask(updated);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      author: 'Maya Patel (Lead)',
      text: commentText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated: SubsystemTask = {
      ...currentTask,
      comments: [...(currentTask.comments || []), newComment],
    };

    setCurrentTask(updated);
    if (onUpdateTask) onUpdateTask(updated);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="font-bold text-white text-base">{currentTask.taskId}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                {currentTask.priority}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  currentTask.statusType === 'success'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                    : currentTask.statusType === 'purple'
                    ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                    : currentTask.statusType === 'warning'
                    ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                    : 'bg-blue-950 text-blue-300 border-blue-800/60'
                }`}
              >
                {currentTask.statusTag}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">{currentTask.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Quick Switcher Bar */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase tracking-wider">CHANGE SPRINT STATUS:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              'IN PROGRESS (75%)',
              'BENCH TESTING',
              'PR #88 • READY FOR FIELD',
              'MERGED / COMPLETED',
              'BLOCKED BY MECH',
            ].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                  currentTask.statusTag === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Specification & Architecture */}
        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 text-[11px] block mb-1 uppercase tracking-wider font-bold">
              TASK SPECIFICATION & OBJECTIVES
            </label>
            <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed font-sans text-xs">
              {currentTask.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                <span>GIT BRANCH / SUBSYSTEM</span>
              </div>
              <p className="text-white font-bold truncate text-[11px]">{currentTask.branchOrSubsystem}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>ASSIGNED REVIEWER</span>
              </div>
              <p className="text-white font-bold truncate text-[11px]">{currentTask.metadata}</p>
            </div>
          </div>

          {/* Test Pipeline Verification */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-900 pb-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Terminal className="w-3 h-3 text-cyan-400" />
                WPILib Verification & Unit Tests
              </span>
              <span className="text-emerald-400 font-bold">PASSING (14/14 UNIT TESTS)</span>
            </div>
            <pre className="text-slate-400 overflow-x-auto py-1 text-[10px]">
              {`poseEstimator.addVisionMeasurement(\n  limelightResults.botpose,\n  timer.getFPGATimestamp(),\n  VecBuilder.fill(0.1, 0.1, Units.degreesToRadians(2))\n);`}
            </pre>
          </div>

          {/* Discussion & Engineering Log */}
          <div className="space-y-2 pt-1">
            <label className="text-slate-400 text-[11px] block uppercase tracking-wider font-bold flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>DISCUSSION & SPRINT PROGRESS NOTES</span>
            </label>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {(currentTask.comments || [
                {
                  id: 'c-default',
                  author: 'Austin_Mentor',
                  text: 'Please ensure covariance scaling handles distance values > 5 meters correctly.',
                  time: 'Yesterday 5:20 PM',
                },
              ]).map((comment) => (
                <div key={comment.id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-900 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-blue-400 font-bold">{comment.author}</span>
                    <span className="text-slate-500">{comment.time}</span>
                  </div>
                  <p className="text-slate-300 text-xs font-sans">{comment.text}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Post engineering comment or update..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">Milestone: Week 4 Sprint</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
