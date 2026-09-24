'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  MapPin,
  Megaphone,
  Plus,
  Radio,
  Search,
  Sparkles,
  Tag,
  User,
  Users,
  Wrench,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { EngineeringNote, OutreachDemo } from '@/types/teamCentral';

interface EngineeringNotesAndDemosViewProps {
  notes: EngineeringNote[];
  demos: OutreachDemo[];
  onAddNote: (note: EngineeringNote) => void;
  onAddDemo: (demo: OutreachDemo) => void;
  onToggleDemoChecklistItem: (demoId: string, checklistId: string) => void;
}

export const EngineeringNotesAndDemosView: React.FC<EngineeringNotesAndDemosViewProps> = ({
  notes,
  demos,
  onAddNote,
  onAddDemo,
  onToggleDemoChecklistItem,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'demos'>('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [subteamFilter, setSubteamFilter] = useState('ALL');
  const [selectedNote, setSelectedNote] = useState<EngineeringNote | null>(notes[0] || null);

  // New Note Modal State
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubteam, setNoteSubteam] = useState('subteam-soft');
  const [noteCategory, setNoteCategory] = useState<EngineeringNote['category']>('Software & Control');
  const [noteCadLink, setNoteCadLink] = useState('');
  const [noteTags, setNoteTags] = useState('WPILib, Telemetry, Tests');
  const [noteContent, setNoteContent] = useState('');

  // New Demo Modal State
  const [isNewDemoOpen, setIsNewDemoOpen] = useState(false);
  const [demoTitle, setDemoTitle] = useState('');
  const [demoAudience, setDemoAudience] = useState('');
  const [demoDate, setDemoDate] = useState('');
  const [demoLocation, setDemoLocation] = useState('');
  const [demoRobot, setDemoRobot] = useState('2025 Reefscape Robot ("VORTEX IX")');
  const [demoLeadStudent, setDemoLeadStudent] = useState('Maya Patel');
  const [demoMentor, setDemoMentor] = useState('Bob K.');
  const [demoDescription, setDemoDescription] = useState('');

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubteam = subteamFilter === 'ALL' || n.subteamId === subteamFilter;
    return matchesSearch && matchesSubteam;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: EngineeringNote = {
      id: `note-${Date.now()}`,
      title: noteTitle,
      subteamId: noteSubteam,
      author: 'Maya Patel (Lead)',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      category: noteCategory,
      cadLink: noteCadLink || undefined,
      tags: noteTags.split(',').map((t) => t.trim()).filter(Boolean),
      content: noteContent,
      verified: true,
    };

    onAddNote(newNote);
    setSelectedNote(newNote);
    setIsNewNoteOpen(false);
    setNoteTitle('');
    setNoteContent('');
    setNoteCadLink('');
  };

  const handleCreateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoTitle.trim() || !demoLocation.trim()) return;

    const newDemo: OutreachDemo = {
      id: `demo-${Date.now()}`,
      title: demoTitle,
      targetAudience: demoAudience || 'Students & Community',
      date: demoDate || 'Upcoming Weekend',
      location: demoLocation,
      status: 'UPCOMING',
      robotUsed: demoRobot,
      leadStudent: demoLeadStudent,
      leadMentor: demoMentor,
      description: demoDescription,
      checklist: [
        { id: `c-1-${Date.now()}`, item: 'Pack SLA batteries & 12V Anderson charger', completed: true },
        { id: `c-2-${Date.now()}`, item: 'Safety crowd perimeter barrier and signage', completed: true },
        { id: `c-3-${Date.now()}`, item: 'Driver station laptop & throttled controllers', completed: false },
        { id: `c-4-${Date.now()}`, item: 'Team brochures, stickers, and recruitment forms', completed: false },
      ],
    };

    onAddDemo(newDemo);
    setIsNewDemoOpen(false);
    setDemoTitle('');
    setDemoLocation('');
    setDemoDescription('');
    setDemoAudience('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Switcher Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span>Engineering Notes & Robot Demos</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Live technical design logs, CAD documentation, benchmark data, and community outreach operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Engineering Notes ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('demos')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'demos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Robot Demos & Outreach ({demos.length})
            </button>
          </div>

          {activeTab === 'notes' ? (
            <button
              type="button"
              onClick={() => setIsNewNoteOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsNewDemoOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'notes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notes Left Sidebar List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search technical notes or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={subteamFilter}
                onChange={(e) => setSubteamFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Subteams</option>
                <option value="subteam-soft">Software & Vision</option>
                <option value="subteam-mech">Mechanical & CAD</option>
                <option value="subteam-elec">Electrical & CAN</option>
                <option value="subteam-strat">Strategy & Match</option>
                <option value="subteam-biz">Business & Outreach</option>
              </select>
            </div>

            {/* Note Cards */}
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500/70 shadow-md shadow-blue-600/10'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-blue-300 text-[10px] font-mono font-bold uppercase">
                        {note.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{note.date}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {note.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {note.content.replace(/#+\s/g, '').slice(0, 120)}...
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {note.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredNotes.length === 0 && (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-mono text-slate-400">No engineering notes match your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Note Viewer Right Column */}
          <div className="lg:col-span-7">
            {selectedNote ? (
              <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-5">
                {/* Note Header */}
                <div className="space-y-2 border-b border-slate-800/80 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800/60 text-xs font-mono font-bold uppercase">
                        {selectedNote.category}
                      </span>
                      {selectedNote.verified && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>LEAD VERIFIED</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-400">{selectedNote.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-tight">{selectedNote.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>Author: {selectedNote.author}</span>
                    </div>
                    {selectedNote.cadLink && (
                      <a
                        href={selectedNote.cadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>CAD / Repository Source</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Note Content (Rendered Markdown Body) */}
                <div className="prose prose-invert max-w-none text-xs sm:text-sm font-sans text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
                  {selectedNote.content}
                </div>

                {/* Tags Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    {selectedNote.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-slate-500">ID: {selectedNote.id}</span>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-mono text-slate-400">Select a note to inspect details.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Robot Demos & Outreach Events Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">SCHEDULED DEMOS</span>
              <p className="text-3xl font-mono font-black text-emerald-400 mt-1">
                {demos.filter((d) => d.status !== 'COMPLETED').length} ACTIVE
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">Sponsor and STEM night outreach</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">DEMO FLEET READINESS</span>
              <p className="text-3xl font-mono font-black text-blue-400 mt-1">2 ROBOTS</p>
              <p className="text-xs text-slate-400 font-mono mt-1">VORTEX IX (Reefscape) & AURA (Crescendo)</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">COMMUNITY OUTREACH IMPACT</span>
              <p className="text-3xl font-mono font-black text-purple-400 mt-1">1,640+ REACH</p>
              <p className="text-xs text-slate-400 font-mono mt-1">Students engaged across South Bay</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {demos.map((demo) => {
              const completedCount = demo.checklist.filter((c) => c.completed).length;
              const totalCount = demo.checklist.length;
              const isComplete = demo.status === 'COMPLETED';

              return (
                <div
                  key={demo.id}
                  className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          demo.status === 'COMPLETED'
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : demo.status === 'UPCOMING'
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                            : 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                        }`}
                      >
                        {demo.status === 'COMPLETED' ? '✓ COMPLETED' : demo.status}
                      </span>
                      <span className="text-xs font-mono text-blue-400 font-semibold">{demo.robotUsed}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">{demo.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{demo.description}</p>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-400">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{demo.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{demo.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>Lead: {demo.leadStudent}</span>
                        <span>Mentor: {demo.leadMentor}</span>
                      </div>
                    </div>

                    {/* Operational Checklist */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">
                          DEPLOYMENT CHECKLIST
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {completedCount}/{totalCount} READY
                        </span>
                      </div>

                      <div className="space-y-1">
                        {demo.checklist.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => onToggleDemoChecklistItem(demo.id, item.id)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/70 text-[11px] text-slate-300 cursor-pointer hover:border-slate-700 transition"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => {}}
                              className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
                            />
                            <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                              {item.item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Engineering Note Modal */}
      {isNewNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Add Engineering Design Note</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewNoteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title / Milestone Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coral Elevator 2-Stage Cascade Cable Rigging & SysId Tuning"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subteam</label>
                  <select
                    value={noteSubteam}
                    onChange={(e) => setNoteSubteam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="subteam-soft">Software & Vision</option>
                    <option value="subteam-mech">Mechanical & CAD</option>
                    <option value="subteam-elec">Electrical & CAN</option>
                    <option value="subteam-strat">Strategy & Match</option>
                    <option value="subteam-biz">Business & Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discipline Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Software & Control">Software & Control</option>
                    <option value="Mechanical CAD">Mechanical CAD</option>
                    <option value="Electrical & CAN">Electrical & CAN</option>
                    <option value="Strategy & Field">Strategy & Field</option>
                    <option value="Testing Protocol">Testing Protocol</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CAD / Git Repository Link</label>
                  <input
                    type="url"
                    placeholder="https://cad.onshape.com/..."
                    value={noteCadLink}
                    onChange={(e) => setNoteCadLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Technical Specifications, Benchmarks & Results (Markdown)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="### Objective&#10;Tested Kraken motor thermal rise under continuous intake stall...&#10;&#10;#### Findings:&#10;- Temperature peaked at 48C after 3 minutes&#10;- Current limit at 40A preserved motor integrity"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewNoteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Save Engineering Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Demo Modal */}
      {isNewDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Schedule Robot Outreach Demo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDemoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDemo} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Demo Event Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stevens Creek Elementary STEM Expo Robot Driving"
                  value={demoTitle}
                  onChange={(e) => setDemoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. K-5 Students, Teachers & Parents"
                    value={demoAudience}
                    onChange={(e) => setDemoAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Robot Deployed</label>
                  <select
                    value={demoRobot}
                    onChange={(e) => setDemoRobot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="2025 Reefscape Robot ('VORTEX IX')">2025 Reefscape Robot ("VORTEX IX")</option>
                    <option value="2024 Crescendo Robot ('AURA')">2024 Crescendo Robot ("AURA")</option>
                    <option value="2023 Charged Up Robot ('TITAN')">2023 Charged Up Robot ("TITAN")</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date & Time</label>
                  <input
                    type="text"
                    placeholder="e.g. Mar 05, 2025 • 4:00 PM – 7:00 PM"
                    value={demoDate}
                    onChange={(e) => setDemoDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location / Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cupertino High School Quad"
                    value={demoLocation}
                    onChange={(e) => setDemoLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lead Student</label>
                  <input
                    type="text"
                    value={demoLeadStudent}
                    onChange={(e) => setDemoLeadStudent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Supervising Mentor</label>
                  <input
                    type="text"
                    value={demoMentor}
                    onChange={(e) => setDemoMentor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Event Description & Demo Plan</label>
                <textarea
                  rows={3}
                  placeholder="Interactive driving exhibition with dual controllers, note scoring demo, and team flyer distribution."
                  value={demoDescription}
                  onChange={(e) => setDemoDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDemoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Confirm Demo Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
