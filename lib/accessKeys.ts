/**
 * Access keys — environment variables only. No built-in demo defaults.
 *
 * Required server secrets:
 *   FRC_ADMIN_KEY=...
 *   FRC_MEMBER_KEY=...
 *
 * Optional client-visible copies (for UI quick-fill only — still not "defaults"):
 *   NEXT_PUBLIC_FRC_ADMIN_KEY=...
 *   NEXT_PUBLIC_FRC_MEMBER_KEY=...
 *
 * Aliases also accepted: ADMIN_KEY / MEMBER_KEY / NEXT_PUBLIC_ADMIN_KEY / NEXT_PUBLIC_MEMBER_KEY
 *
 * Resolution order: FRC_* → NEXT_PUBLIC_FRC_* → ADMIN_KEY/MEMBER_KEY aliases.
 * If nothing is set, keys are empty and login/register will fail until you set env.
 */

export type AccessRole = 'admin' | 'member';

function pick(...values: Array<string | undefined | null>): string | undefined {
  for (const v of values) {
    const t = typeof v === 'string' ? v.trim() : '';
    if (t) return t;
  }
  return undefined;
}

/** True when a non-empty admin key is present in the environment. */
export function isAdminKeyConfigured(): boolean {
  return Boolean(getAdminKey());
}

/** True when a non-empty member key is present in the environment. */
export function isMemberKeyConfigured(): boolean {
  return Boolean(getMemberKey());
}

/** Server-side admin key (API routes). Empty string if not set in env. */
export function getAdminKey(): string {
  return (
    pick(
      process.env.FRC_ADMIN_KEY,
      process.env.NEXT_PUBLIC_FRC_ADMIN_KEY,
      process.env.ADMIN_KEY,
      process.env.NEXT_PUBLIC_ADMIN_KEY
    ) || ''
  );
}

/** Server-side member key (API routes). Empty string if not set in env. */
export function getMemberKey(): string {
  return (
    pick(
      process.env.FRC_MEMBER_KEY,
      process.env.NEXT_PUBLIC_FRC_MEMBER_KEY,
      process.env.MEMBER_KEY,
      process.env.NEXT_PUBLIC_MEMBER_KEY
    ) || ''
  );
}

/**
 * Client bake-time values from NEXT_PUBLIC_* only.
 * Never falls back to a hardcoded demo key.
 */
export function getClientAdminKey(): string {
  return pick(process.env.NEXT_PUBLIC_FRC_ADMIN_KEY, process.env.NEXT_PUBLIC_ADMIN_KEY) || '';
}

export function getClientMemberKey(): string {
  return pick(process.env.NEXT_PUBLIC_FRC_MEMBER_KEY, process.env.NEXT_PUBLIC_MEMBER_KEY) || '';
}

export function resolveRoleFromKey(inputKey: string | null | undefined): AccessRole | null {
  if (!inputKey || !String(inputKey).trim()) return null;
  const trimmed = String(inputKey).trim();
  const admin = getAdminKey();
  const member = getMemberKey();
  // Empty env keys must never match (including accidental empty-string equality)
  if (admin && trimmed === admin) return 'admin';
  if (member && trimmed === member) return 'member';
  return null;
}

export function isAdminAccessKey(key: string | null | undefined): boolean {
  return resolveRoleFromKey(key) === 'admin';
}

export function isMemberAccessKey(key: string | null | undefined): boolean {
  return resolveRoleFromKey(key) === 'member';
}

export function getAccessKeyConfig() {
  const adminRaw = pick(
    process.env.FRC_ADMIN_KEY,
    process.env.NEXT_PUBLIC_FRC_ADMIN_KEY,
    process.env.ADMIN_KEY,
    process.env.NEXT_PUBLIC_ADMIN_KEY
  );
  const memberRaw = pick(
    process.env.FRC_MEMBER_KEY,
    process.env.NEXT_PUBLIC_FRC_MEMBER_KEY,
    process.env.MEMBER_KEY,
    process.env.NEXT_PUBLIC_MEMBER_KEY
  );
  const adminFromEnv = Boolean(adminRaw);
  const memberFromEnv = Boolean(memberRaw);

  const adminSource = process.env.FRC_ADMIN_KEY
    ? 'FRC_ADMIN_KEY'
    : process.env.NEXT_PUBLIC_FRC_ADMIN_KEY
      ? 'NEXT_PUBLIC_FRC_ADMIN_KEY'
      : process.env.ADMIN_KEY
        ? 'ADMIN_KEY'
        : process.env.NEXT_PUBLIC_ADMIN_KEY
          ? 'NEXT_PUBLIC_ADMIN_KEY'
          : 'missing';

  const memberSource = process.env.FRC_MEMBER_KEY
    ? 'FRC_MEMBER_KEY'
    : process.env.NEXT_PUBLIC_FRC_MEMBER_KEY
      ? 'NEXT_PUBLIC_FRC_MEMBER_KEY'
      : process.env.MEMBER_KEY
        ? 'MEMBER_KEY'
        : process.env.NEXT_PUBLIC_MEMBER_KEY
          ? 'NEXT_PUBLIC_MEMBER_KEY'
          : 'missing';

  return {
    adminFromEnv,
    memberFromEnv,
    /** True when either required key is missing from env */
    usingDefaults: false,
    keysConfigured: adminFromEnv && memberFromEnv,
    adminConfigured: adminFromEnv,
    memberConfigured: memberFromEnv,
    // Only expose key values when NEXT_PUBLIC_* is set (never invent demo secrets)
    publicAdminKey: pick(process.env.NEXT_PUBLIC_FRC_ADMIN_KEY, process.env.NEXT_PUBLIC_ADMIN_KEY) || null,
    publicMemberKey: pick(process.env.NEXT_PUBLIC_FRC_MEMBER_KEY, process.env.NEXT_PUBLIC_MEMBER_KEY) || null,
    adminKeySet: adminFromEnv,
    memberKeySet: memberFromEnv,
    adminKeyLength: getAdminKey().length,
    memberKeyLength: getMemberKey().length,
    source: {
      admin: adminSource,
      member: memberSource,
    },
  };
}
