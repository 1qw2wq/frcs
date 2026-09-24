/**
 * Direct PostgreSQL backend (Supabase pooler / any Postgres).
 * Set DATABASE_URL=postgresql://user:pass@host:6543/postgres
 */
import { Pool, type QueryResultRow } from 'pg';
import {
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_SCOUTING_ENTRIES,
  INITIAL_PIT_DATA,
  INITIAL_PICKLIST,
} from '@/lib/defaultData';
import {
  INITIAL_CERTIFICATIONS,
  INITIAL_TASKS,
  INITIAL_ROSTER,
  INITIAL_FLOOR_LOG,
  INITIAL_ENGINEERING_NOTES,
  INITIAL_OUTREACH_DEMOS,
  INITIAL_MACHINE_RESERVATIONS,
  INITIAL_HOUR_APPEALS,
} from '@/lib/teamCentralData';
import type {
  FrcTeam,
  FrcMatch,
  MatchScoutingEntry,
  PitScoutingData,
  PicklistTeam,
} from '@/types/frc';
import type {
  Certification,
  SubsystemTask,
  MemberRosterItem,
  FloorCheckIn,
  EngineeringNote,
  OutreachDemo,
  MachineReservation,
  HourAppealRecord,
} from '@/types/teamCentral';

type GlobalPg = {
  __frcPgPool?: Pool;
  __frcPgInit?: boolean;
};

const g = globalThis as unknown as GlobalPg;

export function isPostgresConfigured(): boolean {
  const url =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    '';
  return Boolean(url && !url.includes('YOUR_') && url.includes('postgres'));
}

export function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ''
  );
}

/** Start with empty DB (no seed). Cleared data stays empty until Reset. */
export function shouldStartClean(): boolean {
  const v = (process.env.FRC_START_CLEAN || process.env.START_CLEAN || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function getPool(): Pool {
  if (g.__frcPgPool) return g.__frcPgPool;
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  // Supabase pooler (port 6543) often needs SSL
  const needsSsl =
    connectionString.includes('supabase.com') ||
    connectionString.includes('pooler') ||
    process.env.PGSSLMODE === 'require' ||
    process.env.DATABASE_SSL === 'true';

  g.__frcPgPool = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
  });
  return g.__frcPgPool;
}

async function q<T extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  const res = await pool.query<T>(sql, params);
  return res.rows;
}

async function exec(sql: string, params: any[] = []): Promise<number> {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rowCount ?? 0;
}

async function ensureSchema() {
  if (g.__frcPgInit) return;
  await exec(`
    CREATE TABLE IF NOT EXISTS teams (
      number INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      organization TEXT,
      location TEXT,
      rookie_year INTEGER,
      epa DOUBLE PRECISION DEFAULT 0,
      auto_epa DOUBLE PRECISION DEFAULT 0,
      teleop_epa DOUBLE PRECISION DEFAULT 0,
      endgame_epa DOUBLE PRECISION DEFAULT 0,
      rank INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      ties INTEGER DEFAULT 0,
      image_url TEXT,
      cad_url TEXT,
      drivetrain TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS matches (
      match_number INTEGER PRIMARY KEY,
      comp_level TEXT,
      scheduled_time TEXT,
      status TEXT,
      red_teams TEXT,
      blue_teams TEXT,
      red_score INTEGER,
      blue_score INTEGER,
      red_auto INTEGER,
      blue_auto INTEGER,
      red_teleop INTEGER,
      blue_teleop INTEGER,
      red_endgame INTEGER,
      blue_endgame INTEGER,
      red_coop INTEGER DEFAULT 0,
      blue_coop INTEGER DEFAULT 0,
      red_rp INTEGER,
      blue_rp INTEGER,
      predicted_winner TEXT,
      predicted_win_prob DOUBLE PRECISION
    );

    CREATE TABLE IF NOT EXISTS match_scouting (
      id TEXT PRIMARY KEY,
      match_number INTEGER NOT NULL,
      team_number INTEGER NOT NULL,
      scout_name TEXT,
      alliance TEXT,
      driver_station INTEGER,
      auto_leave INTEGER DEFAULT 0,
      auto_coral_l1 INTEGER DEFAULT 0,
      auto_coral_l2 INTEGER DEFAULT 0,
      auto_coral_l3 INTEGER DEFAULT 0,
      auto_coral_l4 INTEGER DEFAULT 0,
      auto_algae_processor INTEGER DEFAULT 0,
      auto_algae_net INTEGER DEFAULT 0,
      auto_missed INTEGER DEFAULT 0,
      teleop_coral_l1 INTEGER DEFAULT 0,
      teleop_coral_l2 INTEGER DEFAULT 0,
      teleop_coral_l3 INTEGER DEFAULT 0,
      teleop_coral_l4 INTEGER DEFAULT 0,
      teleop_algae_processor INTEGER DEFAULT 0,
      teleop_algae_net INTEGER DEFAULT 0,
      cycles INTEGER DEFAULT 0,
      defense_rating INTEGER DEFAULT 3,
      climb_status TEXT,
      climb_time_seconds DOUBLE PRECISION DEFAULT 0,
      died_or_tipped INTEGER DEFAULT 0,
      cards TEXT,
      driver_skill INTEGER DEFAULT 3,
      notes TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS pit_scouting (
      team_number INTEGER PRIMARY KEY,
      scout_name TEXT,
      drivetrain TEXT,
      dimensions TEXT,
      weight_lbs DOUBLE PRECISION,
      motors_drive TEXT,
      motors_steer TEXT,
      intake_type TEXT,
      scoring_capabilities TEXT,
      vision_system TEXT,
      preferred_autonomous TEXT,
      climb_capability TEXT,
      photo_url TEXT,
      pit_notes TEXT,
      inspection_passed INTEGER DEFAULT 0,
      battery_voltage DOUBLE PRECISION,
      last_checked TEXT
    );

    CREATE TABLE IF NOT EXISTS picklist (
      team_number INTEGER PRIMARY KEY,
      rank INTEGER,
      role TEXT,
      notes TEXT,
      strengths TEXT,
      weaknesses TEXT,
      favorite_alliance_partners TEXT,
      flagged_dnp INTEGER DEFAULT 0,
      dnp_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS access_keys (
      role TEXT PRIMARY KEY,
      key_value TEXT NOT NULL,
      permissions TEXT,
      status TEXT DEFAULT 'Active',
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      PRIMARY KEY (collection, id)
    );

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
  g.__frcPgInit = true;
}

export type MemberAccountRow = {
  id: string;
  name: string;
  name_key: string;
  password_hash: string;
  password_salt: string;
  created_at: string;
  last_login_at: string | null;
};

export async function memberFindByNameKey(nameKey: string): Promise<MemberAccountRow | null> {
  await ensureSchema();
  const rows = await q<MemberAccountRow>(
    `SELECT id, name, name_key, password_hash, password_salt, created_at, last_login_at
     FROM member_accounts WHERE name_key = $1 LIMIT 1`,
    [nameKey]
  );
  return rows[0] || null;
}

export async function memberInsert(input: {
  id: string;
  name: string;
  nameKey: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}): Promise<void> {
  await ensureSchema();
  await exec(
    `INSERT INTO member_accounts (id, name, name_key, password_hash, password_salt, created_at, last_login_at)
     VALUES ($1,$2,$3,$4,$5,$6,NULL)`,
    [input.id, input.name, input.nameKey, input.passwordHash, input.passwordSalt, input.createdAt]
  );
}

export async function memberTouchLogin(id: string, ts: string): Promise<void> {
  await ensureSchema();
  await exec(`UPDATE member_accounts SET last_login_at = $1 WHERE id = $2`, [ts, id]);
}

export async function memberListAll(): Promise<MemberAccountRow[]> {
  await ensureSchema();
  return q<MemberAccountRow>(
    `SELECT id, name, name_key, password_hash, password_salt, created_at, last_login_at
     FROM member_accounts ORDER BY name ASC`
  );
}

export async function memberClearAll(): Promise<void> {
  await ensureSchema();
  await exec(`DELETE FROM member_accounts`);
}

function parseJsonArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const p = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(p) ? p : [];
  } catch {
    return String(val)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

function parseNumberArray(val: any): number[] {
  return parseJsonArray(val)
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n));
}

function teamFromRow(r: any): FrcTeam {
  return {
    number: r.number,
    name: r.name,
    organization: r.organization || '',
    location: r.location || '',
    rookieYear: r.rookie_year || 0,
    epa: Number(r.epa) || 0,
    autoEpa: Number(r.auto_epa) || 0,
    teleopEpa: Number(r.teleop_epa) || 0,
    endgameEpa: Number(r.endgame_epa) || 0,
    rank: r.rank || 0,
    record: { wins: r.wins || 0, losses: r.losses || 0, ties: r.ties || 0 },
    imageUrl: r.image_url || '',
    cadUrl: r.cad_url || undefined,
    drivetrain: r.drivetrain,
    status: r.status,
  };
}

function matchFromRow(r: any): FrcMatch {
  return {
    matchNumber: r.match_number,
    compLevel: r.comp_level,
    scheduledTime: r.scheduled_time,
    status: r.status,
    redAlliance: {
      teams: parseNumberArray(r.red_teams),
      score: r.red_score ?? undefined,
      autoScore: r.red_auto ?? undefined,
      teleopScore: r.red_teleop ?? undefined,
      endgameScore: r.red_endgame ?? undefined,
      coopertition: !!r.red_coop,
      rankingPoints: r.red_rp ?? undefined,
    },
    blueAlliance: {
      teams: parseNumberArray(r.blue_teams),
      score: r.blue_score ?? undefined,
      autoScore: r.blue_auto ?? undefined,
      teleopScore: r.blue_teleop ?? undefined,
      endgameScore: r.blue_endgame ?? undefined,
      coopertition: !!r.blue_coop,
      rankingPoints: r.blue_rp ?? undefined,
    },
    predictedWinner: r.predicted_winner,
    predictedWinProb: Number(r.predicted_win_prob) || 0.5,
  };
}

function scoutFromRow(r: any): MatchScoutingEntry {
  return {
    id: r.id,
    matchNumber: r.match_number,
    teamNumber: r.team_number,
    scoutName: r.scout_name || '',
    alliance: r.alliance,
    driverStation: r.driver_station || 1,
    autoLeave: !!r.auto_leave,
    autoCoralL1: r.auto_coral_l1 || 0,
    autoCoralL2: r.auto_coral_l2 || 0,
    autoCoralL3: r.auto_coral_l3 || 0,
    autoCoralL4: r.auto_coral_l4 || 0,
    autoAlgaeProcessor: r.auto_algae_processor || 0,
    autoAlgaeNet: r.auto_algae_net || 0,
    autoMissed: r.auto_missed || 0,
    teleopCoralL1: r.teleop_coral_l1 || 0,
    teleopCoralL2: r.teleop_coral_l2 || 0,
    teleopCoralL3: r.teleop_coral_l3 || 0,
    teleopCoralL4: r.teleop_coral_l4 || 0,
    teleopAlgaeProcessor: r.teleop_algae_processor || 0,
    teleopAlgaeNet: r.teleop_algae_net || 0,
    cycles: r.cycles || 0,
    defenseRating: r.defense_rating || 3,
    climbStatus: r.climb_status || 'None',
    climbTimeSeconds: Number(r.climb_time_seconds) || 0,
    diedOrTipped: !!r.died_or_tipped,
    cards: r.cards || 'None',
    driverSkill: r.driver_skill || 3,
    notes: r.notes || '',
    timestamp: r.timestamp || '',
  };
}

function pitFromRow(r: any): PitScoutingData {
  return {
    teamNumber: r.team_number,
    scoutName: r.scout_name || '',
    drivetrain: r.drivetrain || '',
    dimensions: r.dimensions || '',
    weightLbs: Number(r.weight_lbs) || 0,
    motorsDrive: r.motors_drive || '',
    motorsSteer: r.motors_steer || '',
    intakeType: r.intake_type || '',
    scoringCapabilities: parseJsonArray(r.scoring_capabilities).map(String),
    visionSystem: r.vision_system || '',
    preferredAutonomous: r.preferred_autonomous || '',
    climbCapability: r.climb_capability || '',
    photoUrl: r.photo_url || '',
    pitNotes: r.pit_notes || '',
    inspectionPassed: !!r.inspection_passed,
    batteryVoltage: Number(r.battery_voltage) || 0,
    lastChecked: r.last_checked || '',
  };
}

function pickFromRow(r: any): PicklistTeam {
  return {
    teamNumber: r.team_number,
    rank: r.rank,
    role: r.role,
    notes: r.notes || '',
    strengths: parseJsonArray(r.strengths).map(String),
    weaknesses: parseJsonArray(r.weaknesses).map(String),
    favoriteAlliancePartners: parseNumberArray(r.favorite_alliance_partners),
    flaggedDNP: !!r.flagged_dnp,
    dnpReason: r.dnp_reason || undefined,
  };
}

async function putCollection(collection: string, items: Array<{ id: string } & Record<string, any>>) {
  await exec(`DELETE FROM collection_items WHERE collection = $1`, [collection]);
  for (const item of items) {
    const id = String(item.id);
    await exec(
      `INSERT INTO collection_items (collection, id, data) VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data`,
      [collection, id, JSON.stringify({ ...item, id })]
    );
  }
}

async function getCollection<T extends { id: string }>(collection: string): Promise<T[]> {
  const rows = await q<{ data: any }>(
    `SELECT data FROM collection_items WHERE collection = $1 ORDER BY id ASC`,
    [collection]
  );
  return rows.map((r) => {
    const d = r.data;
    return (typeof d === 'string' ? JSON.parse(d) : d) as T;
  });
}

async function seedDefaults() {
  for (const t of INITIAL_TEAMS) {
    await exec(
      `INSERT INTO teams (number, name, organization, location, rookie_year, epa, auto_epa, teleop_epa, endgame_epa,
        rank, wins, losses, ties, image_url, cad_url, drivetrain, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (number) DO UPDATE SET name = EXCLUDED.name`,
      [
        t.number,
        t.name,
        t.organization,
        t.location,
        t.rookieYear,
        t.epa,
        t.autoEpa,
        t.teleopEpa,
        t.endgameEpa,
        t.rank,
        t.record.wins,
        t.record.losses,
        t.record.ties,
        t.imageUrl,
        t.cadUrl || null,
        t.drivetrain,
        t.status,
      ]
    );
  }
  for (const m of INITIAL_MATCHES) {
    await exec(
      `INSERT INTO matches (match_number, comp_level, scheduled_time, status, red_teams, blue_teams,
        red_score, blue_score, predicted_winner, predicted_win_prob)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (match_number) DO NOTHING`,
      [
        m.matchNumber,
        m.compLevel,
        m.scheduledTime,
        m.status,
        JSON.stringify(m.redAlliance.teams),
        JSON.stringify(m.blueAlliance.teams),
        m.redAlliance.score ?? null,
        m.blueAlliance.score ?? null,
        m.predictedWinner,
        m.predictedWinProb,
      ]
    );
  }
  for (const s of INITIAL_SCOUTING_ENTRIES) {
    await upsertScoutingEntry(s);
  }
  for (const p of INITIAL_PIT_DATA) {
    await upsertPitData(p);
  }
  for (const p of INITIAL_PICKLIST) {
    await exec(
      `INSERT INTO picklist (team_number, rank, role, notes, strengths, weaknesses, favorite_alliance_partners, flagged_dnp, dnp_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (team_number) DO NOTHING`,
      [
        p.teamNumber,
        p.rank,
        p.role,
        p.notes,
        JSON.stringify(p.strengths || []),
        JSON.stringify(p.weaknesses || []),
        JSON.stringify(p.favoriteAlliancePartners || []),
        p.flaggedDNP ? 1 : 0,
        p.dnpReason || null,
      ]
    );
  }

  await putCollection('certifications', INITIAL_CERTIFICATIONS);
  await putCollection('tasks', INITIAL_TASKS);
  await putCollection('roster', INITIAL_ROSTER);
  await putCollection('floor_log', INITIAL_FLOOR_LOG);
  await putCollection('engineering_notes', INITIAL_ENGINEERING_NOTES);
  await putCollection('outreach_demos', INITIAL_OUTREACH_DEMOS);
  await putCollection('machine_reservations', INITIAL_MACHINE_RESERVATIONS);
  await putCollection('hour_appeals', INITIAL_HOUR_APPEALS);

  const now = new Date().toISOString();
  const adminKey = (process.env.FRC_ADMIN_KEY || process.env.NEXT_PUBLIC_FRC_ADMIN_KEY || '').trim();
  const memberKey = (process.env.FRC_MEMBER_KEY || process.env.NEXT_PUBLIC_FRC_MEMBER_KEY || '').trim();
  if (adminKey) {
    await exec(
      `INSERT INTO access_keys (role, key_value, permissions, status, updated_at) VALUES
        ('administrator', $1, 'ALL', 'Active', $2)
       ON CONFLICT (role) DO UPDATE SET key_value = EXCLUDED.key_value, updated_at = EXCLUDED.updated_at`,
      [adminKey, now]
    );
  }
  if (memberKey) {
    await exec(
      `INSERT INTO access_keys (role, key_value, permissions, status, updated_at) VALUES
        ('member', $1, 'SCOUT', 'Active', $2)
       ON CONFLICT (role) DO UPDATE SET key_value = EXCLUDED.key_value, updated_at = EXCLUDED.updated_at`,
      [memberKey, now]
    );
  }
  await exec(`DELETE FROM meta WHERE key = 'cleared_at'`);
  await exec(
    `INSERT INTO meta (key, value) VALUES ('seeded_at', $1), ('db_version', 'pg-3.0')
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [now]
  );
}

async function seedIfNeeded() {
  await ensureSchema();

  const cleared = await q<{ value: string }>(`SELECT value FROM meta WHERE key = 'cleared_at'`);
  if (cleared[0]?.value) return;

  // Explicit clean start: mark cleared and leave empty
  if (shouldStartClean()) {
    const teams = await q<{ c: string }>(`SELECT COUNT(*)::text AS c FROM teams`);
    const roster = await q<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM collection_items WHERE collection = 'roster'`
    );
    if (Number(teams[0]?.c || 0) === 0 && Number(roster[0]?.c || 0) === 0) {
      await exec(
        `INSERT INTO meta (key, value) VALUES ('cleared_at', $1), ('start_clean', 'true')
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [new Date().toISOString()]
      );
      return;
    }
  }

  const teams = await q<{ c: string }>(`SELECT COUNT(*)::text AS c FROM teams`);
  const roster = await q<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM collection_items WHERE collection = 'roster'`
  );
  const tc = Number(teams[0]?.c || 0);
  const rc = Number(roster[0]?.c || 0);
  if (tc > 0 && rc > 0) return;
  if (tc > 0 && rc === 0) {
    await putCollection('certifications', INITIAL_CERTIFICATIONS);
    await putCollection('tasks', INITIAL_TASKS);
    await putCollection('roster', INITIAL_ROSTER);
    await putCollection('floor_log', INITIAL_FLOOR_LOG);
    await putCollection('engineering_notes', INITIAL_ENGINEERING_NOTES);
    await putCollection('outreach_demos', INITIAL_OUTREACH_DEMOS);
    await putCollection('machine_reservations', INITIAL_MACHINE_RESERVATIONS);
    await putCollection('hour_appeals', INITIAL_HOUR_APPEALS);
    return;
  }
  if (!shouldStartClean()) {
    await seedDefaults();
  } else {
    await exec(
      `INSERT INTO meta (key, value) VALUES ('cleared_at', $1), ('start_clean', 'true')
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [new Date().toISOString()]
    );
  }
}

export async function pgGetFullDataset() {
  await seedIfNeeded();
  const [teams, matches, scouting, pits, picks] = await Promise.all([
    q(`SELECT * FROM teams ORDER BY rank ASC, number ASC`),
    q(`SELECT * FROM matches ORDER BY match_number ASC`),
    q(`SELECT * FROM match_scouting ORDER BY timestamp DESC NULLS LAST`),
    q(`SELECT * FROM pit_scouting ORDER BY team_number ASC`),
    q(`SELECT * FROM picklist ORDER BY rank ASC`),
  ]);

  const [certifications, tasks, roster, floorLog, notes, demos, machineReservations, hourAppeals] =
    await Promise.all([
      getCollection<Certification>('certifications'),
      getCollection<SubsystemTask>('tasks'),
      getCollection<MemberRosterItem>('roster'),
      getCollection<FloorCheckIn>('floor_log'),
      getCollection<EngineeringNote>('engineering_notes'),
      getCollection<OutreachDemo>('outreach_demos'),
      getCollection<MachineReservation>('machine_reservations'),
      getCollection<HourAppealRecord>('hour_appeals'),
    ]);

  return {
    teams: teams.map(teamFromRow),
    matches: matches.map(matchFromRow),
    scoutingEntries: scouting.map(scoutFromRow),
    pitData: pits.map(pitFromRow),
    picklist: picks.map(pickFromRow),
    certifications,
    tasks,
    roster,
    floorLog,
    notes,
    demos,
    machineReservations,
    hourAppeals,
    loggedHours: 0,
    isCheckedIn: false,
    lastUpdated: new Date().toISOString(),
  };
}

export async function upsertScoutingEntry(entry: MatchScoutingEntry): Promise<MatchScoutingEntry> {
  await ensureSchema();
  const full: MatchScoutingEntry = {
    ...entry,
    id: entry.id || `scout-${Date.now()}`,
    timestamp: entry.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  await exec(
    `INSERT INTO match_scouting (
      id, match_number, team_number, scout_name, alliance, driver_station,
      auto_leave, auto_coral_l1, auto_coral_l2, auto_coral_l3, auto_coral_l4,
      auto_algae_processor, auto_algae_net, auto_missed,
      teleop_coral_l1, teleop_coral_l2, teleop_coral_l3, teleop_coral_l4,
      teleop_algae_processor, teleop_algae_net, cycles, defense_rating,
      climb_status, climb_time_seconds, died_or_tipped, cards, driver_skill, notes, timestamp
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
    )
    ON CONFLICT (id) DO UPDATE SET
      match_number = EXCLUDED.match_number,
      team_number = EXCLUDED.team_number,
      scout_name = EXCLUDED.scout_name,
      cycles = EXCLUDED.cycles,
      notes = EXCLUDED.notes,
      timestamp = EXCLUDED.timestamp`,
    [
      full.id,
      full.matchNumber,
      full.teamNumber,
      full.scoutName,
      full.alliance,
      full.driverStation,
      full.autoLeave ? 1 : 0,
      full.autoCoralL1,
      full.autoCoralL2,
      full.autoCoralL3,
      full.autoCoralL4,
      full.autoAlgaeProcessor,
      full.autoAlgaeNet,
      full.autoMissed,
      full.teleopCoralL1,
      full.teleopCoralL2,
      full.teleopCoralL3,
      full.teleopCoralL4,
      full.teleopAlgaeProcessor,
      full.teleopAlgaeNet,
      full.cycles,
      full.defenseRating,
      full.climbStatus,
      full.climbTimeSeconds,
      full.diedOrTipped ? 1 : 0,
      full.cards,
      full.driverSkill,
      full.notes,
      full.timestamp,
    ]
  );
  return full;
}

export async function upsertPitData(pit: PitScoutingData): Promise<PitScoutingData> {
  await ensureSchema();
  const full: PitScoutingData = {
    ...pit,
    lastChecked: pit.lastChecked || new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  await exec(
    `INSERT INTO pit_scouting (
      team_number, scout_name, drivetrain, dimensions, weight_lbs, motors_drive, motors_steer,
      intake_type, scoring_capabilities, vision_system, preferred_autonomous, climb_capability,
      photo_url, pit_notes, inspection_passed, battery_voltage, last_checked
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    ON CONFLICT (team_number) DO UPDATE SET
      scout_name = EXCLUDED.scout_name,
      drivetrain = EXCLUDED.drivetrain,
      last_checked = EXCLUDED.last_checked`,
    [
      full.teamNumber,
      full.scoutName,
      full.drivetrain,
      full.dimensions,
      full.weightLbs,
      full.motorsDrive,
      full.motorsSteer,
      full.intakeType,
      JSON.stringify(full.scoringCapabilities || []),
      full.visionSystem,
      full.preferredAutonomous,
      full.climbCapability,
      full.photoUrl,
      full.pitNotes,
      full.inspectionPassed ? 1 : 0,
      full.batteryVoltage,
      full.lastChecked,
    ]
  );
  return full;
}

export async function replacePicklist(list: PicklistTeam[]): Promise<PicklistTeam[]> {
  await ensureSchema();
  await exec(`DELETE FROM picklist`);
  for (const p of list) {
    await exec(
      `INSERT INTO picklist (team_number, rank, role, notes, strengths, weaknesses, favorite_alliance_partners, flagged_dnp, dnp_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        p.teamNumber,
        p.rank,
        p.role,
        p.notes,
        JSON.stringify(p.strengths || []),
        JSON.stringify(p.weaknesses || []),
        JSON.stringify(p.favoriteAlliancePartners || []),
        p.flaggedDNP ? 1 : 0,
        p.dnpReason || null,
      ]
    );
  }
  const rows = await q(`SELECT * FROM picklist ORDER BY rank ASC`);
  return rows.map(pickFromRow);
}

export async function upsertTeam(team: Partial<FrcTeam> & { number: number; name: string }): Promise<FrcTeam> {
  await ensureSchema();
  const full: FrcTeam = {
    number: team.number,
    name: team.name,
    organization: team.organization || '',
    location: team.location || '',
    rookieYear: team.rookieYear || new Date().getFullYear(),
    epa: team.epa ?? 0,
    autoEpa: team.autoEpa ?? 0,
    teleopEpa: team.teleopEpa ?? 0,
    endgameEpa: team.endgameEpa ?? 0,
    rank: team.rank ?? 999,
    record: team.record || { wins: 0, losses: 0, ties: 0 },
    imageUrl: team.imageUrl || '',
    cadUrl: team.cadUrl,
    drivetrain: team.drivetrain || 'Custom Swerve',
    status: team.status || 'Active',
  };
  await exec(
    `INSERT INTO teams (number, name, organization, location, rookie_year, epa, auto_epa, teleop_epa, endgame_epa,
      rank, wins, losses, ties, image_url, cad_url, drivetrain, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (number) DO UPDATE SET
       name = EXCLUDED.name,
       organization = EXCLUDED.organization,
       location = EXCLUDED.location,
       drivetrain = EXCLUDED.drivetrain,
       status = EXCLUDED.status`,
    [
      full.number,
      full.name,
      full.organization,
      full.location,
      full.rookieYear,
      full.epa,
      full.autoEpa,
      full.teleopEpa,
      full.endgameEpa,
      full.rank,
      full.record.wins,
      full.record.losses,
      full.record.ties,
      full.imageUrl,
      full.cadUrl || null,
      full.drivetrain,
      full.status,
    ]
  );
  // Adding data implies DB is no longer "cleared empty"
  await exec(`DELETE FROM meta WHERE key = 'cleared_at'`);
  return full;
}

export async function deleteTeam(teamNumber: number): Promise<void> {
  await ensureSchema();
  await exec(`DELETE FROM match_scouting WHERE team_number = $1`, [teamNumber]);
  await exec(`DELETE FROM pit_scouting WHERE team_number = $1`, [teamNumber]);
  await exec(`DELETE FROM picklist WHERE team_number = $1`, [teamNumber]);
  await exec(`DELETE FROM teams WHERE number = $1`, [teamNumber]);
}

export async function getAllScoutingEntries(): Promise<MatchScoutingEntry[]> {
  await ensureSchema();
  const rows = await q(`SELECT * FROM match_scouting ORDER BY timestamp DESC NULLS LAST`);
  return rows.map(scoutFromRow);
}

export async function clearAllData(): Promise<{ cleared: string[]; timestamp: string }> {
  await ensureSchema();
  const tables = [
    'match_scouting',
    'pit_scouting',
    'picklist',
    'matches',
    'teams',
    'collection_items',
    'member_accounts',
  ];
  for (const t of tables) {
    await exec(`DELETE FROM ${t}`);
  }
  const ts = new Date().toISOString();
  await exec(
    `INSERT INTO meta (key, value) VALUES ('cleared_at', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [ts]
  );
  return {
    cleared: [
      ...tables,
      'roster',
      'tasks',
      'floor_log',
      'engineering_notes',
      'outreach_demos',
      'machine_reservations',
      'hour_appeals',
      'certifications',
    ],
    timestamp: ts,
  };
}

export async function resetToDefaults(): Promise<{ message: string; timestamp: string }> {
  await clearAllData();
  await exec(`DELETE FROM meta WHERE key = 'cleared_at'`);
  await exec(`DELETE FROM meta WHERE key = 'start_clean'`);
  await seedDefaults();
  return {
    message: 'Database reset to full seed data (Postgres/Supabase)',
    timestamp: new Date().toISOString(),
  };
}

export async function getTableStats() {
  await ensureSchema();
  const count = async (table: string) => {
    const rows = await q<{ c: string }>(`SELECT COUNT(*)::text AS c FROM ${table}`);
    return Number(rows[0]?.c || 0);
  };
  const collCount = async (name: string) => {
    const rows = await q<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM collection_items WHERE collection = $1`,
      [name]
    );
    return Number(rows[0]?.c || 0);
  };

  return [
    { name: 'teams', rowCount: await count('teams'), description: 'FRC teams', columns: [{ name: 'number', type: 'INTEGER', isPrimary: true }, { name: 'name', type: 'TEXT' }] },
    { name: 'matches', rowCount: await count('matches'), description: 'Matches', columns: [{ name: 'match_number', type: 'INTEGER', isPrimary: true }] },
    { name: 'match_scouting', rowCount: await count('match_scouting'), description: 'Scout entries', columns: [{ name: 'id', type: 'TEXT', isPrimary: true }] },
    { name: 'pit_scouting', rowCount: await count('pit_scouting'), description: 'Pit data', columns: [{ name: 'team_number', type: 'INTEGER', isPrimary: true }] },
    { name: 'picklist', rowCount: await count('picklist'), description: 'Picklist', columns: [{ name: 'team_number', type: 'INTEGER', isPrimary: true }] },
    { name: 'roster (members)', rowCount: await collCount('roster'), description: 'Team members list', columns: [{ name: 'id', type: 'TEXT' }] },
    { name: 'tasks', rowCount: await collCount('tasks'), description: 'Subsystem tasks', columns: [{ name: 'id', type: 'TEXT' }] },
    { name: 'floor_log', rowCount: await collCount('floor_log'), description: 'Floor check-ins', columns: [{ name: 'id', type: 'TEXT' }] },
    { name: 'outreach_demos', rowCount: await collCount('outreach_demos'), description: 'Events / demos', columns: [{ name: 'id', type: 'TEXT' }] },
  ];
}

export async function executeSql(sql: string) {
  await ensureSchema();
  const start = performance.now();
  const clean = sql.trim();
  const upper = clean.toUpperCase();
  try {
    if (upper === 'CLEAR ALL DATA' || upper.startsWith('CLEAR DATABASE') || upper === 'TRUNCATE ALL') {
      const result = await clearAllData();
      return {
        columns: ['status', 'tables_cleared', 'timestamp'],
        rows: [{ status: 'CLEARED', tables_cleared: result.cleared.join(', '), timestamp: result.timestamp }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        rawSql: clean,
      };
    }
    if (upper === 'RESET DEFAULTS' || upper === 'SEED DEFAULTS') {
      const result = await resetToDefaults();
      return {
        columns: ['status', 'message', 'timestamp'],
        rows: [{ status: 'RESET', message: result.message, timestamp: result.timestamp }],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        rawSql: clean,
      };
    }
    if (upper.startsWith('SHOW TABLES')) {
      const tables = await getTableStats();
      return {
        columns: ['table_name', 'row_count', 'description'],
        rows: tables.map((t) => ({ table_name: t.name, row_count: t.rowCount, description: t.description })),
        rowCount: tables.length,
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        rawSql: clean,
      };
    }
    if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
      // Safety: only allow simple SELECTs against known tables
      const allowed = /from\s+(teams|matches|match_scouting|pit_scouting|picklist|access_keys|meta|collection_items)\b/i;
      if (!allowed.test(clean) && !/from\s+information_schema/i.test(clean)) {
        return {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 0,
          rawSql: clean,
          error: 'Only SELECT on app tables is allowed via console (teams, matches, match_scouting, …).',
        };
      }
      const rows = await q(clean);
      const columns = rows.length ? Object.keys(rows[0]) : ['result'];
      return {
        columns,
        rows: rows.length ? rows : [{ result: '0 rows returned' }],
        rowCount: rows.length,
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        rawSql: clean,
      };
    }
    return {
      columns: ['status', 'message'],
      rows: [
        {
          status: 'INFO',
          message: 'Postgres console supports SELECT, SHOW TABLES, CLEAR ALL DATA, RESET DEFAULTS.',
        },
      ],
      rowCount: 1,
      executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
      rawSql: clean,
    };
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
      rawSql: clean,
      error: err.message || 'Postgres query error',
    };
  }
}

export async function testConnection() {
  await ensureSchema();
  const start = Date.now();
  await q(`SELECT 1 AS ok`);
  const tables = await getTableStats();
  const totalRows = tables.reduce((s, t) => s + t.rowCount, 0);
  return {
    success: true,
    latencyMs: Date.now() - start,
    tables: tables.length,
    totalRows,
    url: getDatabaseUrl().replace(/:[^:@/]+@/, ':****@'),
  };
}
