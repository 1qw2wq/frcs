import { NextRequest, NextResponse } from 'next/server';
import {
  getFullDataset,
  upsertScoutingEntry,
  upsertPitData,
  replacePicklist,
  clearAllData,
  resetToDefaults,
  getAllScoutingEntries,
  getEngineLabel,
} from '@/lib/dataStore';
import { isAdminAccessKey, isMemberAccessKey } from '@/lib/accessKeys';
import type { MatchScoutingEntry, PitScoutingData, PicklistTeam } from '@/types/frc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getFullDataset();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load dataset', backend: getEngineLabel() },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type: string = body.type;
    const payload = body.data ?? body.payload;
    const accessKey: string | undefined = body.accessKey || body.adminKey || req.headers.get('x-frc-access-key') || undefined;

    if (type === 'scoutingEntry' || type === 'submit_scouting') {
      const entry = await upsertScoutingEntry(payload as MatchScoutingEntry);
      const total = (await getAllScoutingEntries()).length;
      return NextResponse.json({ success: true, entry, totalEntries: total, backend: getEngineLabel() });
    }

    if (type === 'pitData' || type === 'submit_pit') {
      const pitEntry = await upsertPitData(payload as PitScoutingData);
      return NextResponse.json({ success: true, pitEntry, backend: getEngineLabel() });
    }

    if (type === 'picklist' || type === 'update_picklist') {
      if (!Array.isArray(payload)) {
        return NextResponse.json({ error: 'Picklist payload must be an array' }, { status: 400 });
      }
      const picklist = await replacePicklist(payload as PicklistTeam[]);
      return NextResponse.json({ success: true, picklist, backend: getEngineLabel() });
    }

    if (type === 'clear_all' || type === 'clearAll') {
      if (accessKey && isMemberAccessKey(accessKey) && !isAdminAccessKey(accessKey)) {
        return NextResponse.json(
          { error: 'Administrator access key required to clear all data.' },
          { status: 403 }
        );
      }
      if (accessKey && !isAdminAccessKey(accessKey) && !isMemberAccessKey(accessKey)) {
        // Unknown key — still allow only if no key was required; reject bad keys
        return NextResponse.json(
          { error: 'Invalid access key. Use FRC_ADMIN_KEY from your environment.' },
          { status: 403 }
        );
      }
      const result = await clearAllData();
      const dataset = await getFullDataset();
      return NextResponse.json({
        success: true,
        message: `All data cleared — scouting, members, events, tasks (${result.backend})`,
        ...result,
        dataset,
      });
    }

    if (type === 'reset_defaults' || type === 'resetDefaults') {
      if (accessKey && isMemberAccessKey(accessKey) && !isAdminAccessKey(accessKey)) {
        return NextResponse.json(
          { error: 'Administrator access key required to reset defaults.' },
          { status: 403 }
        );
      }
      if (accessKey && !isAdminAccessKey(accessKey) && !isMemberAccessKey(accessKey)) {
        return NextResponse.json(
          { error: 'Invalid access key. Use FRC_ADMIN_KEY from your environment.' },
          { status: 403 }
        );
      }
      const result = await resetToDefaults();
      const dataset = await getFullDataset();
      return NextResponse.json({ success: true, ...result, dataset });
    }

    return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error processing data request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const accessKey =
      req.headers.get('x-frc-access-key') ||
      req.nextUrl.searchParams.get('accessKey') ||
      undefined;
    if (accessKey && isMemberAccessKey(accessKey) && !isAdminAccessKey(accessKey)) {
      return NextResponse.json(
        { error: 'Administrator access key required to clear all data.' },
        { status: 403 }
      );
    }
    if (accessKey && !isAdminAccessKey(accessKey) && !isMemberAccessKey(accessKey)) {
      return NextResponse.json(
        { error: 'Invalid access key. Use FRC_ADMIN_KEY from your environment.' },
        { status: 403 }
      );
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
      { error: error.message || 'Failed to clear data' },
      { status: 500 }
    );
  }
}
