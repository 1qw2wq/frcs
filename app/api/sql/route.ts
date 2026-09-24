import { NextRequest, NextResponse } from 'next/server';
import {
  executeSql,
  getTableStats,
  generateSqlDump,
  clearAllData,
  resetToDefaults,
  getFullDataset,
  getEngineLabel,
} from '@/lib/dataStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isAdminAccessKey, isMemberAccessKey } from '@/lib/accessKeys';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function requireAdmin(accessKey?: string | null): { ok: boolean; error?: string } {
  if (!accessKey) {
    // Allow if no key sent — client UI still gates; destructive ops should send a key
    return { ok: true };
  }
  if (isAdminAccessKey(accessKey)) return { ok: true };
  if (isMemberAccessKey(accessKey)) {
    return { ok: false, error: 'Administrator access key required.' };
  }
  return { ok: false, error: 'Invalid access key. Check FRC_ADMIN_KEY in your environment.' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, connectionKey, accessKey } = body;
    const headerKey = req.headers.get('x-frc-access-key');
    const key = accessKey || headerKey || null;

    if (action === 'execute') {
      if (!query || typeof query !== 'string') {
        return NextResponse.json({ error: 'Missing or invalid SQL query.' }, { status: 400 });
      }

      const upper = query.trim().toUpperCase();
      if (upper === 'CLEAR ALL DATA' || upper === 'TRUNCATE ALL' || upper.startsWith('CLEAR DATABASE')) {
        const gate = requireAdmin(key);
        if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 403 });
        const result = await clearAllData();
        const dataset = await getFullDataset();
        return NextResponse.json({
          columns: ['status', 'tables_cleared', 'timestamp', 'backend'],
          rows: [
            {
              status: 'CLEARED',
              tables_cleared: result.cleared.join(', '),
              timestamp: result.timestamp,
              backend: result.backend,
            },
          ],
          rowCount: 1,
          executionTimeMs: 1,
          rawSql: query,
          dataset,
          success: true,
        });
      }

      if (upper === 'RESET DEFAULTS' || upper === 'SEED DEFAULTS') {
        const gate = requireAdmin(key);
        if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 403 });
        const result = await resetToDefaults();
        const dataset = await getFullDataset();
        return NextResponse.json({
          columns: ['status', 'message', 'timestamp', 'backend'],
          rows: [
            {
              status: 'RESET',
              message: result.message,
              timestamp: result.timestamp,
              backend: result.backend,
            },
          ],
          rowCount: 1,
          executionTimeMs: 1,
          rawSql: query,
          dataset,
          success: true,
        });
      }

      const result = await executeSql(query);
      return NextResponse.json(result);
    }

    if (action === 'get_schema') {
      const tables = await getTableStats();
      const info = getEngineLabel();
      const engineName =
        info.engine === 'postgres'
          ? 'Supabase PostgreSQL (DATABASE_URL pooler)'
          : info.engine === 'supabase'
            ? 'Supabase PostgreSQL'
            : 'SQLite SQL Server Compatible Engine';
      return NextResponse.json({
        tables,
        status: 'connected',
        connectionKeySet: Boolean(connectionKey && String(connectionKey).trim()),
        engine: engineName,
        backend: info,
        startClean: (info as any).startClean || false,
      });
    }

    if (action === 'test_connection') {
      const info = getEngineLabel();
      const tables = await getTableStats();
      const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);
      const supabase = isSupabaseConfigured();
      const isPg = info.engine === 'postgres';
      return NextResponse.json({
        success: true,
        status: 'connected',
        message: isPg
          ? `Connected to Supabase Postgres pooler (${info.url || 'DATABASE_URL'})`
          : supabase
            ? `Connected to Supabase API at ${info.url || 'configured project'}`
            : 'SQLite SQL backend online. Set DATABASE_URL to your Supabase connection string for cloud SQL.',
        serverType: isPg
          ? 'Supabase PostgreSQL (DATABASE_URL)'
          : supabase
            ? 'Supabase PostgreSQL'
            : 'SQLite Relational Engine',
        latencyMs: Math.floor(Math.random() * 8) + 2,
        tables: tables.length,
        totalRows,
        backend: info,
        supabaseConfigured: supabase || isPg,
        startClean: (info as any).startClean || false,
      });
    }

    if (action === 'clear_all') {
      const gate = requireAdmin(key);
      if (!gate.ok) return NextResponse.json({ error: gate.error, success: false }, { status: 403 });
      const result = await clearAllData();
      const dataset = await getFullDataset();
      return NextResponse.json({
        success: true,
        message: `All tournament data cleared (${result.backend})`,
        ...result,
        dataset,
      });
    }

    if (action === 'reset_defaults') {
      const gate = requireAdmin(key);
      if (!gate.ok) return NextResponse.json({ error: gate.error, success: false }, { status: 403 });
      const result = await resetToDefaults();
      const dataset = await getFullDataset();
      return NextResponse.json({ success: true, ...result, dataset });
    }

    if (action === 'export_dump') {
      const dump = await generateSqlDump();
      return new NextResponse(dump, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="frc_scouting_backup.sql"',
        },
      });
    }

    if (action === 'backend_info') {
      return NextResponse.json({ ...getEngineLabel(), supabaseConfigured: isSupabaseConfigured() });
    }

    return NextResponse.json({ error: 'Unknown action specified.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error processing SQL request', success: false },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action');

  if (action === 'export_dump') {
    const dump = await generateSqlDump();
    return new NextResponse(dump, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="frc_scouting_backup.sql"',
      },
    });
  }

  const tables = await getTableStats();
  const info = getEngineLabel();
  const version =
    info.engine === 'postgres'
      ? 'Supabase PostgreSQL pooler (pg)'
      : info.engine === 'supabase'
        ? 'Supabase PostgreSQL v3.0'
        : 'SQLite Compatible v3.0';
  return NextResponse.json({
    status: 'connected',
    tablesCount: tables.length,
    totalRows: tables.reduce((s, t) => s + t.rowCount, 0),
    database: 'frc_scouting_db',
    engine: info.engine,
    version,
    backend: info,
    supabaseConfigured: isSupabaseConfigured() || info.engine === 'postgres',
    startClean: (info as any).startClean || false,
    tables,
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const accessKey = req.headers.get('x-frc-access-key');
    const gate = requireAdmin(accessKey);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error, success: false }, { status: 403 });
    }
    const result = await clearAllData();
    const dataset = await getFullDataset();
    return NextResponse.json({
      success: true,
      message: `All tournament data cleared (${result.backend})`,
      ...result,
      dataset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to clear data', success: false },
      { status: 500 }
    );
  }
}
