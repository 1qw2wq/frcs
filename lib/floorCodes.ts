/**
 * Admin-generated dynamic floor / pit entry codes.
 * Members log enter time by submitting a code the admin issues — no NFC / fixed PIN.
 */
import crypto from 'crypto';
import * as pg from '@/lib/pg';
import * as sqlite from '@/lib/db';
import type { FloorEntryCode, FloorCheckIn } from '@/types/teamCentral';

const COLLECTION = 'floor_entry_codes';
const FLOOR_LOG = 'floor_log';

function genCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

function nowIso() {
  return new Date().toISOString();
}

function formatTime(d = new Date()) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function listCodesRaw(): Promise<FloorEntryCode[]> {
  if (pg.isPostgresConfigured()) {
    return pg.getCollectionItems<FloorEntryCode>(COLLECTION);
  }
  return sqlite.getCollectionItems<FloorEntryCode>(COLLECTION);
}

async function saveCode(code: FloorEntryCode): Promise<void> {
  if (pg.isPostgresConfigured()) {
    await pg.putCollectionItem(COLLECTION, code);
    return;
  }
  sqlite.putCollectionItem(COLLECTION, code);
}

async function saveFloorLog(entry: FloorCheckIn): Promise<void> {
  if (pg.isPostgresConfigured()) {
    await pg.putCollectionItem(FLOOR_LOG, entry);
    return;
  }
  sqlite.putCollectionItem(FLOOR_LOG, entry);
}

export async function listFloorEntryCodes(): Promise<FloorEntryCode[]> {
  const codes = await listCodesRaw();
  return codes.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function createFloorEntryCode(input: {
  label?: string;
  createdBy?: string;
  expiresInMinutes?: number | null;
  maxUses?: number;
  codeLength?: number;
}): Promise<FloorEntryCode> {
  const length = Math.min(8, Math.max(4, input.codeLength || 6));
  let code = genCode(length);
  const existing = await listCodesRaw();
  let guard = 0;
  while (existing.some((c) => c.code === code && c.active) && guard < 20) {
    code = genCode(length);
    guard++;
  }
  const createdAt = nowIso();
  const expiresIn = input.expiresInMinutes;
  const expiresAt =
    expiresIn && expiresIn > 0
      ? new Date(Date.now() + expiresIn * 60_000).toISOString()
      : null;

  const row: FloorEntryCode = {
    id: `fec-${crypto.randomBytes(6).toString('hex')}`,
    code,
    label: (input.label || 'Pit / floor entry').trim().slice(0, 80),
    createdAt,
    createdBy: input.createdBy || 'admin',
    expiresAt,
    maxUses: Math.max(1, input.maxUses ?? 50),
    useCount: 0,
    active: true,
    lastUsedAt: null,
    lastUsedBy: null,
  };
  await saveCode(row);
  return row;
}

export async function revokeFloorEntryCode(id: string): Promise<boolean> {
  const codes = await listCodesRaw();
  const found = codes.find((c) => c.id === id);
  if (!found) return false;
  await saveCode({ ...found, active: false });
  return true;
}

export async function deleteFloorEntryCode(id: string): Promise<void> {
  if (pg.isPostgresConfigured()) {
    await pg.deleteCollectionItem(COLLECTION, id);
    return;
  }
  sqlite.deleteCollectionItem(COLLECTION, id);
}

export type RedeemResult =
  | { success: true; entry: FloorCheckIn; code: FloorEntryCode }
  | { success: false; message: string };

export async function redeemFloorEntryCode(input: {
  code: string;
  memberName: string;
  memberId?: string;
  subteam?: string;
  studentId?: string;
}): Promise<RedeemResult> {
  const raw = String(input.code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (!raw || raw.length < 4) {
    return { success: false, message: 'Enter the entry code from your admin.' };
  }
  const name = String(input.memberName || '').trim();
  if (!name) {
    return {
      success: false,
      message: 'Sign in as a member first so we can log your name and enter time.',
    };
  }

  const codes = await listCodesRaw();
  const match = codes.find((c) => c.code.toUpperCase() === raw);
  if (!match) {
    return { success: false, message: 'Invalid entry code. Ask your admin for a new code.' };
  }
  if (!match.active) {
    return { success: false, message: 'This entry code has been revoked.' };
  }
  if (match.expiresAt && new Date(match.expiresAt).getTime() < Date.now()) {
    return { success: false, message: 'This entry code has expired. Ask your admin for a new one.' };
  }
  if (match.useCount >= match.maxUses) {
    return { success: false, message: 'This entry code has already been used up.' };
  }

  const ts = new Date();
  const entry: FloorCheckIn = {
    id: `fl-${crypto.randomBytes(6).toString('hex')}`,
    studentName: name,
    studentId:
      input.studentId || input.memberId || `member-${name.toLowerCase().replace(/\s+/g, '-')}`,
    subteam: input.subteam || 'General',
    checkInTime: formatTime(ts),
    checkInAt: ts.toISOString(),
    hoursToday: 0,
    entryCode: match.code,
    memberAccountId: input.memberId,
  };

  await saveFloorLog(entry);

  const updated: FloorEntryCode = {
    ...match,
    useCount: match.useCount + 1,
    lastUsedAt: ts.toISOString(),
    lastUsedBy: name,
    active: match.useCount + 1 < match.maxUses,
  };
  await saveCode(updated);

  return { success: true, entry, code: updated };
}

export async function listFloorLog(): Promise<FloorCheckIn[]> {
  if (pg.isPostgresConfigured()) {
    return pg.getCollectionItems<FloorCheckIn>(FLOOR_LOG);
  }
  return sqlite.getCollectionItems<FloorCheckIn>(FLOOR_LOG);
}
