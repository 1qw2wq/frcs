'use client';

import React, { useState } from 'react';
import { Users, Search, CheckCircle2, AlertCircle, Shield, Radio, Filter, Plus, X, Award, Check } from 'lucide-react';
import { MemberRosterItem } from '@/types/teamCentral';

interface AllMembersViewProps {
  roster: MemberRosterItem[];
  onToggleStudentCheckIn: (id: string) => void;
  onAddMember?: (newMember: MemberRosterItem) => void;
}

export const AllMembersView: React.FC<AllMembersViewProps> = ({
  roster,
  onToggleStudentCheckIn,
  onAddMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subteamFilter, setSubteamFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Member Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Build Team Student');
  const [subteam, setSubteam] = useState<MemberRosterItem['subteam']>('Software');
  const [hours, setHours] = useState('12.0');

  const filtered = roster.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubteam = subteamFilter === 'ALL' || m.subteam === subteamFilter;
    return matchesSearch && matchesSubteam;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMem: MemberRosterItem = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      studentId: `#5419-STU-00${Math.floor(10 + Math.random() * 89)}`,
      role: role.trim() || 'Subteam Member',
      subteam,
      hoursLogged: parseFloat(hours) || 0,
      stimsStatus: 'VERIFIED',
      medRelease: 'ON FILE',
      safetyPassed: 6,
      safetyTotal: 8,
      isCheckedIn: false,
      pin: `${Math.floor(1000 + Math.random() * 9000)}`,
    };

    if (onAddMember) onAddMember(newMem);
    setIsAddOpen(false);
    setName('');
    setRole('Build Team Student');
    setHours('12.0');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Team 5419 Active Roster & Clearances</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Total Enrolled: {roster.length} Students • Current On Floor: {roster.filter((r) => r.isCheckedIn).length}
          </p>
        </div>

        {/* Search, Filter & Add Member Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search member or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-44 sm:w-48"
            />
          </div>

          <select
            value={subteamFilter}
            onChange={(e) => setSubteamFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Subteams</option>
            <option value="Software">Software</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
            <option value="Strategy">Strategy</option>
            <option value="Business">Business</option>
          </select>

          {onAddMember && (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Role & Subteam</th>
                <th className="p-4">Shop Hours</th>
                <th className="p-4">Safety Certs</th>
                <th className="p-4">FIRST STIMS</th>
                <th className="p-4">Med Form</th>
                <th className="p-4 text-right">Floor Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{member.name}</p>
                        <p className="text-[10px] text-slate-500">{member.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-medium">{member.role}</p>
                    <span className="text-[10px] text-blue-400 font-bold uppercase">{member.subteam}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold text-sm ${
                        member.hoursLogged >= 50 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {member.hoursLogged.toFixed(1)}
                    </span>
                    <span className="text-slate-500 text-[10px]"> / 50 hrs</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Shield
                        className={`w-3.5 h-3.5 ${
                          member.safetyPassed === member.safetyTotal ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      />
                      <span className="font-bold text-white">
                        {member.safetyPassed}/{member.safetyTotal}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold">
                      {member.stimsStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold">
                      {member.medRelease}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => onToggleStudentCheckIn(member.id)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase border transition cursor-pointer ${
                        member.isCheckedIn
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-emerald-950 hover:text-emerald-300'
                      }`}
                    >
                      {member.isCheckedIn ? 'ON FLOOR' : 'AWAY'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Enroll New Team Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subteam</label>
                  <select
                    value={subteam}
                    onChange={(e) => setSubteam(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Software">Software</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
