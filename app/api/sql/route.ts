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
  // When FRC_ADMIN_KEY is configured, destructive ops must present a valid admin key.
  if (isAdminAccessKey(accessKey)) return { ok: true };
  if (isMemberAccessKey(accessKey)) {
    return { ok: false, error: 'Administrator access key required.' };
  }
  if (accessKey) {
    return { ok: false, error: 'Invalid access key. Check FRC_ADMIN_KEY in your environment.' };
  }
  // No key provided — allow only if admin key is not configured (local open demo)
  const adminConfigured = Boolean(
    (process.env.FRC_ADMIN_KEY || process.env.NEXT_PUBLIC_FRC_ADMIN_KEY || '').trim()
  );
  if (adminConfigured) {
    return {
      ok: false,
      error: 'Administrator access key required. Sign in as admin and retry.',
    };
  }
  return { ok: true };
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
      if (
        upper === 'CLEAR ALL DATA' ||
        upper === 'CLEAR ALL' ||
        upper === 'CLEAR' ||
        upper === 'TRUNCATE ALL' ||
        upper.startsWith('CLEAR DATABASE')
      ) {
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
      const { checkSqlConnection } = await import('@/lib/dataStore');
      const result = await checkSqlConnection();
      return NextResponse.json({
        success: result.success,
        connected: result.connected,
        status: result.status,
        message: result.message,
        serverType: result.serverType,
        latencyMs: result.latencyMs,
        ping: result.ping,
        tables: result.tablesCount,
        totalRows: result.totalRows,
        tableStats: result.tables,
        backend: result.backend,
        supabaseConfigured: result.supabaseConfigured,
        databaseUrlConfigured: result.databaseUrlConfigured,
        startClean: result.startClean,
        checkedAt: result.checkedAt,
        error: result.error,
      }, { status: result.connected ? 200 : 503 });
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

  // Live connectivity check (same as /api/sql/status)
  if (action === 'status' || action === 'health' || action === 'ping' || !action) {
    const { checkSqlConnection } = await import('@/lib/dataStore');
    const result = await checkSqlConnection();
    const version =
      result.engine === 'postgres'
        ? 'Supabase PostgreSQL pooler (pg)'
        : result.engine === 'supabase'
          ? 'Supabase PostgreSQL v3.0'
          : 'SQLite Compatible v3.0';
    return NextResponse.json(
      {
        ...result,
        version,
        tablesCount: result.tablesCount,
      },
      {
        status: result.connected ? 200 : 503,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
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
