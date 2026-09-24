'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthKey } from '@/context/AuthKeyContext';
import {
  Database,
  Play,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Table,
  Terminal,
  Key,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Trash2,
  HardDrive,
  Activity,
  Server,
  RefreshCw,
} from 'lucide-react';
import { SqlQueryResult, SqlTableDefinition, DEFAULT_TABLE_DEFINITIONS } from '@/lib/sqlEngine';
import type { FrcTeam, FrcMatch, MatchScoutingEntry, PitScoutingData, PicklistTeam } from '@/types/frc';

interface SqlServerManagerProps {
  onDatasetChange?: (dataset: Record<string, any>) => void;
}

export const SqlServerManager: React.FC<SqlServerManagerProps> = ({ onDatasetChange }) => {
  const { isAdmin, sqlConnectionKey, setSqlConnectionKey, activeKey, keys } = useAuthKey();
  const [connectionInput, setConnectionInput] = useState(sqlConnectionKey);
  const [backendEngine, setBackendEngine] = useState<string>('sqlite');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    totalRows?: number;
  } | null>(null);

  const [queryInput, setQueryInput] = useState<string>(
    'SELECT number, name, epa, rank, wins, drivetrain FROM teams ORDER BY epa DESC LIMIT 10;'
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);

  const [tables, setTables] = useState<SqlTableDefinition[]>(DEFAULT_TABLE_DEFINITIONS);
  const [selectedTable, setSelectedTable] = useState<string>('teams');
  const [activeTab, setActiveTab] = useState<'console' | 'tables' | 'connection' | 'danger'>('console');

  const [isClearing, setIsClearing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [clearConfirm, setClearConfirm] = useState('');
  const [actionBanner, setActionBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const applyDataset = useCallback(
    (dataset: any) => {
      if (dataset && onDatasetChange) {
        onDatasetChange({
          teams: Array.isArray(dataset.teams) ? dataset.teams : [],
          matches: Array.isArray(dataset.matches) ? dataset.matches : [],
          scoutingEntries: Array.isArray(dataset.scoutingEntries) ? dataset.scoutingEntries : [],
          pitData: Array.isArray(dataset.pitData) ? dataset.pitData : [],
          picklist: Array.isArray(dataset.picklist) ? dataset.picklist : [],
          // Team Central — clear-all must empty these too
          certifications: Array.isArray(dataset.certifications) ? dataset.certifications : [],
          tasks: Array.isArray(dataset.tasks) ? dataset.tasks : [],
          roster: Array.isArray(dataset.roster) ? dataset.roster : [],
          floorLog: Array.isArray(dataset.floorLog) ? dataset.floorLog : [],
          notes: Array.isArray(dataset.notes) ? dataset.notes : [],
          demos: Array.isArray(dataset.demos) ? dataset.demos : [],
          machineReservations: Array.isArray(dataset.machineReservations)
            ? dataset.machineReservations
            : [],
          hourAppeals: Array.isArray(dataset.hourAppeals) ? dataset.hourAppeals : [],
          loggedHours: typeof dataset.loggedHours === 'number' ? dataset.loggedHours : 0,
          isCheckedIn: Boolean(dataset.isCheckedIn),
        });
      }
    },
    [onDatasetChange]
  );

  const adminHeaders = useCallback((): HeadersInit => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const key = activeKey || keys.adminKey;
    if (key) h['x-frc-access-key'] = key;
    return h;
  }, [activeKey, keys.adminKey]);

  const fetchSchema = useCallback(async () => {
    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ action: 'get_schema', connectionKey: sqlConnectionKey }),
      });
      const data = await res.json();
      if (data.tables) setTables(data.tables);
      if (data.backend?.engine) setBackendEngine(data.backend.engine);
      else if (data.engine) setBackendEngine(String(data.engine).toLowerCase().includes('supabase') ? 'supabase' : 'sqlite');
    } catch (e) {
      console.error('Error fetching schema', e);
    }
  }, [sqlConnectionKey, adminHeaders]);

  const handleRunQuery = useCallback(
    async (sqlToRun?: string) => {
      const sql = (sqlToRun || queryInput).trim();
      if (!sql) return;
      setIsExecuting(true);
      try {
        const res = await fetch('/api/sql', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({
            action: 'execute',
            query: sql,
            connectionKey: sqlConnectionKey,
            accessKey: activeKey || keys.adminKey,
          }),
        });
        const data: SqlQueryResult = await res.json();
        setQueryResult(data);
        if ((data as any).dataset) applyDataset((data as any).dataset);
        await fetchSchema();
      } catch (e: any) {
        setQueryResult({
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 0,
          rawSql: sql,
          error: e.message || 'Query execution error',
        });
      } finally {
        setIsExecuting(false);
      }
    },
    [queryInput, sqlConnectionKey, applyDataset, fetchSchema, adminHeaders, activeKey, keys.adminKey]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      await fetchSchema();
      await handleRunQuery(queryInput);
      // Auto-test connection on mount
      try {
        const res = await fetch('/api/sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'test_connection', connectionKey: sqlConnectionKey }),
        });
        const data = await res.json();
        if (active) {
          setTestResult({
            success: data.success,
            message: data.message,
            latencyMs: data.latencyMs,
            totalRows: data.totalRows,
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveConnectionKey = (e: React.FormEvent) => {
    e.preventDefault();
    setSqlConnectionKey(connectionInput);
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          connectionKey: connectionInput,
        }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message,
        latencyMs: data.latencyMs,
        totalRows: data.totalRows,
      });
      setSqlConnectionKey(connectionInput);
      await fetchSchema();
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDownloadDump = () => {
    window.open('/api/sql?action=export_dump', '_blank');
  };

  const handleClearAll = async () => {
    if (!isAdmin) {
      setActionBanner({ type: 'err', text: 'Administrator key required to clear data.' });
      return;
    }
    if (clearConfirm.trim().toUpperCase() !== 'CLEAR ALL') {
      setActionBanner({ type: 'err', text: 'Type CLEAR ALL exactly to confirm irreversible wipe.' });
      return;
    }
    setIsClearing(true);
    setActionBanner(null);
    try {
      // Try SQL route first, then data route as fallback
      let data: any = null;
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          action: 'clear_all',
          accessKey: activeKey || keys.adminKey,
        }),
      });
      data = await res.json();

      if (!res.ok || !data.success) {
        const res2 = await fetch('/api/data', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({
            type: 'clear_all',
            accessKey: activeKey || keys.adminKey,
          }),
        });
        data = await res2.json();
        if (!res2.ok || !data.success) {
          setActionBanner({ type: 'err', text: data.error || 'Clear failed' });
          return;
        }
      }

      setActionBanner({
        type: 'ok',
        text: `Cleared (${data.backend || backendEngine}): ${(data.cleared || ['all tables']).join(', ')}`,
      });
      setClearConfirm('');
      // Force empty UI immediately (scouting + members/events/tasks), then apply server dataset
      applyDataset({
        teams: [],
        matches: [],
        scoutingEntries: [],
        pitData: [],
        picklist: [],
        certifications: [],
        tasks: [],
        roster: [],
        floorLog: [],
        notes: [],
        demos: [],
        machineReservations: [],
        hourAppeals: [],
        loggedHours: 0,
        isCheckedIn: false,
      });
      if (data.dataset) applyDataset(data.dataset);
      await fetchSchema();
      setQueryResult({
        columns: ['status', 'tables_cleared', 'timestamp', 'backend'],
        rows: [
          {
            status: 'CLEARED',
            tables_cleared: (data.cleared || []).join(', '),
            timestamp: data.timestamp,
            backend: data.backend || backendEngine,
          },
        ],
        rowCount: 1,
        executionTimeMs: 1,
        rawSql: 'CLEAR ALL DATA',
      });
      setActiveTab('console');
    } catch (e: any) {
      setActionBanner({ type: 'err', text: e.message || 'Clear failed' });
    } finally {
      setIsClearing(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!isAdmin) {
      setActionBanner({ type: 'err', text: 'Administrator key required to reset data.' });
      return;
    }
    setIsResetting(true);
    setActionBanner(null);
    try {
      let data: any = null;
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          action: 'reset_defaults',
          accessKey: activeKey || keys.adminKey,
        }),
      });
      data = await res.json();
      if (!res.ok || !data.success) {
        const res2 = await fetch('/api/data', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({
            type: 'reset_defaults',
            accessKey: activeKey || keys.adminKey,
          }),
        });
        data = await res2.json();
        if (!res2.ok || !data.success) {
          setActionBanner({ type: 'err', text: data.error || 'Reset failed' });
          return;
        }
      }
      setActionBanner({ type: 'ok', text: data.message || 'Seed data restored' });
      if (data.dataset) applyDataset(data.dataset);
      await fetchSchema();
      await handleRunQuery(
        'SELECT number, name, epa, rank, wins, drivetrain FROM teams ORDER BY epa DESC LIMIT 10;'
      );
    } catch (e: any) {
      setActionBanner({ type: 'err', text: e.message || 'Reset failed' });
    } finally {
      setIsResetting(false);
    }
  };

  const totalRows = tables.reduce((s, t) => s + (t.rowCount || 0), 0);

  const presets = [
    {
      label: 'Top Teams by EPA',
      query: 'SELECT number, name, epa, rank, wins, drivetrain FROM teams ORDER BY epa DESC;',
    },
    {
      label: 'Match Scouting Log',
      query:
        'SELECT match_number, team_number, scout_name, cycles, climb_status FROM match_scouting ORDER BY match_number DESC;',
    },
    {
      label: 'Pit Inspections',
      query:
        'SELECT team_number, drivetrain, weight_lbs, battery_voltage, inspection_passed FROM pit_scouting;',
    },
    {
      label: 'Tournament Matches',
      query:
        'SELECT match_number, comp_level, red_teams, blue_teams, red_score, blue_score, predicted_winner FROM matches;',
    },
    {
      label: 'Access Keys Status',
      query: 'SELECT role, status, permissions FROM access_keys;',
    },
    { label: 'Show Tables', query: 'SHOW TABLES;' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-[#0B1220] to-slate-950 p-6 shadow-2xl shadow-cyan-500/5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3.5 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/10">
              <Server className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">SQL Server Backend</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  {backendEngine === 'supabase' ? 'SUPABASE' : 'SQLITE'} ONLINE
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">
                {backendEngine === 'supabase'
                  ? 'Live Supabase PostgreSQL cloud SQL. Scouting, pit, picklist, and matches persist remotely.'
                  : 'Local SQLite engine (set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for Supabase cloud SQL).'}{' '}
                Run queries, export dumps, or wipe the database clean.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDump}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 backdrop-blur transition hover:border-cyan-500/40 hover:bg-slate-700"
              title="Download SQL dump"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export .SQL</span>
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <HardDrive className="h-3 w-3 text-cyan-400" />
              Engine
            </div>
            <p className="mt-0.5 text-sm font-bold text-white">
              {backendEngine === 'supabase' ? 'Supabase PG' : 'SQLite SQL'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <Table className="h-3 w-3 text-blue-400" />
              Tables
            </div>
            <p className="mt-0.5 text-sm font-bold text-white">{tables.length}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <Activity className="h-3 w-3 text-emerald-400" />
              Total Rows
            </div>
            <p className="mt-0.5 text-sm font-bold text-white">{totalRows}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <Database className="h-3 w-3 text-amber-400" />
              Latency
            </div>
            <p className="mt-0.5 text-sm font-bold text-white">
              {testResult?.latencyMs != null ? `${testResult.latencyMs}ms` : '—'}
            </p>
          </div>
        </div>

        {testResult && (
          <div
            className={`relative mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
              testResult.success
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            )}
            <span className="font-mono">{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5">
        {(
          [
            { id: 'console' as const, label: 'Query Console', icon: Terminal },
            { id: 'tables' as const, label: `Tables (${tables.length})`, icon: Table },
            { id: 'connection' as const, label: 'Connection', icon: Key },
            { id: 'danger' as const, label: 'Clear Data', icon: Trash2 },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                active
                  ? tab.id === 'danger'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONSOLE */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <Sparkles className="h-3 w-3 text-amber-400" />
              PRESETS
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQueryInput(p.query);
                  handleRunQuery(p.query);
                }}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-800 hover:text-cyan-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2 font-mono text-xs text-slate-400">
              <span className="flex items-center gap-2 text-cyan-400">
                <Terminal className="h-3.5 w-3.5" />
                SQL COMMAND RUNNER
              </span>
              <span className="text-[10px] uppercase tracking-wider">Live SQLite Backend</span>
            </div>

            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              rows={4}
              spellCheck={false}
              placeholder="Enter SQL (e.g. SELECT * FROM teams WHERE epa > 60;)"
              className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-cyan-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleRunQuery();
                }
              }}
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] text-slate-500">⌘/Ctrl + Enter to run</span>
              <button
                type="button"
                onClick={() => handleRunQuery()}
                disabled={isExecuting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isExecuting ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {queryResult && (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-300">RESULTS</span>
                  <span className="font-bold text-emerald-400">{queryResult.rowCount} rows</span>
                </div>
                <div className="text-slate-500">
                  <span className="text-slate-300">{queryResult.executionTimeMs}ms</span>
                </div>
              </div>

              {queryResult.error ? (
                <div className="flex items-center gap-2 border-b border-rose-500/20 bg-rose-500/10 p-4 font-mono text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{queryResult.error}</span>
                </div>
              ) : (
                <div className="max-h-96 overflow-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="sticky top-0 border-b border-slate-800 bg-slate-950 font-mono text-slate-400">
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx} className="px-4 py-2.5 font-medium uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="transition hover:bg-cyan-500/5">
                          {queryResult.columns.map((col, cIdx) => (
                            <td key={cIdx} className="whitespace-nowrap px-4 py-2 text-slate-300">
                              {row[col] === null || row[col] === undefined ? (
                                <span className="italic text-slate-600">NULL</span>
                              ) : typeof row[col] === 'boolean' ? (
                                row[col] ? (
                                  <span className="text-emerald-400">TRUE</span>
                                ) : (
                                  <span className="text-rose-400">FALSE</span>
                                )
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TABLES */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              <Layers className="h-4 w-4 text-cyan-400" />
              Database Tables
            </h3>
            <div className="space-y-1.5">
              {tables.map((tbl) => (
                <button
                  key={tbl.name}
                  type="button"
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition ${
                    selectedTable === tbl.name
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-mono">{tbl.name}</span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                      selectedTable === tbl.name ? 'bg-black/20 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    {tbl.rowCount} rows
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:col-span-2">
            {(() => {
              const currentTbl = tables.find((t) => t.name === selectedTable);
              if (!currentTbl)
                return <div className="text-xs text-slate-500">Select a table to inspect</div>;

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-mono text-base font-bold text-white">{currentTbl.name}</h4>
                      <p className="mt-0.5 text-xs text-slate-400">{currentTbl.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sql = `SELECT * FROM ${currentTbl.name} LIMIT 25;`;
                        setQueryInput(sql);
                        setActiveTab('console');
                        handleRunQuery(sql);
                      }}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 font-mono text-xs text-cyan-400 transition hover:bg-slate-700 hover:text-cyan-300"
                    >
                      Query →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 font-mono text-slate-400">
                          <th className="px-3 py-2">COLUMN</th>
                          <th className="px-3 py-2">TYPE</th>
                          <th className="px-3 py-2">CONSTRAINTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
                        {currentTbl.columns.map((col, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="px-3 py-2 font-semibold text-cyan-300">{col.name}</td>
                            <td className="px-3 py-2 text-slate-300">{col.type}</td>
                            <td className="px-3 py-2">
                              {col.isPrimary && (
                                <span className="mr-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                                  PRIMARY KEY
                                </span>
                              )}
                              {col.nullable === false && (
                                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                                  NOT NULL
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* CONNECTION */}
      {activeTab === 'connection' && (
        <div className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-400">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SQL / Supabase Connection</h3>
              <p className="text-xs text-slate-400">
                Prefer Supabase env vars for real cloud SQL. Optional label string below is cosmetic.
              </p>
            </div>
          </div>

          <div className="mb-4 space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <Database className="h-4 w-4" />
              Supabase setup (real PostgreSQL SQL server)
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-400 leading-relaxed">
              <li>Create a project at supabase.com</li>
              <li>SQL Editor → run <code className="text-cyan-300">supabase/schema.sql</code></li>
              <li>
                Add to <code className="text-cyan-300">.env.local</code>:
                <pre className="mt-1 rounded-lg bg-slate-950 p-2 font-mono text-[10px] text-cyan-200 overflow-x-auto">{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...`}</pre>
              </li>
              <li>Restart <code className="text-cyan-300">npm run dev</code></li>
            </ol>
            <p className="text-[11px] text-slate-500">
              Active engine: <span className="text-emerald-400 font-mono">{backendEngine}</span>
            </p>
          </div>

          <form onSubmit={handleSaveConnectionKey} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-mono font-bold text-slate-300">
                OPTIONAL CONNECTION LABEL / STRING
              </label>
              <textarea
                value={connectionInput}
                onChange={(e) => setConnectionInput(e.target.value)}
                rows={3}
                placeholder="Optional note, e.g. supabase project ref or legacy MSSQL string"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Dual-Key Access Compatibility
              </div>
              <p className="leading-relaxed text-slate-400">
                Admin key unlocks SQL clear/reset. Member key can scout & view analytics only.
                Both roles share the same live database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-blue-500 hover:to-cyan-500"
              >
                Save Connection Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DANGER / CLEAR */}
      {activeTab === 'danger' && (
        <div className="space-y-4">
          {actionBanner && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs ${
                actionBanner.type === 'ok'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              }`}
            >
              {actionBanner.type === 'ok' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span className="font-mono">{actionBanner.text}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Clear all */}
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 to-slate-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-rose-400">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Clear All Data</h3>
                  <p className="text-xs text-slate-400">
                    Wipe every row from teams, matches, scouting, pit & picklist
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-950/30 p-3 text-xs leading-relaxed text-rose-200/80">
                <strong className="text-rose-300">Irreversible.</strong> Wipes scouting tables{' '}
                <em>and</em> Team Central sample data (members, floor log, tasks, notes, demos,
                machine slots, hour appeals). Access keys are kept. Use Reset to restore seeds.
              </div>

              <label className="mb-1.5 block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Type <span className="text-rose-400">CLEAR ALL</span> to confirm
              </label>
              <input
                value={clearConfirm}
                onChange={(e) => setClearConfirm(e.target.value)}
                placeholder="CLEAR ALL"
                disabled={!isAdmin}
                className="mb-3 w-full rounded-xl border border-rose-500/30 bg-slate-950 px-3 py-2.5 font-mono text-xs text-rose-200 placeholder:text-slate-600 focus:border-rose-400 focus:outline-none disabled:opacity-50"
              />

              <button
                type="button"
                onClick={handleClearAll}
                disabled={
                  isClearing ||
                  !isAdmin ||
                  clearConfirm.trim().toUpperCase() !== 'CLEAR ALL'
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                {isClearing ? 'Clearing Database...' : 'Clear All SQL Data'}
              </button>

              {!isAdmin && (
                <p className="mt-2 text-center font-mono text-[11px] text-slate-500">
                  Administrator key required
                </p>
              )}
            </div>

            {/* Reset defaults */}
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-slate-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 p-3 text-cyan-400">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Restore Seed Data</h3>
                  <p className="text-xs text-slate-400">
                    Reload championship demo teams, matches & scouting samples
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-cyan-500/15 bg-cyan-950/20 p-3 text-xs leading-relaxed text-slate-300">
                Replaces current contents with the built-in Reefscape seed dataset. Useful after a
                full clear or when you want a fresh demo state.
              </div>

              <div className="mb-4 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
                  Teams, matches, scouting, pit, picklist
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Access keys preserved
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetDefaults}
                disabled={isResetting || !isAdmin}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25 transition hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                {isResetting ? 'Restoring...' : 'Reset to Defaults'}
              </button>

              {!isAdmin && (
                <p className="mt-2 text-center font-mono text-[11px] text-slate-500">
                  Administrator key required
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
