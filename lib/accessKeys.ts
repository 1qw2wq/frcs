/**
 * Access keys from environment variables.
 *
 * Server (preferred for secrets):
 *   FRC_ADMIN_KEY=...
 *   FRC_MEMBER_KEY=...
 *
 * Client-visible (optional, for UI hints / offline match):
 *   NEXT_PUBLIC_FRC_ADMIN_KEY=...
 *   NEXT_PUBLIC_FRC_MEMBER_KEY=...
 *
 * Resolution order: FRC_* → NEXT_PUBLIC_FRC_* → built-in defaults.
 */

export const DEFAULT_ADMIN_KEY = 'FRC-ADMIN-2025';
export const DEFAULT_MEMBER_KEY = 'FRC-MEMBER-TEAM';

export type AccessRole = 'admin' | 'member';

function pick(...values: Array<string | undefined | null>): string | undefined {
  for (const v of values) {
    const t = typeof v === 'string' ? v.trim() : '';
    if (t) return t;
  }
  return undefined;
}

/** Server-side admin key (use in API routes). */
export function getAdminKey(): string {
  return (
    pick(
      process.env.FRC_ADMIN_KEY,
      process.env.NEXT_PUBLIC_FRC_ADMIN_KEY,
      process.env.ADMIN_KEY
    ) || DEFAULT_ADMIN_KEY
  );
}

/** Server-side member key (use in API routes). */
export function getMemberKey(): string {
  return (
    pick(
      process.env.FRC_MEMBER_KEY,
      process.env.NEXT_PUBLIC_FRC_MEMBER_KEY,
      process.env.MEMBER_KEY
    ) || DEFAULT_MEMBER_KEY
  );
}

/** Client-safe defaults baked at build time via NEXT_PUBLIC_*. */
export function getClientAdminKey(): string {
  return pick(process.env.NEXT_PUBLIC_FRC_ADMIN_KEY, process.env.NEXT_PUBLIC_ADMIN_KEY) || DEFAULT_ADMIN_KEY;
}

export function getClientMemberKey(): string {
  return pick(process.env.NEXT_PUBLIC_FRC_MEMBER_KEY, process.env.NEXT_PUBLIC_MEMBER_KEY) || DEFAULT_MEMBER_KEY;
}

export function resolveRoleFromKey(inputKey: string | null | undefined): AccessRole | null {
  if (!inputKey || !String(inputKey).trim()) return null;
  const trimmed = String(inputKey).trim();
  const admin = getAdminKey();
  const member = getMemberKey();
  if (trimmed === admin) return 'admin';
  if (trimmed === member) return 'member';
  return null;
}

export function isAdminAccessKey(key: string | null | undefined): boolean {
  return resolveRoleFromKey(key) === 'admin';
}

export function isMemberAccessKey(key: string | null | undefined): boolean {
  return resolveRoleFromKey(key) === 'member';
}

export function getAccessKeyConfig() {
  const adminFromEnv = Boolean(
    pick(process.env.FRC_ADMIN_KEY, process.env.NEXT_PUBLIC_FRC_ADMIN_KEY, process.env.ADMIN_KEY)
  );
  const memberFromEnv = Boolean(
    pick(process.env.FRC_MEMBER_KEY, process.env.NEXT_PUBLIC_FRC_MEMBER_KEY, process.env.MEMBER_KEY)
  );
  return {
    adminFromEnv,
    memberFromEnv,
    usingDefaults: !adminFromEnv && !memberFromEnv,
    // Only expose actual key values to the client when NEXT_PUBLIC_ is set
    // (or when using built-in defaults for local demo).
    publicAdminKey: pick(process.env.NEXT_PUBLIC_FRC_ADMIN_KEY, process.env.NEXT_PUBLIC_ADMIN_KEY) ||
      (!adminFromEnv ? DEFAULT_ADMIN_KEY : undefined),
    publicMemberKey: pick(process.env.NEXT_PUBLIC_FRC_MEMBER_KEY, process.env.NEXT_PUBLIC_MEMBER_KEY) ||
      (!memberFromEnv ? DEFAULT_MEMBER_KEY : undefined),
    // Hint strings for login UI when keys are server-only secrets
    adminConfigured: true,
    memberConfigured: true,
    source: {
      admin: adminFromEnv
        ? process.env.FRC_ADMIN_KEY
          ? 'FRC_ADMIN_KEY'
          : process.env.NEXT_PUBLIC_FRC_ADMIN_KEY
            ? 'NEXT_PUBLIC_FRC_ADMIN_KEY'
            : 'ADMIN_KEY'
        : 'default',
      member: memberFromEnv
        ? process.env.FRC_MEMBER_KEY
          ? 'FRC_MEMBER_KEY'
          : process.env.NEXT_PUBLIC_FRC_MEMBER_KEY
            ? 'NEXT_PUBLIC_FRC_MEMBER_KEY'
            : 'MEMBER_KEY'
        : 'default',
    },
  };
}
