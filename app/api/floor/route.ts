import { NextRequest, NextResponse } from 'next/server';
import { isAdminAccessKey, isMemberAccessKey } from '@/lib/accessKeys';
import {
  createFloorEntryCode,
  listFloorEntryCodes,
  redeemFloorEntryCode,
  revokeFloorEntryCode,
  deleteFloorEntryCode,
  listFloorLog,
} from '@/lib/floorCodes';
import { getFullDataset } from '@/lib/dataStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function keyFrom(req: NextRequest, body: any) {
  return (
    body?.accessKey ||
    body?.adminKey ||
    req.headers.get('x-frc-access-key') ||
    null
  );
}

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get('action') || 'list_log';
    if (action === 'list_codes') {
      const accessKey = req.headers.get('x-frc-access-key');
      if (accessKey && !isAdminAccessKey(accessKey)) {
        return NextResponse.json({ error: 'Administrator key required.' }, { status: 403 });
      }
      const codes = await listFloorEntryCodes();
      return NextResponse.json({ success: true, codes });
    }
    const floorLog = await listFloorLog();
    return NextResponse.json({ success: true, floorLog });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Floor API error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || body.type || '').trim();
    const accessKey = keyFrom(req, body);

    if (action === 'create_code' || action === 'generate_code') {
      if (accessKey && !isAdminAccessKey(accessKey)) {
        return NextResponse.json({ error: 'Administrator key required to generate entry codes.' }, { status: 403 });
      }
      if (!accessKey) {
        // still allow when UI forgot key but recommend it — prefer reject without admin
        return NextResponse.json(
          { error: 'Administrator access key required to generate entry codes.' },
          { status: 403 }
        );
      }
      const code = await createFloorEntryCode({
        label: body.label,
        createdBy: body.createdBy || 'admin',
        expiresInMinutes:
          body.expiresInMinutes === null || body.expiresInMinutes === undefined
            ? 480
            : Number(body.expiresInMinutes),
        maxUses: body.maxUses != null ? Number(body.maxUses) : 200,
        codeLength: body.codeLength != null ? Number(body.codeLength) : 6,
      });
      const codes = await listFloorEntryCodes();
      return NextResponse.json({ success: true, code, codes });
    }

    if (action === 'revoke_code') {
      if (!accessKey || !isAdminAccessKey(accessKey)) {
        return NextResponse.json({ error: 'Administrator key required.' }, { status: 403 });
      }
      const id = String(body.id || '');
      await revokeFloorEntryCode(id);
      const codes = await listFloorEntryCodes();
      return NextResponse.json({ success: true, codes });
    }

    if (action === 'delete_code') {
      if (!accessKey || !isAdminAccessKey(accessKey)) {
        return NextResponse.json({ error: 'Administrator key required.' }, { status: 403 });
      }
      await deleteFloorEntryCode(String(body.id || ''));
      const codes = await listFloorEntryCodes();
      return NextResponse.json({ success: true, codes });
    }

    if (action === 'redeem' || action === 'check_in' || action === 'log_entry') {
      // Members (or admin testing) redeem a code to log enter time
      if (accessKey && !isMemberAccessKey(accessKey) && !isAdminAccessKey(accessKey)) {
        return NextResponse.json({ error: 'Invalid access key.' }, { status: 403 });
      }
      const result = await redeemFloorEntryCode({
        code: body.code || body.entryCode,
        memberName: body.memberName || body.name || body.studentName,
        memberId: body.memberId || body.accountId,
        subteam: body.subteam,
        studentId: body.studentId,
      });
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      const floorLog = await listFloorLog();
      let dataset = null;
      try {
        dataset = await getFullDataset();
      } catch {
        /* ignore */
      }
      return NextResponse.json({
        success: true,
        entry: result.entry,
        code: result.code,
        floorLog,
        dataset,
        message: `Logged enter time ${result.entry.checkInTime} for ${result.entry.studentName}`,
      });
    }

    if (action === 'list_codes') {
      if (!accessKey || !isAdminAccessKey(accessKey)) {
        return NextResponse.json({ error: 'Administrator key required.' }, { status: 403 });
      }
      const codes = await listFloorEntryCodes();
      return NextResponse.json({ success: true, codes });
    }

    return NextResponse.json({ error: 'Unknown floor action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Floor API error', success: false }, { status: 500 });
  }
}
