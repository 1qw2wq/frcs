'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { FloorEntryCode } from '@/types/teamCentral';
import { KeyRound, Plus, Loader2, Copy, Check, Ban, RefreshCw, Clock } from 'lucide-react';

interface AdminFloorCodesPanelProps {
  accessKey: string | null;
  onCodesChange?: (codes: FloorEntryCode[]) => void;
}

export const AdminFloorCodesPanel: React.FC<AdminFloorCodesPanelProps> = ({
  accessKey,
  onCodesChange,
}) => {
  const [codes, setCodes] = useState<FloorEntryCode[]>([]);
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState('Pit session');
  const [expiresMin, setExpiresMin] = useState(480);
  const [maxUses, setMaxUses] = useState(200);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [latest, setLatest] = useState<FloorEntryCode | null>(null);

  const headers = useCallback((): HeadersInit => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessKey) h['x-frc-access-key'] = accessKey;
    return h;
  }, [accessKey]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/floor?action=list_codes', {
        headers: headers(),
        cache: 'no-store',
      });
      if (res.ok) {
        const body = await res.json();
        setCodes(body.codes || []);
        onCodesChange?.(body.codes || []);
      }
    } catch {
      /* ignore */
    }
  }, [headers, onCodesChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/floor', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          action: 'create_code',
          label,
          expiresInMinutes: expiresMin || null,
          maxUses,
          accessKey,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to generate code');
      setCodes(body.codes || []);
      setLatest(body.code);
      onCodesChange?.(body.codes || []);
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/floor', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ action: 'revoke_code', id, accessKey }),
      });
      const body = await res.json();
      if (res.ok) {
        setCodes(body.codes || []);
        onCodesChange?.(body.codes || []);
      }
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async (c: string) => {
    try {
      await navigator.clipboard.writeText(c);
      setCopied(c);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 space-y-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <KeyRound className="w-4 h-4 text-amber-400" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Dynamic Floor Entry Codes</h3>
            <p className="text-[11px] font-mono text-slate-400">
              Auto-generate codes for members to log pit enter time — no NFC / fixed PIN
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-mono text-slate-500">LABEL</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full mt-0.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
            placeholder="Pit session / Match day"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500">EXPIRES (min)</label>
          <input
            type="number"
            min={0}
            value={expiresMin}
            onChange={(e) => setExpiresMin(Number(e.target.value))}
            className="w-full mt-0.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500">MAX USES</label>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className="w-full mt-0.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={busy || !accessKey}
        onClick={() => void generate()}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold disabled:opacity-50 shadow-lg shadow-amber-500/20"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Generate new entry code
      </button>

      {!accessKey && (
        <p className="text-[11px] text-rose-300 font-mono">Admin access key required in session.</p>
      )}
      {error && <p className="text-[11px] text-rose-300 font-mono">{error}</p>}

      {latest && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono text-emerald-400/80 uppercase">Latest code — share with members</p>
            <p className="text-3xl font-black font-mono tracking-[0.3em] text-white mt-1">{latest.code}</p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {latest.label}
              {latest.expiresAt
                ? ` · expires ${new Date(latest.expiresAt).toLocaleString()}`
                : ' · no expiry'}
              {` · ${latest.maxUses} uses`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copyCode(latest.code)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-900/40 text-emerald-200 text-xs font-mono"
          >
            {copied === latest.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === latest.code ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/80 rounded-xl border border-slate-800">
        {codes.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-slate-500 font-mono">
            No entry codes yet. Generate one for this pit session.
          </p>
        ) : (
          codes.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-300 tracking-wider">{c.code}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      c.active
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {c.active ? 'ACTIVE' : 'REVOKED'}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 truncate">
                  {c.label} · used {c.useCount}/{c.maxUses}
                  {c.lastUsedBy ? ` · last: ${c.lastUsedBy}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => void copyCode(c.code)}
                  className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
                >
                  {copied === c.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {c.active && (
                  <button
                    type="button"
                    onClick={() => void revoke(c.id)}
                    className="p-1.5 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-950/40"
                    title="Revoke"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
