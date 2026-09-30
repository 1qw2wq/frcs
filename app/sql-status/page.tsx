'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Server,
  Clock,
  Table2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

type StatusPayload = {
  connected?: boolean;
  success?: boolean;
  status?: 'connected' | 'error' | 'degraded' | string;
  engine?: string;
  serverType?: string;
  message?: string;
  latencyMs?: number;
  ping?: string | null;
  database?: string;
  tablesCount?: number;
  totalRows?: number;
  tables?: { name: string; rowCount: number }[];
  backend?: {
    engine?: string;
    configured?: boolean;
    url?: string;
    message?: string;
    startClean?: boolean;
  };
  supabaseConfigured?: boolean;
  databaseUrlConfigured?: boolean;
  startClean?: boolean;
  checkedAt?: string;
  error?: string;
};

export default function SqlStatusPage() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/sql/status', { cache: 'no-store' });
      setHttpStatus(res.status);
      const json = (await res.json()) as StatusPayload;
      setData(json);
    } catch (e: any) {
      setFetchError(e?.message || 'Network error reaching /api/sql/status');
      setData(null);
      setHttpStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const ok = Boolean(data?.connected && data?.success);
  const degraded = data?.status === 'degraded';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-cyan-300 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to app
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Server className="h-6 w-6 text-cyan-400" />
              SQL Server connection
            </h1>
            <p className="mt-1 text-sm text-slate-400 font-mono">
              Live probe via <span className="text-cyan-400">GET /api/sql/status</span>
            </p>
          </div>
          <button
            type="button"
            onClick={runCheck}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 disabled:opacity-60 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking…' : 'Re-check'}
          </button>
        </div>

        {/* Status card */}
        <div
          className={`rounded-2xl border p-6 shadow-xl mb-6 ${
            fetchError || data?.status === 'error'
              ? 'border-red-500/40 bg-red-950/30'
              : degraded
                ? 'border-amber-500/40 bg-amber-950/20'
                : ok
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-900'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`rounded-xl p-3 border ${
                fetchError || data?.status === 'error'
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : degraded
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : ok
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {loading ? (
                <Activity className="h-8 w-8 animate-pulse" />
              ) : fetchError || data?.status === 'error' ? (
                <XCircle className="h-8 w-8" />
              ) : degraded ? (
                <AlertTriangle className="h-8 w-8" />
              ) : ok ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <Database className="h-8 w-8" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {loading
                    ? 'Checking SQL server…'
                    : fetchError
                      ? 'Check failed'
                      : ok
                        ? degraded
                          ? 'Connected (degraded)'
                          : 'Connected to SQL server'
                        : 'Not connected'}
                </h2>
                {httpStatus != null && (
                  <span className="rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[11px] font-mono text-slate-400 border border-slate-800">
                    HTTP {httpStatus}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-300 font-mono leading-relaxed break-words">
                {fetchError || data?.message || data?.error || '—'}
              </p>
              {data?.ping && (
                <p className="mt-2 text-xs font-mono text-cyan-300/90">
                  Ping: {data.ping}
                  {typeof data.latencyMs === 'number' ? ` · ${data.latencyMs} ms` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Detail
            icon={<Database className="h-4 w-4 text-cyan-400" />}
            label="Engine"
            value={data?.serverType || data?.engine || '—'}
          />
          <Detail
            icon={<Clock className="h-4 w-4 text-amber-400" />}
            label="Latency"
            value={typeof data?.latencyMs === 'number' ? `${data.latencyMs} ms` : '—'}
          />
          <Detail
            icon={<Server className="h-4 w-4 text-emerald-400" />}
            label="Database"
            value={data?.database || '—'}
          />
          <Detail
            icon={<Table2 className="h-4 w-4 text-blue-400" />}
            label="Tables / rows"
            value={
              data
                ? `${data.tablesCount ?? 0} tables · ${data.totalRows ?? 0} rows`
                : '—'
            }
          />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 mb-6 space-y-3 text-xs font-mono">
          <Row label="DATABASE_URL set" value={yn(data?.databaseUrlConfigured)} />
          <Row label="Supabase configured" value={yn(data?.supabaseConfigured)} />
          <Row label="Start clean" value={yn(data?.startClean)} />
          <Row label="Backend URL" value={data?.backend?.url || '(local / not set)'} />
          <Row label="Checked at" value={data?.checkedAt || '—'} />
          <Row label="API endpoint" value="/api/sql/status" />
        </div>

        {data?.tables && data.tables.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-slate-800 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Table row counts
            </div>
            <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
              {data.tables.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between px-5 py-2.5 text-sm font-mono"
                >
                  <span className="text-slate-200">{t.name}</span>
                  <span className="text-cyan-300 tabular-nums">{t.rowCount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 text-[11px] font-mono text-slate-500 leading-relaxed">
          <p className="mb-2 text-slate-400 font-semibold">How to use</p>
          <p>
            curl -sS https://your-host/api/sql/status | jq
          </p>
          <p className="mt-2">
            <span className="text-emerald-400">200</span> = connected ·{' '}
            <span className="text-red-400">503</span> = SQL unreachable
          </p>
          <p className="mt-2">
            For cloud Postgres set <span className="text-cyan-400">DATABASE_URL</span> (Supabase
            pooler URI). Without it the app uses local SQLite.
          </p>
        </div>
      </div>
    </div>
  );
}

function yn(v: boolean | undefined) {
  if (v === undefined) return '—';
  return v ? 'yes' : 'no';
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold text-white break-words">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 break-all text-right">{value}</span>
    </div>
  );
}
