import { NextRequest, NextResponse } from 'next/server';
import {
  getAccessKeyConfig,
  resolveRoleFromKey,
  getAdminKey,
  getMemberKey,
} from '@/lib/accessKeys';
import {
  loginMemberAccount,
  registerMemberAccount,
  listMemberAccounts,
} from '@/lib/memberAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Public config for the login UI (does not leak server-only secret keys). */
export async function GET(req: NextRequest) {
  const config = getAccessKeyConfig();
  const action = req.nextUrl.searchParams.get('action');

  if (action === 'member_count') {
    try {
      const accounts = await listMemberAccounts();
      return NextResponse.json({ success: true, count: accounts.length });
    } catch {
      return NextResponse.json({ success: true, count: 0 });
    }
  }

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
    // Auth modes available in the UI
    modes: {
      adminToken: true,
      memberRegister: true,
      memberLogin: true,
    },
  });
}

/**
 * Auth actions:
 *  - { action: 'validate_key' | omit, key }           → admin/member token login
 *  - { action: 'register_member', name, password, memberToken }
 *  - { action: 'login_member', name, password }
 *
 * Member register requires the shared member access token (same token model as admin).
 * Member login uses only the name + password set at registration; response still
 * returns accessToken (= FRC_MEMBER_KEY) for API calls.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || body.type || 'validate_key').trim();

    if (action === 'register_member' || action === 'member_register') {
      const result = await registerMemberAccount({
        name: body.name || body.displayName,
        password: body.password,
        memberToken: body.memberToken || body.token || body.accessKey || body.key,
      });
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        role: 'member' as const,
        accessToken: result.accessToken,
        account: result.account,
        message: `Welcome, ${result.account.name}. Account created — use your name & password next time (token only needed once).`,
      });
    }

    if (action === 'login_member' || action === 'member_login') {
      const result = await loginMemberAccount({
        name: body.name || body.displayName,
        password: body.password,
      });
      if (!result.success) {
        return NextResponse.json(result, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        role: 'member' as const,
        accessToken: result.accessToken,
        account: result.account,
        message: `Welcome back, ${result.account.name}. Member portal unlocked.`,
      });
    }

    // Default: validate shared access key (admin or legacy member-token login)
    const key = String(body.key || body.accessKey || body.token || '').trim();
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
      accessToken: key,
      message:
        role === 'admin'
          ? 'Administrator Access Granted. Full control console unlocked.'
          : 'Member Access Granted. For personal accounts, register with your name + password + this token once.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Auth error' },
      { status: 500 }
    );
  }
}
