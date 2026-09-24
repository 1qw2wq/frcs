import { NextRequest, NextResponse } from 'next/server';
import {
  getAccessKeyConfig,
  resolveRoleFromKey,
  getAdminKey,
  getMemberKey,
} from '@/lib/accessKeys';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Public config for the login UI (does not leak server-only secret keys). */
export async function GET() {
  const config = getAccessKeyConfig();
  return NextResponse.json({
    success: true,
    usingDefaults: config.usingDefaults,
    adminFromEnv: config.adminFromEnv,
    memberFromEnv: config.memberFromEnv,
    source: config.source,
    // Quick-select values only when safe to show in the browser
    publicAdminKey: config.publicAdminKey ?? null,
    publicMemberKey: config.publicMemberKey ?? null,
    // Length hints so admins know env is loaded without revealing the secret
    adminKeySet: Boolean(getAdminKey()),
    memberKeySet: Boolean(getMemberKey()),
    adminKeyLength: getAdminKey().length,
    memberKeyLength: getMemberKey().length,
  });
}

/** Validate an access key against env-configured admin/member keys. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = String(body.key || body.accessKey || '').trim();
    if (!key) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid access key.' },
        { status: 400 }
      );
    }

    const role = resolveRoleFromKey(key);
    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Access Key. Check FRC_ADMIN_KEY / FRC_MEMBER_KEY in your environment.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      role,
      message:
        role === 'admin'
          ? 'Administrator Access Granted. Full control console unlocked.'
          : 'Member Access Granted. Student portal & scouting unlocked.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Auth error' },
      { status: 500 }
    );
  }
}
