/**
 * Member accounts:
 *  - First-time setup: name + password + shared member access token (same token family as admin)
 *  - Later logins: name + password only
 *  - Session still uses the shared member access token for API auth (parity with admin key)
 */
import crypto from 'crypto';
import { getMemberKey, isAdminAccessKey, isMemberAccessKey } from '@/lib/accessKeys';
import * as pg from '@/lib/pg';
import * as sqlite from '@/lib/db';

export type MemberAccountPublic = {
  id: string;
  name: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string | null;
};

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

function normalizeName(name: string): string {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 80);
}

function nameKey(name: string): string {
  return normalizeName(name).toLowerCase();
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .scryptSync(password, s, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P })
    .toString('hex');
  return { hash, salt: s };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const { hash } = hashPassword(password, salt);
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function ensureSqliteMemberTable() {
  const db = sqlite.getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS member_accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_key TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );
  `);
}

function toPublic(row: {
  id: string;
  name: string;
  created_at?: string;
  createdAt?: string;
  last_login_at?: string | null;
  lastLoginAt?: string | null;
}): MemberAccountPublic {
  return {
    id: row.id,
    name: row.name,
    displayName: row.name,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    lastLoginAt: row.last_login_at ?? row.lastLoginAt ?? null,
  };
}

export async function registerMemberAccount(input: {
  name: string;
  password: string;
  memberToken: string;
}): Promise<
  { success: true; account: MemberAccountPublic; accessToken: string } | { success: false; message: string }
> {
  const name = normalizeName(input.name);
  const password = String(input.password || '');
  const token = String(input.memberToken || '').trim();

  if (!name || name.length < 2) {
    return { success: false, message: 'Enter your full name (at least 2 characters).' };
  }
  if (password.length < 4) {
    return { success: false, message: 'Password must be at least 4 characters.' };
  }
  if (!token) {
    return {
      success: false,
      message: 'Member access token is required for first-time registration (same token model as admin).',
    };
  }
  if (isAdminAccessKey(token) && !isMemberAccessKey(token)) {
    return { success: false, message: 'Use the Member access token for registration (not the admin key).' };
  }
  if (!isMemberAccessKey(token)) {
    return {
      success: false,
      message: 'Invalid member access token. Ask your admin for the shared member key (FRC_MEMBER_KEY).',
    };
  }

  const key = nameKey(name);
  const { hash, salt } = hashPassword(password);
  const id = `mem-${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();
  const accessToken = getMemberKey();
  if (!accessToken) {
    return {
      success: false,
      message: 'FRC_MEMBER_KEY is not set in the server environment. Add it and restart.',
    };
  }

  if (pg.isPostgresConfigured()) {
    const existing = await pg.memberFindByNameKey(key);
    if (existing) {
      return { success: false, message: 'That name is already registered. Sign in with your password instead.' };
    }
    await pg.memberInsert({
      id,
      name,
      nameKey: key,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: now,
    });
    return {
      success: true,
      account: { id, name, displayName: name, createdAt: now, lastLoginAt: null },
      accessToken,
    };
  }

  ensureSqliteMemberTable();
  const db = sqlite.getDb();
  const existing = db.prepare(`SELECT id FROM member_accounts WHERE name_key = ?`).get(key) as
    | { id: string }
    | undefined;
  if (existing) {
    return { success: false, message: 'That name is already registered. Sign in with your password instead.' };
  }
  db.prepare(
    `INSERT INTO member_accounts (id, name, name_key, password_hash, password_salt, created_at, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL)`
  ).run(id, name, key, hash, salt, now);

  return {
    success: true,
    account: { id, name, displayName: name, createdAt: now, lastLoginAt: null },
    accessToken,
  };
}

export async function loginMemberAccount(input: {
  name: string;
  password: string;
}): Promise<
  | { success: true; account: MemberAccountPublic; accessToken: string; role: 'member' }
  | { success: false; message: string }
> {
  const name = normalizeName(input.name);
  const password = String(input.password || '');
  if (!name) return { success: false, message: 'Enter the name you registered with.' };
  if (!password) return { success: false, message: 'Enter your password.' };

  const key = nameKey(name);
  const accessToken = getMemberKey();
  if (!accessToken) {
    return {
      success: false,
      message: 'FRC_MEMBER_KEY is not set in the server environment. Add it and restart.',
    };
  }

  if (pg.isPostgresConfigured()) {
    const row = await pg.memberFindByNameKey(key);
    if (!row) {
      return {
        success: false,
        message: 'No account for that name. Register first (name + password + member token).',
      };
    }
    if (!verifyPassword(password, row.password_salt, row.password_hash)) {
      return { success: false, message: 'Incorrect password.' };
    }
    const now = new Date().toISOString();
    await pg.memberTouchLogin(row.id, now);
    return {
      success: true,
      role: 'member',
      accessToken,
      account: toPublic({ ...row, last_login_at: now }),
    };
  }

  ensureSqliteMemberTable();
  const db = sqlite.getDb();
  const row = db
    .prepare(
      `SELECT id, name, name_key, password_hash, password_salt, created_at, last_login_at
       FROM member_accounts WHERE name_key = ?`
    )
    .get(key) as
    | {
        id: string;
        name: string;
        name_key: string;
        password_hash: string;
        password_salt: string;
        created_at: string;
        last_login_at: string | null;
      }
    | undefined;

  if (!row) {
    return {
      success: false,
      message: 'No account for that name. Register first (name + password + member token).',
    };
  }
  if (!verifyPassword(password, row.password_salt, row.password_hash)) {
    return { success: false, message: 'Incorrect password.' };
  }
  const now = new Date().toISOString();
  db.prepare(`UPDATE member_accounts SET last_login_at = ? WHERE id = ?`).run(now, row.id);

  return {
    success: true,
    role: 'member',
    accessToken,
    account: toPublic({ ...row, last_login_at: now }),
  };
}

export async function listMemberAccounts(): Promise<MemberAccountPublic[]> {
  if (pg.isPostgresConfigured()) {
    const rows = await pg.memberListAll();
    return rows.map((r) => toPublic(r));
  }
  ensureSqliteMemberTable();
  const db = sqlite.getDb();
  const rows = db
    .prepare(
      `SELECT id, name, created_at, last_login_at FROM member_accounts ORDER BY name COLLATE NOCASE ASC`
    )
    .all() as Array<{ id: string; name: string; created_at: string; last_login_at: string | null }>;
  return rows.map((r) => toPublic(r));
}

export async function clearMemberAccounts(): Promise<void> {
  if (pg.isPostgresConfigured()) {
    await pg.memberClearAll();
    return;
  }
  try {
    ensureSqliteMemberTable();
    sqlite.getDb().prepare(`DELETE FROM member_accounts`).run();
  } catch {
    /* ignore */
  }
}
