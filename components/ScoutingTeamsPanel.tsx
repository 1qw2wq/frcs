'use client';

import React, { useMemo, useState } from 'react';
import { FrcTeam } from '@/types/frc';
import { Plus, Trash2, Users, Search, Loader2, CheckCircle2, X } from 'lucide-react';

interface ScoutingTeamsPanelProps {
  teams: FrcTeam[];
  onAddTeam: (input: {
    number: number;
    name: string;
    organization?: string;
    location?: string;
  }) => Promise<void>;
  onDeleteTeam: (teamNumber: number) => Promise<void>;
  canManage?: boolean;
  compact?: boolean;
}

export const ScoutingTeamsPanel: React.FC<ScoutingTeamsPanelProps> = ({
  teams,
  onAddTeam,
  onDeleteTeam,
  canManage = true,
  compact = false,
}) => {
  const [open, setOpen] = useState(!compact);
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...teams].sort((a, b) => a.number - b.number);
    if (!q) return sorted;
    return sorted.filter(
      (t) =>
        String(t.number).includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.organization || '').toLowerCase().includes(q) ||
        (t.location || '').toLowerCase().includes(q)
    );
  }, [teams, query]);

  const resetForm = () => {
    setNumber('');
    setName('');
    setOrganization('');
    setLocation('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    setError(null);
    setOkMsg(null);
    const n = Number(number);
    const nm = name.trim();
    if (!n || n < 1 || n > 99999) {
      setError('Enter a valid FRC team number.');
      return;
    }
    if (!nm) {
      setError('Team name is required.');
      return;
    }
    setBusy(true);
    try {
      await onAddTeam({
        number: n,
        name: nm,
        organization: organization.trim() || undefined,
        location: location.trim() || undefined,
      });
      setOkMsg(`Team #${n} added to scouting roster.`);
      resetForm();
      setTimeout(() => setOkMsg(null), 2500);
    } catch (err: any) {
      setError(err?.message || 'Failed to add team');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (teamNumber: number, teamName: string) => {
    if (!canManage) return;
    const ok = window.confirm(
      `Remove team #${teamNumber} (${teamName}) from scouting?\nRelated match/pit scouting rows for this team will also be deleted.`
    );
    if (!ok) return;
    setError(null);
    setOkMsg(null);
    setDeleting(teamNumber);
    try {
      await onDeleteTeam(teamNumber);
      setOkMsg(`Team #${teamNumber} removed.`);
      setTimeout(() => setOkMsg(null), 2500);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete team');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 border-b border-slate-800 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 shrink-0">
            <Users className="w-4 h-4 text-cyan-400" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">Scouting Teams</h3>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              {teams.length} team{teams.length === 1 ? '' : 's'} in SQL · members can add & delete
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-500 shrink-0">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {canManage && (
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-mono text-slate-500 mb-1">TEAM #</label>
                <input
                  type="number"
                  min={1}
                  max={99999}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="254"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-mono text-slate-500 mb-1">NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The Cheesy Poofs"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-mono text-slate-500 mb-1">ORG (opt)</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="High School"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-mono text-slate-500 mb-1">LOCATION</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Jose, CA"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold disabled:opacity-60 transition shadow-lg shadow-cyan-500/20"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Add Team
                </button>
              </div>
            </form>
          )}

          {(error || okMsg) && (
            <div
              className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
                error
                  ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                  : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
              }`}
            >
              {error ? <X className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
              <span className="font-mono">{error || okMsg}</span>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter teams…"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 divide-y divide-slate-800/80">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-500 font-mono">
                {teams.length === 0
                  ? 'No scouting teams yet. Add the first team above — starts empty when FRC_START_CLEAN=true.'
                  : 'No teams match that filter.'}
              </div>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.number}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-950/60 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-300 text-sm">#{t.number}</span>
                      <span className="text-sm text-white font-semibold truncate">{t.name}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      {[t.organization, t.location].filter(Boolean).join(' · ') || '—'}
                      {t.status ? ` · ${t.status}` : ''}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleDelete(t.number, t.name)}
                      disabled={deleting === t.number}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 hover:border-rose-400/50 text-[11px] font-mono disabled:opacity-50 transition"
                      title="Remove from scouting"
                    >
                      {deleting === t.number ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
