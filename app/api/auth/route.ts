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
    usingDefaults: false,
    keysConfigured: config.keysConfigured,
    adminFromEnv: config.adminFromEnv,
    memberFromEnv: config.memberFromEnv,
    adminConfigured: config.adminConfigured,
    memberConfigured: config.memberConfigured,
    source: config.source,
    // Quick-select values ONLY when NEXT_PUBLIC_* is set — never invent demo secrets
    publicAdminKey: config.publicAdminKey ?? null,
    publicMemberKey: config.publicMemberKey ?? null,
    adminKeySet: Boolean(getAdminKey()),
    memberKeySet: Boolean(getMemberKey()),
    adminKeyLength: getAdminKey().length,
    memberKeyLength: getMemberKey().length,
    missingKeys: [
      ...(!getAdminKey() ? ['FRC_ADMIN_KEY'] : []),
      ...(!getMemberKey() ? ['FRC_MEMBER_KEY'] : []),
    ],
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
 * Keys come only from env (FRC_ADMIN_KEY / FRC_MEMBER_KEY). No built-in defaults.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || body.type || 'validate_key').trim();

    if (!getAdminKey() && !getMemberKey()) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Access keys are not configured. Set FRC_ADMIN_KEY and FRC_MEMBER_KEY in the environment and restart the server.',
          missingKeys: ['FRC_ADMIN_KEY', 'FRC_MEMBER_KEY'],
        },
        { status: 503 }
      );
    }

    if (action === 'register_member' || action === 'member_register') {
      if (!getMemberKey()) {
        return NextResponse.json(
          {
            success: false,
            message: 'FRC_MEMBER_KEY is not set. Add it to the environment and restart.',
            missingKeys: ['FRC_MEMBER_KEY'],
          },
          { status: 503 }
        );
      }
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
      if (!getMemberKey()) {
        return NextResponse.json(
          {
            success: false,
            message: 'FRC_MEMBER_KEY is not set. Add it to the environment and restart.',
            missingKeys: ['FRC_MEMBER_KEY'],
          },
          { status: 503 }
        );
      }
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

    // Default: validate shared access key from env only
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
          message:
            'Invalid access key. It must match FRC_ADMIN_KEY or FRC_MEMBER_KEY from your environment.',
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
