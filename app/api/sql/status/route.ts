import { NextResponse } from 'next/server';
import { checkSqlConnection } from '@/lib/dataStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/sql/status
 * Live SQL server connectivity check (SELECT 1 / REST probe).
 * No auth required — safe read-only health endpoint.
 */
export async function GET() {
  try {
    const result = await checkSqlConnection();
    const statusCode = result.connected ? 200 : 503;
    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        success: false,
        status: 'error',
        message: error?.message || 'SQL status check failed',
        error: error?.message || String(error),
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}

/** POST also supported for clients that prefer it */
export async function POST() {
  return GET();
}
