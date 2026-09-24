'use client';

import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SqlQueryResult, SqlTableDefinition } from '@/lib/sqlEngine';

export const SqlServerManager: React.FC = () => {
  const { isAdmin, sqlConnectionKey, setSqlConnectionKey } = useAuthKey();
  const [connectionInput, setConnectionInput] = useState(sqlConnectionKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // SQL Console state
  const [queryInput, setQueryInput] = useState<string>('SELECT number, name, epa, rank, wins, drivetrain FROM teams ORDER BY epa DESC LIMIT 10;');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);

  // Schema state
  const [tables, setTables] = useState<SqlTableDefinition[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('teams');
  const [activeTab, setActiveTab] = useState<'console' | 'tables' | 'connection'>('console');

  const fetchSchema = React.useCallback(async () => {
    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_schema' }),
      });
      const data = await res.json();
      if (data.tables) {
        setTables(data.tables);
      }
    } catch (e) {
      console.error('Error fetching schema', e);
    }
  }, []);

  const handleRunQuery = React.useCallback(async (sqlToRun?: string) => {
    const sql = (sqlToRun || queryInput).trim();
    if (!sql) return;
    setIsExecuting(true);
    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          query: sql,
          connectionKey: sqlConnectionKey,
        }),
      });
      const data: SqlQueryResult = await res.json();
      setQueryResult(data);
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
  }, [queryInput, sqlConnectionKey]);

  // Load schema on mount
  useEffect(() => {
    let active = true;
    (async () => {
      if (active) {
        await fetchSchema();
        await handleRunQuery(queryInput);
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
      });
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

  const presets = [
    { label: 'Top Teams by EPA', query: 'SELECT number, name, epa, rank, wins, drivetrain FROM teams ORDER BY epa DESC;' },
    { label: 'Match Scouting Log', query: 'SELECT match_number, team_number, scout_name, cycles, climb_status FROM match_scouting ORDER BY match_number DESC;' },
    { label: 'Pit Inspections', query: 'SELECT team_number, drivetrain, weight_lbs, battery_voltage, inspection_passed FROM pit_scouting;' },
    { label: 'Tournament Matches', query: 'SELECT match_number, comp_level, red_teams, blue_teams, red_score, blue_score, predicted_winner FROM matches;' },
    { label: 'Access Keys Status', query: 'SELECT role, key_status, permissions FROM access_keys;' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">SQL Server Backend Connector</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  READY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Link up your SQL Server backend with your access key. Consistent across all pages for both Administrator and Member roles.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadDump}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Download SQL Server script (DDL + Inserts)"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export .SQL Dump</span>
            </button>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition disabled:opacity-60"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isTesting ? 'Testing Ping...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Status Indicator Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3 font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-500">BACKEND KEY:</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 text-[11px] truncate max-w-xs">
              {sqlConnectionKey || 'Using Default In-Memory Relational Engine'}
            </span>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${
                testResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
              <span>{testResult.message}</span>
              {testResult.latencyMs && <span className="opacity-75">({testResult.latencyMs}ms)</span>}
            </div>
          )}
        </div>
      </div>

      {/* SQL Manager Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'console'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Interactive Query Console</span>
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'tables'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Tables & Schema ({tables.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('connection')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'connection'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Connection Key Settings</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE QUERY CONSOLE */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-400" />
              PRESET QUERIES:
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQueryInput(p.query);
                  handleRunQuery(p.query);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition text-[11px]"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* SQL Editor Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                SQL COMMAND RUNNER
              </span>
              <span>Direct execution against SQL Server backend</span>
            </div>

            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              rows={3}
              placeholder="Enter SQL statement (e.g. SELECT * FROM teams WHERE epa > 60;)"
              className="w-full bg-slate-950 text-cyan-200 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-slate-500 font-mono">
                Press Run to execute query on active SQL Server
              </span>
              <button
                onClick={() => handleRunQuery()}
                disabled={isExecuting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {/* Query Result Grid */}
          {queryResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 font-semibold">QUERY RESULTS</span>
                  <span className="text-emerald-400 font-bold">{queryResult.rowCount} rows</span>
                </div>
                <div className="text-slate-500">
                  Execution time: <span className="text-slate-300">{queryResult.executionTimeMs}ms</span>
                </div>
              </div>

              {queryResult.error ? (
                <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{queryResult.error}</span>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 scrollbar-thin">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono">
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx} className="px-4 py-2.5 font-medium uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                          {queryResult.columns.map((col, cIdx) => (
                            <td key={cIdx} className="px-4 py-2 text-slate-300 whitespace-nowrap">
                              {row[col] === null || row[col] === undefined
                                ? <span className="text-slate-600 italic">NULL</span>
                                : typeof row[col] === 'boolean'
                                ? row[col] ? <span className="text-emerald-400">TRUE</span> : <span className="text-rose-400">FALSE</span>
                                : String(row[col])}
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

      {/* TAB 2: SCHEMA EXPLORER */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Database Tables
            </h3>
            <div className="space-y-1.5">
              {tables.map((tbl) => (
                <button
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition text-left ${
                    selectedTable === tbl.name
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-mono">{tbl.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    selectedTable === tbl.name ? 'bg-blue-700 text-white' : 'bg-slate-950 text-slate-400'
                  }`}>
                    {tbl.rowCount} rows
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {(() => {
              const currentTbl = tables.find((t) => t.name === selectedTable);
              if (!currentTbl) return <div className="text-xs text-slate-500">Select a table to inspect</div>;

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-base font-bold text-white font-mono">{currentTbl.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{currentTbl.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        const sql = `SELECT * FROM ${currentTbl.name} LIMIT 25;`;
                        setQueryInput(sql);
                        setActiveTab('console');
                        handleRunQuery(sql);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-mono transition"
                    >
                      Query Table &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="py-2 px-3">COLUMN NAME</th>
                          <th className="py-2 px-3">DATA TYPE</th>
                          <th className="py-2 px-3">CONSTRAINTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
                        {currentTbl.columns.map((col, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 text-cyan-300 font-semibold">{col.name}</td>
                            <td className="py-2 px-3 text-slate-300">{col.type}</td>
                            <td className="py-2 px-3">
                              {col.isPrimary && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold mr-1">
                                  PRIMARY KEY
                                </span>
                              )}
                              {col.nullable === false && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
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

      {/* TAB 3: CONNECTION KEY SETTINGS */}
      {activeTab === 'connection' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SQL Server Backend Connection Key</h3>
              <p className="text-xs text-slate-400">
                Configure the connection key provided for your SQL server backend
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveConnectionKey} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                SQL SERVER CONNECTION KEY / CONNECTION STRING
              </label>
              <textarea
                value={connectionInput}
                onChange={(e) => setConnectionInput(e.target.value)}
                rows={3}
                placeholder="e.g. Server=tcp:myserver.database.windows.net,1433;Database=frc_db;User Id=frc_admin;Password=secret;"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supports Microsoft SQL Server connection keys, PostgreSQL URIs, or custom SQL API endpoints.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Dual-Key Access Compatibility
              </div>
              <p className="text-slate-400 leading-relaxed">
                Once saved, all queries executed across pages and role views (Administrator and Member) will sync through this SQL server endpoint seamlessly.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
              >
                Save Connection Key
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
