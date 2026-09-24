import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
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

import os from 'os';

type GlobalDb = {
  __frcDb?: Database.Database;
  __frcDbInit?: boolean;
  __frcDbPath?: string;
};

const g = globalThis as unknown as GlobalDb;

/**
 * Resolve a writable directory for the SQLite file.
 * Serverless (e.g. /var/task) is read-only — fall back to /tmp.
 */
function resolveDataDir(): string {
  const candidates = [
    process.env.FRC_DATA_DIR,
    path.join(process.cwd(), 'data'),
    path.join(os.tmpdir(), 'frc-scouting-data'),
    '/tmp/frc-scouting-data',
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Prove we can write
      const probe = path.join(dir, '.write-test');
      fs.writeFileSync(probe, 'ok');
      fs.unlinkSync(probe);
      return dir;
    } catch {
      /* try next */
    }
  }

  // Last resort: in-memory (no persistence across restarts)
  return ':memory:';
}

function getDbPath(): string {
  if (g.__frcDbPath) return g.__frcDbPath;
  const dir = resolveDataDir();
  if (dir === ':memory:') {
    g.__frcDbPath = ':memory:';
    return g.__frcDbPath;
  }
  g.__frcDbPath = path.join(dir, 'frc_scouting.db');
  return g.__frcDbPath;
}

export function getDb(): Database.Database {
  if (g.__frcDb) return g.__frcDb;

  const dbPath = getDbPath();
  const db = new Database(dbPath);
  try {
    db.pragma('journal_mode = WAL');
  } catch {
    /* in-memory / some hosts reject WAL */
  }
  db.pragma('foreign_keys = ON');
  g.__frcDb = db;

  if (!g.__frcDbInit) {
    initSchema(db);
    seedIfEmpty(db);
    g.__frcDbInit = true;
  }

  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      number INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      organization TEXT,
      location TEXT,
      rookie_year INTEGER,
      epa REAL,
      auto_epa REAL,
      teleop_epa REAL,
      endgame_epa REAL,
      rank INTEGER,
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
      red_coop INTEGER,
      blue_coop INTEGER,
      red_rp INTEGER,
      blue_rp INTEGER,
      predicted_winner TEXT,
      predicted_win_prob REAL
    );

    CREATE TABLE IF NOT EXISTS match_scouting (
      id TEXT PRIMARY KEY,
      match_number INTEGER NOT NULL,
      team_number INTEGER NOT NULL,
      scout_name TEXT,
      alliance TEXT,
      driver_station INTEGER,
      auto_leave INTEGER,
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
      climb_time_seconds REAL DEFAULT 0,
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
      weight_lbs REAL,
      motors_drive TEXT,
      motors_steer TEXT,
      intake_type TEXT,
      scoring_capabilities TEXT,
      vision_system TEXT,
      preferred_autonomous TEXT,
      climb_capability TEXT,
      photo_url TEXT,
      pit_notes TEXT,
      inspection_passed INTEGER,
      battery_voltage REAL,
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

    -- Team Central sample / live ops data (members, events, tasks, etc.)
    CREATE TABLE IF NOT EXISTS collection_items (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (collection, id)
    );

    -- Member personal accounts (name + password; shared member token only at register)
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

const TEAM_CENTRAL_COLLECTIONS = [
  'certifications',
  'tasks',
  'roster',
  'floor_log',
  'engineering_notes',
  'outreach_demos',
  'machine_reservations',
  'hour_appeals',
] as const;

function seedIfEmpty(db: Database.Database) {
  // If admin cleared the DB, stay empty until explicit Reset Defaults
  try {
    const cleared = db.prepare(`SELECT value FROM meta WHERE key = 'cleared_at'`).get() as
      | { value: string }
      | undefined;
    if (cleared?.value) return;
  } catch {
    /* meta may be missing on brand-new file before schema — continue */
  }

  const startClean = ['1', 'true', 'yes', 'on'].includes(
    String(process.env.FRC_START_CLEAN || process.env.START_CLEAN || '').toLowerCase()
  );

  const row = db.prepare('SELECT COUNT(*) AS c FROM teams').get() as { c: number };
  let rosterCount = 0;
  try {
    rosterCount = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM collection_items WHERE collection = 'roster'`)
        .get() as { c: number }
    ).c;
  } catch {
    rosterCount = 0;
  }

  // Full seed when empty, or backfill Team Central collections on upgraded DBs
  if (row.c > 0 && rosterCount > 0) return;
  if (row.c > 0 && rosterCount === 0 && !startClean) {
    // Only backfill collections — do not wipe scouting data
    const tx = db.transaction(() => {
      putCollection(db, 'certifications', INITIAL_CERTIFICATIONS);
      putCollection(db, 'tasks', INITIAL_TASKS);
      putCollection(db, 'roster', INITIAL_ROSTER);
      putCollection(db, 'floor_log', INITIAL_FLOOR_LOG);
      putCollection(db, 'engineering_notes', INITIAL_ENGINEERING_NOTES);
      putCollection(db, 'outreach_demos', INITIAL_OUTREACH_DEMOS);
      putCollection(db, 'machine_reservations', INITIAL_MACHINE_RESERVATIONS);
      putCollection(db, 'hour_appeals', INITIAL_HOUR_APPEALS);
    });
    tx();
    return;
  }
  if (row.c === 0) {
    if (startClean) {
      try {
        db.prepare(
          `INSERT OR REPLACE INTO meta (key, value) VALUES ('cleared_at', ?), ('start_clean', 'true')`
        ).run(new Date().toISOString());
      } catch {
        /* ignore */
      }
      return;
    }
    seedDefaults(db);
  }
}

function putCollection(db: Database.Database, collection: string, items: Array<{ id: string } & Record<string, any>>) {
  const del = db.prepare(`DELETE FROM collection_items WHERE collection = ?`);
  const ins = db.prepare(
    `INSERT OR REPLACE INTO collection_items (collection, id, data) VALUES (@collection, @id, @data)`
  );
  del.run(collection);
  for (const item of items) {
    const id = String(item.id ?? `${collection}-${Math.random().toString(36).slice(2, 9)}`);
    ins.run({ collection, id, data: JSON.stringify({ ...item, id }) });
  }
}

function getCollection<T extends { id: string }>(collection: string): T[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT data FROM collection_items WHERE collection = ? ORDER BY id ASC`)
    .all(collection) as { data: string }[];
  return rows.map((r) => {
    try {
      return JSON.parse(r.data) as T;
    } catch {
      return null;
    }
  }).filter(Boolean) as T[];
}

function seedDefaults(db: Database.Database) {
  const insertTeam = db.prepare(`
    INSERT OR REPLACE INTO teams (
      number, name, organization, location, rookie_year, epa, auto_epa, teleop_epa, endgame_epa,
      rank, wins, losses, ties, image_url, cad_url, drivetrain, status
    ) VALUES (
      @number, @name, @organization, @location, @rookie_year, @epa, @auto_epa, @teleop_epa, @endgame_epa,
      @rank, @wins, @losses, @ties, @image_url, @cad_url, @drivetrain, @status
    )
  `);

  const insertMatch = db.prepare(`
    INSERT OR REPLACE INTO matches (
      match_number, comp_level, scheduled_time, status, red_teams, blue_teams,
      red_score, blue_score, red_auto, blue_auto, red_teleop, blue_teleop,
      red_endgame, blue_endgame, red_coop, blue_coop, red_rp, blue_rp,
      predicted_winner, predicted_win_prob
    ) VALUES (
      @match_number, @comp_level, @scheduled_time, @status, @red_teams, @blue_teams,
      @red_score, @blue_score, @red_auto, @blue_auto, @red_teleop, @blue_teleop,
      @red_endgame, @blue_endgame, @red_coop, @blue_coop, @red_rp, @blue_rp,
      @predicted_winner, @predicted_win_prob
    )
  `);

  const insertScout = db.prepare(`
    INSERT OR REPLACE INTO match_scouting (
      id, match_number, team_number, scout_name, alliance, driver_station,
      auto_leave, auto_coral_l1, auto_coral_l2, auto_coral_l3, auto_coral_l4,
      auto_algae_processor, auto_algae_net, auto_missed,
      teleop_coral_l1, teleop_coral_l2, teleop_coral_l3, teleop_coral_l4,
      teleop_algae_processor, teleop_algae_net, cycles, defense_rating,
      climb_status, climb_time_seconds, died_or_tipped, cards, driver_skill, notes, timestamp
    ) VALUES (
      @id, @match_number, @team_number, @scout_name, @alliance, @driver_station,
      @auto_leave, @auto_coral_l1, @auto_coral_l2, @auto_coral_l3, @auto_coral_l4,
      @auto_algae_processor, @auto_algae_net, @auto_missed,
      @teleop_coral_l1, @teleop_coral_l2, @teleop_coral_l3, @teleop_coral_l4,
      @teleop_algae_processor, @teleop_algae_net, @cycles, @defense_rating,
      @climb_status, @climb_time_seconds, @died_or_tipped, @cards, @driver_skill, @notes, @timestamp
    )
  `);

  const insertPit = db.prepare(`
    INSERT OR REPLACE INTO pit_scouting (
      team_number, scout_name, drivetrain, dimensions, weight_lbs, motors_drive, motors_steer,
      intake_type, scoring_capabilities, vision_system, preferred_autonomous, climb_capability,
      photo_url, pit_notes, inspection_passed, battery_voltage, last_checked
    ) VALUES (
      @team_number, @scout_name, @drivetrain, @dimensions, @weight_lbs, @motors_drive, @motors_steer,
      @intake_type, @scoring_capabilities, @vision_system, @preferred_autonomous, @climb_capability,
      @photo_url, @pit_notes, @inspection_passed, @battery_voltage, @last_checked
    )
  `);

  const insertPick = db.prepare(`
    INSERT OR REPLACE INTO picklist (
      team_number, rank, role, notes, strengths, weaknesses,
      favorite_alliance_partners, flagged_dnp, dnp_reason
    ) VALUES (
      @team_number, @rank, @role, @notes, @strengths, @weaknesses,
      @favorite_alliance_partners, @flagged_dnp, @dnp_reason
    )
  `);

  const insertKey = db.prepare(`
    INSERT OR REPLACE INTO access_keys (role, key_value, permissions, status, updated_at)
    VALUES (@role, @key_value, @permissions, @status, @updated_at)
  `);

  const tx = db.transaction(() => {
    for (const t of INITIAL_TEAMS) {
      insertTeam.run({
        number: t.number,
        name: t.name,
        organization: t.organization,
        location: t.location,
        rookie_year: t.rookieYear,
        epa: t.epa,
        auto_epa: t.autoEpa,
        teleop_epa: t.teleopEpa,
        endgame_epa: t.endgameEpa,
        rank: t.rank,
        wins: t.record.wins,
        losses: t.record.losses,
        ties: t.record.ties,
        image_url: t.imageUrl,
        cad_url: t.cadUrl || null,
        drivetrain: t.drivetrain,
        status: t.status,
      });
    }

    for (const m of INITIAL_MATCHES) {
      insertMatch.run({
        match_number: m.matchNumber,
        comp_level: m.compLevel,
        scheduled_time: m.scheduledTime,
        status: m.status,
        red_teams: JSON.stringify(m.redAlliance.teams),
        blue_teams: JSON.stringify(m.blueAlliance.teams),
        red_score: m.redAlliance.score ?? null,
        blue_score: m.blueAlliance.score ?? null,
        red_auto: m.redAlliance.autoScore ?? null,
        blue_auto: m.blueAlliance.autoScore ?? null,
        red_teleop: m.redAlliance.teleopScore ?? null,
        blue_teleop: m.blueAlliance.teleopScore ?? null,
        red_endgame: m.redAlliance.endgameScore ?? null,
        blue_endgame: m.blueAlliance.endgameScore ?? null,
        red_coop: m.redAlliance.coopertition ? 1 : 0,
        blue_coop: m.blueAlliance.coopertition ? 1 : 0,
        red_rp: m.redAlliance.rankingPoints ?? null,
        blue_rp: m.blueAlliance.rankingPoints ?? null,
        predicted_winner: m.predictedWinner,
        predicted_win_prob: m.predictedWinProb,
      });
    }

    for (const s of INITIAL_SCOUTING_ENTRIES) {
      insertScout.run(scoutingToRow(s));
    }

    for (const p of INITIAL_PIT_DATA) {
      insertPit.run(pitToRow(p));
    }

    for (const p of INITIAL_PICKLIST) {
      insertPick.run(picklistToRow(p));
    }

    const now = new Date().toISOString();
    const adminKey = (process.env.FRC_ADMIN_KEY || process.env.NEXT_PUBLIC_FRC_ADMIN_KEY || '').trim();
    const memberKey = (process.env.FRC_MEMBER_KEY || process.env.NEXT_PUBLIC_FRC_MEMBER_KEY || '').trim();
    if (adminKey) {
      insertKey.run({
        role: 'administrator',
        key_value: adminKey,
        permissions: 'ALL: READ, WRITE, SQL_EXEC, ADMIN_KEY_MGMT, CLEAR_DATA',
        status: 'Active',
        updated_at: now,
      });
    }
    if (memberKey) {
      insertKey.run({
        role: 'member',
        key_value: memberKey,
        permissions: 'SCOUT_SUBMIT, VIEW_STATS, PIT_VIEW, PICKLIST_READ',
        status: 'Active',
        updated_at: now,
      });
    }

    // Team Central seed (members, events, tasks, etc.)
    putCollection(db, 'certifications', INITIAL_CERTIFICATIONS);
    putCollection(db, 'tasks', INITIAL_TASKS);
    putCollection(db, 'roster', INITIAL_ROSTER);
    putCollection(db, 'floor_log', INITIAL_FLOOR_LOG);
    putCollection(db, 'engineering_notes', INITIAL_ENGINEERING_NOTES);
    putCollection(db, 'outreach_demos', INITIAL_OUTREACH_DEMOS);
    putCollection(db, 'machine_reservations', INITIAL_MACHINE_RESERVATIONS);
    putCollection(db, 'hour_appeals', INITIAL_HOUR_APPEALS);

    db.prepare(`DELETE FROM meta WHERE key = 'cleared_at'`).run();
    db.prepare(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('seeded_at', ?), ('db_version', '3.0')`
    ).run(now);
  });

  tx();
}

export function getTeamCentralData() {
  return {
    certifications: getCollection<Certification>('certifications'),
    tasks: getCollection<SubsystemTask>('tasks'),
    roster: getCollection<MemberRosterItem>('roster'),
    floorLog: getCollection<FloorCheckIn>('floor_log'),
    notes: getCollection<EngineeringNote>('engineering_notes'),
    demos: getCollection<OutreachDemo>('outreach_demos'),
    machineReservations: getCollection<MachineReservation>('machine_reservations'),
    hourAppeals: getCollection<HourAppealRecord>('hour_appeals'),
    loggedHours: 0,
    isCheckedIn: false,
  };
}

export function replaceTeamCentralCollection(
  collection: (typeof TEAM_CENTRAL_COLLECTIONS)[number],
  items: Array<{ id: string } & Record<string, any>>
) {
  const db = getDb();
  putCollection(db, collection, items);
  return getCollection(collection);
}

function scoutingToRow(s: MatchScoutingEntry) {
  return {
    id: s.id,
    match_number: s.matchNumber,
    team_number: s.teamNumber,
    scout_name: s.scoutName,
    alliance: s.alliance,
    driver_station: s.driverStation,
    auto_leave: s.autoLeave ? 1 : 0,
    auto_coral_l1: s.autoCoralL1,
    auto_coral_l2: s.autoCoralL2,
    auto_coral_l3: s.autoCoralL3,
    auto_coral_l4: s.autoCoralL4,
    auto_algae_processor: s.autoAlgaeProcessor,
    auto_algae_net: s.autoAlgaeNet,
    auto_missed: s.autoMissed,
    teleop_coral_l1: s.teleopCoralL1,
    teleop_coral_l2: s.teleopCoralL2,
    teleop_coral_l3: s.teleopCoralL3,
    teleop_coral_l4: s.teleopCoralL4,
    teleop_algae_processor: s.teleopAlgaeProcessor,
    teleop_algae_net: s.teleopAlgaeNet,
    cycles: s.cycles,
    defense_rating: s.defenseRating,
    climb_status: s.climbStatus,
    climb_time_seconds: s.climbTimeSeconds,
    died_or_tipped: s.diedOrTipped ? 1 : 0,
    cards: s.cards,
    driver_skill: s.driverSkill,
    notes: s.notes,
    timestamp: s.timestamp,
  };
}

function pitToRow(p: PitScoutingData) {
  return {
    team_number: p.teamNumber,
    scout_name: p.scoutName,
    drivetrain: p.drivetrain,
    dimensions: p.dimensions,
    weight_lbs: p.weightLbs,
    motors_drive: p.motorsDrive,
    motors_steer: p.motorsSteer,
    intake_type: p.intakeType,
    scoring_capabilities: JSON.stringify(p.scoringCapabilities || []),
    vision_system: p.visionSystem,
    preferred_autonomous: p.preferredAutonomous,
    climb_capability: p.climbCapability,
    photo_url: p.photoUrl,
    pit_notes: p.pitNotes,
    inspection_passed: p.inspectionPassed ? 1 : 0,
    battery_voltage: p.batteryVoltage,
    last_checked: p.lastChecked,
  };
}

function picklistToRow(p: PicklistTeam) {
  return {
    team_number: p.teamNumber,
    rank: p.rank,
    role: p.role,
    notes: p.notes,
    strengths: JSON.stringify(p.strengths || []),
    weaknesses: JSON.stringify(p.weaknesses || []),
    favorite_alliance_partners: JSON.stringify(p.favoriteAlliancePartners || []),
    flagged_dnp: p.flaggedDNP ? 1 : 0,
    dnp_reason: p.dnpReason || null,
  };
}

function parseJsonArray(val: string | null | undefined): any[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

function parseNumberArray(val: string | null | undefined): number[] {
  return parseJsonArray(val).map((n) => Number(n)).filter((n) => !Number.isNaN(n));
}

export function getAllTeams(): FrcTeam[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM teams ORDER BY rank ASC, number ASC').all() as any[];
  return rows.map((r) => ({
    number: r.number,
    name: r.name,
    organization: r.organization || '',
    location: r.location || '',
    rookieYear: r.rookie_year || 0,
    epa: r.epa || 0,
    autoEpa: r.auto_epa || 0,
    teleopEpa: r.teleop_epa || 0,
    endgameEpa: r.endgame_epa || 0,
    rank: r.rank || 0,
    record: { wins: r.wins || 0, losses: r.losses || 0, ties: r.ties || 0 },
    imageUrl: r.image_url || '',
    cadUrl: r.cad_url || undefined,
    drivetrain: r.drivetrain,
    status: r.status,
  }));
}

export function getAllMatches(): FrcMatch[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM matches ORDER BY match_number ASC').all() as any[];
  return rows.map((r) => ({
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
    predictedWinProb: r.predicted_win_prob || 0.5,
  }));
}

export function getAllScoutingEntries(): MatchScoutingEntry[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM match_scouting ORDER BY timestamp DESC, match_number DESC')
    .all() as any[];
  return rows.map((r) => ({
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
    climbTimeSeconds: r.climb_time_seconds || 0,
    diedOrTipped: !!r.died_or_tipped,
    cards: r.cards || 'None',
    driverSkill: r.driver_skill || 3,
    notes: r.notes || '',
    timestamp: r.timestamp || '',
  }));
}

export function getAllPitData(): PitScoutingData[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM pit_scouting ORDER BY team_number ASC').all() as any[];
  return rows.map((r) => ({
    teamNumber: r.team_number,
    scoutName: r.scout_name || '',
    drivetrain: r.drivetrain || '',
    dimensions: r.dimensions || '',
    weightLbs: r.weight_lbs || 0,
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
    batteryVoltage: r.battery_voltage || 0,
    lastChecked: r.last_checked || '',
  }));
}

export function getAllPicklist(): PicklistTeam[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM picklist ORDER BY rank ASC').all() as any[];
  return rows.map((r) => ({
    teamNumber: r.team_number,
    rank: r.rank,
    role: r.role,
    notes: r.notes || '',
    strengths: parseJsonArray(r.strengths).map(String),
    weaknesses: parseJsonArray(r.weaknesses).map(String),
    favoriteAlliancePartners: parseNumberArray(r.favorite_alliance_partners),
    flaggedDNP: !!r.flagged_dnp,
    dnpReason: r.dnp_reason || undefined,
  }));
}

export function getFullDataset() {
  const teamCentral = getTeamCentralData();
  return {
    teams: getAllTeams(),
    matches: getAllMatches(),
    scoutingEntries: getAllScoutingEntries(),
    pitData: getAllPitData(),
    picklist: getAllPicklist(),
    // Team Central
    certifications: teamCentral.certifications,
    tasks: teamCentral.tasks,
    roster: teamCentral.roster,
    floorLog: teamCentral.floorLog,
    notes: teamCentral.notes,
    demos: teamCentral.demos,
    machineReservations: teamCentral.machineReservations,
    hourAppeals: teamCentral.hourAppeals,
    loggedHours: teamCentral.loggedHours,
    isCheckedIn: teamCentral.isCheckedIn,
    lastUpdated: new Date().toISOString(),
  };
}

export function upsertScoutingEntry(entry: MatchScoutingEntry): MatchScoutingEntry {
  const db = getDb();
  const full: MatchScoutingEntry = {
    ...entry,
    id: entry.id || `scout-${Date.now()}`,
    timestamp: entry.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  db.prepare(`
    INSERT OR REPLACE INTO match_scouting (
      id, match_number, team_number, scout_name, alliance, driver_station,
      auto_leave, auto_coral_l1, auto_coral_l2, auto_coral_l3, auto_coral_l4,
      auto_algae_processor, auto_algae_net, auto_missed,
      teleop_coral_l1, teleop_coral_l2, teleop_coral_l3, teleop_coral_l4,
      teleop_algae_processor, teleop_algae_net, cycles, defense_rating,
      climb_status, climb_time_seconds, died_or_tipped, cards, driver_skill, notes, timestamp
    ) VALUES (
      @id, @match_number, @team_number, @scout_name, @alliance, @driver_station,
      @auto_leave, @auto_coral_l1, @auto_coral_l2, @auto_coral_l3, @auto_coral_l4,
      @auto_algae_processor, @auto_algae_net, @auto_missed,
      @teleop_coral_l1, @teleop_coral_l2, @teleop_coral_l3, @teleop_coral_l4,
      @teleop_algae_processor, @teleop_algae_net, @cycles, @defense_rating,
      @climb_status, @climb_time_seconds, @died_or_tipped, @cards, @driver_skill, @notes, @timestamp
    )
  `).run(scoutingToRow(full));

  // Slight EPA bump based on scouted performance
  const totalCoral =
    (full.teleopCoralL1 || 0) +
    (full.teleopCoralL2 || 0) +
    (full.teleopCoralL3 || 0) +
    (full.teleopCoralL4 || 0);
  const autoCoral =
    (full.autoCoralL1 || 0) +
    (full.autoCoralL2 || 0) +
    (full.autoCoralL3 || 0) +
    (full.autoCoralL4 || 0);
  const bump = Math.min(1.5, (totalCoral + autoCoral * 1.5) * 0.1);
  db.prepare('UPDATE teams SET epa = ROUND(epa + ?, 1) WHERE number = ?').run(bump, full.teamNumber);

  return full;
}

export function upsertPitData(pit: PitScoutingData): PitScoutingData {
  const db = getDb();
  const full: PitScoutingData = {
    ...pit,
    lastChecked: pit.lastChecked || new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  db.prepare(`
    INSERT OR REPLACE INTO pit_scouting (
      team_number, scout_name, drivetrain, dimensions, weight_lbs, motors_drive, motors_steer,
      intake_type, scoring_capabilities, vision_system, preferred_autonomous, climb_capability,
      photo_url, pit_notes, inspection_passed, battery_voltage, last_checked
    ) VALUES (
      @team_number, @scout_name, @drivetrain, @dimensions, @weight_lbs, @motors_drive, @motors_steer,
      @intake_type, @scoring_capabilities, @vision_system, @preferred_autonomous, @climb_capability,
      @photo_url, @pit_notes, @inspection_passed, @battery_voltage, @last_checked
    )
  `).run(pitToRow(full));
  return full;
}

export function replacePicklist(list: PicklistTeam[]): PicklistTeam[] {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM picklist').run();
    const stmt = db.prepare(`
      INSERT INTO picklist (
        team_number, rank, role, notes, strengths, weaknesses,
        favorite_alliance_partners, flagged_dnp, dnp_reason
      ) VALUES (
        @team_number, @rank, @role, @notes, @strengths, @weaknesses,
        @favorite_alliance_partners, @flagged_dnp, @dnp_reason
      )
    `);
    for (const p of list) {
      stmt.run(picklistToRow(p));
    }
  });
  tx();
  return getAllPicklist();
}

export function clearAllData(): { cleared: string[]; timestamp: string } {
  const db = getDb();
  const tables = [
    'match_scouting',
    'pit_scouting',
    'picklist',
    'matches',
    'teams',
    'collection_items',
    'member_accounts',
  ];
  const tx = db.transaction(() => {
    for (const t of tables) {
      try {
        db.prepare(`DELETE FROM ${t}`).run();
      } catch {
        /* table may not exist yet on older DBs */
      }
    }
    // Wipe any leftover collection rows by name as well
    for (const c of TEAM_CENTRAL_COLLECTIONS) {
      try {
        db.prepare(`DELETE FROM collection_items WHERE collection = ?`).run(c);
      } catch {
        /* ignore */
      }
    }
    db.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('cleared_at', ?)`).run(
      new Date().toISOString()
    );
  });
  tx();
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
    timestamp: new Date().toISOString(),
  };
}

export function resetToDefaults(): { message: string; timestamp: string } {
  const db = getDb();
  const tx = db.transaction(() => {
    for (const t of [
      'match_scouting',
      'pit_scouting',
      'picklist',
      'matches',
      'teams',
      'collection_items',
    ]) {
      try {
        db.prepare(`DELETE FROM ${t}`).run();
      } catch {
        /* ignore */
      }
    }
    db.prepare(`DELETE FROM meta WHERE key = 'cleared_at'`).run();
  });
  tx();
  seedDefaults(db);
  return {
    message: 'Database reset to full seed data (scouting + members + events)',
    timestamp: new Date().toISOString(),
  };
}

export function getTableStats() {
  const db = getDb();
  const count = (table: string) =>
    (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c;

  return [
    {
      name: 'teams',
      rowCount: count('teams'),
      description: 'FRC Registered Teams, EPA ratings, rankings, and chassis configuration',
      columns: [
        { name: 'number', type: 'INTEGER', isPrimary: true },
        { name: 'name', type: 'TEXT' },
        { name: 'organization', type: 'TEXT' },
        { name: 'location', type: 'TEXT' },
        { name: 'rookie_year', type: 'INTEGER' },
        { name: 'epa', type: 'REAL' },
        { name: 'auto_epa', type: 'REAL' },
        { name: 'teleop_epa', type: 'REAL' },
        { name: 'endgame_epa', type: 'REAL' },
        { name: 'rank', type: 'INTEGER' },
        { name: 'wins', type: 'INTEGER' },
        { name: 'losses', type: 'INTEGER' },
        { name: 'ties', type: 'INTEGER' },
        { name: 'drivetrain', type: 'TEXT' },
        { name: 'status', type: 'TEXT' },
      ],
    },
    {
      name: 'matches',
      rowCount: count('matches'),
      description: 'Qualification and Playoff matches with alliance breakdowns and predicted win probabilities',
      columns: [
        { name: 'match_number', type: 'INTEGER', isPrimary: true },
        { name: 'comp_level', type: 'TEXT' },
        { name: 'scheduled_time', type: 'TEXT' },
        { name: 'status', type: 'TEXT' },
        { name: 'red_teams', type: 'TEXT' },
        { name: 'blue_teams', type: 'TEXT' },
        { name: 'red_score', type: 'INTEGER', nullable: true },
        { name: 'blue_score', type: 'INTEGER', nullable: true },
        { name: 'predicted_winner', type: 'TEXT' },
        { name: 'predicted_win_prob', type: 'REAL' },
      ],
    },
    {
      name: 'match_scouting',
      rowCount: count('match_scouting'),
      description: 'Real-time scout observations recorded per team per match during tournament play',
      columns: [
        { name: 'id', type: 'TEXT', isPrimary: true },
        { name: 'match_number', type: 'INTEGER' },
        { name: 'team_number', type: 'INTEGER' },
        { name: 'scout_name', type: 'TEXT' },
        { name: 'alliance', type: 'TEXT' },
        { name: 'auto_leave', type: 'INTEGER' },
        { name: 'cycles', type: 'INTEGER' },
        { name: 'climb_status', type: 'TEXT' },
        { name: 'defense_rating', type: 'INTEGER' },
        { name: 'notes', type: 'TEXT' },
        { name: 'timestamp', type: 'TEXT' },
      ],
    },
    {
      name: 'pit_scouting',
      rowCount: count('pit_scouting'),
      description: 'Physical inspection measurements, CAD links, drivetrain motors, and battery voltage',
      columns: [
        { name: 'team_number', type: 'INTEGER', isPrimary: true },
        { name: 'scout_name', type: 'TEXT' },
        { name: 'drivetrain', type: 'TEXT' },
        { name: 'dimensions', type: 'TEXT' },
        { name: 'weight_lbs', type: 'REAL' },
        { name: 'motors_drive', type: 'TEXT' },
        { name: 'motors_steer', type: 'TEXT' },
        { name: 'intake_type', type: 'TEXT' },
        { name: 'vision_system', type: 'TEXT' },
        { name: 'climb_capability', type: 'TEXT' },
        { name: 'inspection_passed', type: 'INTEGER' },
        { name: 'battery_voltage', type: 'REAL' },
        { name: 'last_checked', type: 'TEXT' },
      ],
    },
    {
      name: 'picklist',
      rowCount: count('picklist'),
      description: 'Alliance selection draft list with strategic priorities, role assignments, and DNP flags',
      columns: [
        { name: 'team_number', type: 'INTEGER', isPrimary: true },
        { name: 'rank', type: 'INTEGER' },
        { name: 'role', type: 'TEXT' },
        { name: 'strengths', type: 'TEXT' },
        { name: 'weaknesses', type: 'TEXT' },
        { name: 'flagged_dnp', type: 'INTEGER' },
        { name: 'notes', type: 'TEXT' },
      ],
    },
    {
      name: 'access_keys',
      rowCount: count('access_keys'),
      description: 'Authentication access keys configuration for Administrator and Member roles',
      columns: [
        { name: 'role', type: 'TEXT', isPrimary: true },
        { name: 'key_value', type: 'TEXT' },
        { name: 'permissions', type: 'TEXT' },
        { name: 'status', type: 'TEXT' },
      ],
    },
  ];
}

export function executeSql(sql: string): {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  rawSql: string;
  error?: string;
} {
  const db = getDb();
  const start = performance.now();
  const clean = sql.trim();
  const upper = clean.toUpperCase();

  try {
    // Block dangerous multi-statement dumps except simple GO separators
    const statements = clean
      .split(/;\s*(?=SELECT|INSERT|UPDATE|DELETE|SHOW|DESCRIBE|PRAGMA|CREATE|DROP|CLEAR)/i)
      .map((s) => s.trim())
      .filter(Boolean);

    const primary = statements[0] || clean;

    if (/^(SELECT|PRAGMA|SHOW|DESCRIBE|EXPLAIN)/i.test(primary)) {
      const stmt = db.prepare(primary.replace(/^SHOW\s+TABLES/i, "SELECT name AS table_name FROM sqlite_master WHERE type='table' ORDER BY name").replace(/^DESCRIBE\s+(\w+)/i, 'PRAGMA table_info($1)'));
      // Handle DESCRIBE specially
      let rows: any[];
      if (/^DESCRIBE\s+/i.test(primary)) {
        const table = primary.match(/^DESCRIBE\s+(\w+)/i)?.[1];
        rows = db.prepare(`PRAGMA table_info(${table})`).all();
      } else if (/^SHOW\s+TABLES/i.test(primary)) {
        rows = db
          .prepare("SELECT name AS table_name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
          .all();
      } else {
        rows = stmt.all();
      }
      const columns = rows.length > 0 ? Object.keys(rows[0]) : ['result'];
      if (rows.length === 0) {
        rows = [{ result: '0 rows returned' }];
      }
      return {
        columns,
        rows,
        rowCount: rows[0]?.result === '0 rows returned' ? 0 : rows.length,
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        rawSql: clean,
      };
    }

    if (/^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(primary)) {
      const info = db.prepare(primary).run();
      return {
        columns: ['status', 'rows_affected', 'last_insert_rowid'],
        rows: [
          {
            status: 'SUCCESS',
            rows_affected: info.changes,
            last_insert_rowid: Number(info.lastInsertRowid),
          },
        ],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        rawSql: clean,
      };
    }

    // Fallback: try as select
    const rows = db.prepare(primary).all() as any[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : ['result'];
    return {
      columns,
      rows: rows.length ? rows : [{ result: 'OK' }],
      rowCount: rows.length,
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
      error: err.message || 'SQL execution error',
    };
  }
}

export function generateSqlDump(): string {
  const teams = getAllTeams();
  const scouting = getAllScoutingEntries();
  const pits = getAllPitData();
  const picklist = getAllPicklist();
  const matches = getAllMatches();

  let dump = `-- FRC TELEMETRY & SCOUTING COMMAND CENTER
-- SQLite / SQL Server Compatible Dump
-- Generated at: ${new Date().toISOString()}
-- Database: frc_scouting_db

-- SCHEMA
CREATE TABLE IF NOT EXISTS teams (
  number INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  organization TEXT,
  location TEXT,
  rookie_year INTEGER,
  epa REAL,
  auto_epa REAL,
  teleop_epa REAL,
  endgame_epa REAL,
  rank INTEGER,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  drivetrain TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS match_scouting (
  id TEXT PRIMARY KEY,
  match_number INTEGER NOT NULL,
  team_number INTEGER NOT NULL,
  scout_name TEXT,
  alliance TEXT,
  cycles INTEGER,
  climb_status TEXT,
  notes TEXT,
  timestamp TEXT
);

CREATE TABLE IF NOT EXISTS pit_scouting (
  team_number INTEGER PRIMARY KEY,
  scout_name TEXT,
  drivetrain TEXT,
  weight_lbs REAL,
  battery_voltage REAL,
  inspection_passed INTEGER
);

CREATE TABLE IF NOT EXISTS picklist (
  team_number INTEGER PRIMARY KEY,
  rank INTEGER,
  role TEXT,
  notes TEXT,
  flagged_dnp INTEGER
);

CREATE TABLE IF NOT EXISTS matches (
  match_number INTEGER PRIMARY KEY,
  comp_level TEXT,
  scheduled_time TEXT,
  status TEXT,
  red_teams TEXT,
  blue_teams TEXT,
  red_score INTEGER,
  blue_score INTEGER
);

-- DATA
`;

  for (const t of teams) {
    dump += `INSERT INTO teams (number, name, organization, location, rookie_year, epa, auto_epa, teleop_epa, endgame_epa, rank, wins, losses, drivetrain, status) VALUES (${t.number}, '${esc(t.name)}', '${esc(t.organization)}', '${esc(t.location)}', ${t.rookieYear}, ${t.epa}, ${t.autoEpa}, ${t.teleopEpa}, ${t.endgameEpa}, ${t.rank}, ${t.record.wins}, ${t.record.losses}, '${esc(t.drivetrain)}', '${esc(t.status)}');\n`;
  }

  for (const s of scouting) {
    dump += `INSERT INTO match_scouting (id, match_number, team_number, scout_name, alliance, cycles, climb_status, notes, timestamp) VALUES ('${esc(s.id)}', ${s.matchNumber}, ${s.teamNumber}, '${esc(s.scoutName)}', '${esc(s.alliance)}', ${s.cycles}, '${esc(s.climbStatus)}', '${esc(s.notes)}', '${esc(s.timestamp)}');\n`;
  }

  for (const p of pits) {
    dump += `INSERT INTO pit_scouting (team_number, scout_name, drivetrain, weight_lbs, battery_voltage, inspection_passed) VALUES (${p.teamNumber}, '${esc(p.scoutName)}', '${esc(p.drivetrain)}', ${p.weightLbs}, ${p.batteryVoltage}, ${p.inspectionPassed ? 1 : 0});\n`;
  }

  for (const p of picklist) {
    dump += `INSERT INTO picklist (team_number, rank, role, notes, flagged_dnp) VALUES (${p.teamNumber}, ${p.rank}, '${esc(p.role)}', '${esc(p.notes)}', ${p.flaggedDNP ? 1 : 0});\n`;
  }

  for (const m of matches) {
    dump += `INSERT INTO matches (match_number, comp_level, scheduled_time, status, red_teams, blue_teams, red_score, blue_score) VALUES (${m.matchNumber}, '${esc(m.compLevel)}', '${esc(m.scheduledTime)}', '${esc(m.status)}', '${m.redAlliance.teams.join(',')}', '${m.blueAlliance.teams.join(',')}', ${m.redAlliance.score ?? 'NULL'}, ${m.blueAlliance.score ?? 'NULL'});\n`;
  }

  dump += '\n-- END OF DUMP\n';
  return dump;
}

function esc(s: string | undefined | null): string {
  return (s || '').replace(/'/g, "''");
}

export function getSqliteDbPath(): string {
  return getDbPath();
}
