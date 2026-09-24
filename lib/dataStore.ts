/**
 * Unified data store priority:
 * 1) DATABASE_URL / Supabase Postgres pooler (lib/pg.ts)
 * 2) Supabase JS client (URL + service role)
 * 3) Local SQLite fallback
 */
import { getSupabase, isSupabaseConfigured, getBackendInfo as getSupabaseBackendInfo } from '@/lib/supabase';
import * as pg from '@/lib/pg';
import * as sqlite from '@/lib/db';
import { shouldStartClean as pgStartClean } from '@/lib/pg';
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

const EMPTY_TEAM_CENTRAL = {
  certifications: [] as Certification[],
  tasks: [] as SubsystemTask[],
  roster: [] as MemberRosterItem[],
  floorLog: [] as FloorCheckIn[],
  notes: [] as EngineeringNote[],
  demos: [] as OutreachDemo[],
  machineReservations: [] as MachineReservation[],
  hourAppeals: [] as HourAppealRecord[],
  loggedHours: 0,
  isCheckedIn: false,
};

async function supabasePutCollection(collection: string, items: Array<{ id: string } & Record<string, any>>) {
  const sb = getSupabase()!;
  await sb.from('collection_items').delete().eq('collection', collection);
  if (!items.length) return;
  const rows = items.map((item) => ({
    collection,
    id: String(item.id),
    data: JSON.stringify(item),
  }));
  const { error } = await sb.from('collection_items').upsert(rows);
  if (error) throw error;
}

async function supabaseGetCollection<T extends { id: string }>(collection: string): Promise<T[]> {
  const sb = getSupabase()!;
  const { data, error } = await sb.from('collection_items').select('data').eq('collection', collection);
  if (error) {
    // Table may not exist yet — treat as empty
    if (String(error.message).toLowerCase().includes('does not exist') || error.code === '42P01') {
      return [];
    }
    throw error;
  }
  return (data || [])
    .map((r: any) => {
      try {
        return typeof r.data === 'string' ? (JSON.parse(r.data) as T) : (r.data as T);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as T[];
}

async function supabaseGetTeamCentral() {
  try {
    return {
      certifications: await supabaseGetCollection<Certification>('certifications'),
      tasks: await supabaseGetCollection<SubsystemTask>('tasks'),
      roster: await supabaseGetCollection<MemberRosterItem>('roster'),
      floorLog: await supabaseGetCollection<FloorCheckIn>('floor_log'),
      notes: await supabaseGetCollection<EngineeringNote>('engineering_notes'),
      demos: await supabaseGetCollection<OutreachDemo>('outreach_demos'),
      machineReservations: await supabaseGetCollection<MachineReservation>('machine_reservations'),
      hourAppeals: await supabaseGetCollection<HourAppealRecord>('hour_appeals'),
      loggedHours: 0,
      isCheckedIn: false,
    };
  } catch {
    return { ...EMPTY_TEAM_CENTRAL };
  }
}

async function supabaseSeedTeamCentral() {
  await supabasePutCollection('certifications', INITIAL_CERTIFICATIONS);
  await supabasePutCollection('tasks', INITIAL_TASKS);
  await supabasePutCollection('roster', INITIAL_ROSTER);
  await supabasePutCollection('floor_log', INITIAL_FLOOR_LOG);
  await supabasePutCollection('engineering_notes', INITIAL_ENGINEERING_NOTES);
  await supabasePutCollection('outreach_demos', INITIAL_OUTREACH_DEMOS);
  await supabasePutCollection('machine_reservations', INITIAL_MACHINE_RESERVATIONS);
  await supabasePutCollection('hour_appeals', INITIAL_HOUR_APPEALS);
}

async function supabaseClearTeamCentral() {
  const sb = getSupabase()!;
  const { error } = await sb.from('collection_items').delete().neq('id', '__impossible__');
  if (error && !String(error.message).toLowerCase().includes('does not exist')) {
    // try per-collection
    for (const c of [
      'certifications',
      'tasks',
      'roster',
      'floor_log',
      'engineering_notes',
      'outreach_demos',
      'machine_reservations',
      'hour_appeals',
    ]) {
      await sb.from('collection_items').delete().eq('collection', c);
    }
  }
}

function parseJsonArray(val: string | null | undefined): any[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(val)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

function parseNumberArray(val: string | null | undefined): number[] {
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
  };
}

function teamToRow(t: FrcTeam) {
  return {
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
    predictedWinProb: r.predicted_win_prob || 0.5,
  };
}

function matchToRow(m: FrcMatch) {
  return {
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
    climbTimeSeconds: r.climb_time_seconds || 0,
    diedOrTipped: !!r.died_or_tipped,
    cards: r.cards || 'None',
    driverSkill: r.driver_skill || 3,
    notes: r.notes || '',
    timestamp: r.timestamp || '',
  };
}

function scoutToRow(s: MatchScoutingEntry) {
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

function pitFromRow(r: any): PitScoutingData {
  return {
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

function pickToRow(p: PicklistTeam) {
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

async function supabaseGetAllTeams(): Promise<FrcTeam[]> {
  const sb = getSupabase()!;
  const { data, error } = await sb.from('teams').select('*').order('rank', { ascending: true });
  if (error) throw error;
  return (data || []).map(teamFromRow);
}

async function supabaseGetAllMatches(): Promise<FrcMatch[]> {
  const sb = getSupabase()!;
  const { data, error } = await sb.from('matches').select('*').order('match_number', { ascending: true });
  if (error) throw error;
  return (data || []).map(matchFromRow);
}

async function supabaseGetAllScouting(): Promise<MatchScoutingEntry[]> {
  const sb = getSupabase()!;
  const { data, error } = await sb.from('match_scouting').select('*').order('timestamp', { ascending: false });
  if (error) throw error;
  return (data || []).map(scoutFromRow);
}

async function supabaseGetAllPit(): Promise<PitScoutingData[]> {
  const sb = getSupabase()!;
  const { data, error } = await sb.from('pit_scouting').select('*').order('team_number', { ascending: true });
  if (error) throw error;
  return (data || []).map(pitFromRow);
}

async function supabaseGetAllPicklist(): Promise<PicklistTeam[]> {
  const sb = getSupabase()!;
  const { data, error } = await sb.from('picklist').select('*').order('rank', { ascending: true });
  if (error) throw error;
  return (data || []).map(pickFromRow);
}

async function ensureSupabaseSeeded() {
  const sb = getSupabase()!;
  // Respect admin clear — do not auto-reseed
  const { data: clearedMeta } = await sb.from('meta').select('value').eq('key', 'cleared_at').maybeSingle();
  if (clearedMeta?.value) return;

  const { count, error } = await sb.from('teams').select('*', { count: 'exact', head: true });
  if (error) {
    throw new Error(
      `Supabase error: ${error.message}. Run supabase/schema.sql in the Supabase SQL Editor first.`
    );
  }
  if ((count || 0) > 0) {
    // Ensure team central collections exist if empty
    try {
      const roster = await supabaseGetCollection('roster');
      if (!roster.length) await supabaseSeedTeamCentral();
    } catch {
      /* ignore */
    }
    return;
  }

  await sb.from('teams').upsert(INITIAL_TEAMS.map(teamToRow));
  await sb.from('matches').upsert(INITIAL_MATCHES.map(matchToRow));
  await sb.from('match_scouting').upsert(INITIAL_SCOUTING_ENTRIES.map(scoutToRow));
  await sb.from('pit_scouting').upsert(INITIAL_PIT_DATA.map(pitToRow));
  await sb.from('picklist').upsert(INITIAL_PICKLIST.map(pickToRow));
  const now = new Date().toISOString();
  const adminKey = (process.env.FRC_ADMIN_KEY || process.env.NEXT_PUBLIC_FRC_ADMIN_KEY || '').trim();
  const memberKey = (process.env.FRC_MEMBER_KEY || process.env.NEXT_PUBLIC_FRC_MEMBER_KEY || '').trim();
  const keyRows: Array<Record<string, string>> = [];
  if (adminKey) {
    keyRows.push({
      role: 'administrator',
      key_value: adminKey,
      permissions: 'ALL: READ, WRITE, SQL_EXEC, ADMIN_KEY_MGMT, CLEAR_DATA',
      status: 'Active',
      updated_at: now,
    });
  }
  if (memberKey) {
    keyRows.push({
      role: 'member',
      key_value: memberKey,
      permissions: 'SCOUT_SUBMIT, VIEW_STATS, PIT_VIEW, PICKLIST_READ',
      status: 'Active',
      updated_at: now,
    });
  }
  if (keyRows.length) {
    await sb.from('access_keys').upsert(keyRows);
  }
  try {
    await supabaseSeedTeamCentral();
  } catch {
    /* collection_items may not exist yet */
  }
}

export async function getFullDataset() {
  if (pg.isPostgresConfigured()) {
    const data = await pg.pgGetFullDataset();
    return { ...data, backend: getEngineLabel() };
  }

  if (isSupabaseConfigured()) {
    await ensureSupabaseSeeded();
    const [teams, matches, scoutingEntries, pitData, picklist, teamCentral] = await Promise.all([
      supabaseGetAllTeams(),
      supabaseGetAllMatches(),
      supabaseGetAllScouting(),
      supabaseGetAllPit(),
      supabaseGetAllPicklist(),
      supabaseGetTeamCentral(),
    ]);
    return {
      teams,
      matches,
      scoutingEntries,
      pitData,
      picklist,
      ...teamCentral,
      lastUpdated: new Date().toISOString(),
      backend: getEngineLabel(),
    };
  }

  // SQLite: honor FRC_START_CLEAN
  if (pgStartClean()) {
    try {
      const meta = sqlite.getFullDataset();
      // If already has data and not cleared, leave it; seedIfEmpty in sqlite handles cleared_at
      void meta;
    } catch {
      /* ignore */
    }
  }

  const data = sqlite.getFullDataset();
  return { ...data, backend: getEngineLabel() };
}

export async function upsertScoutingEntry(entry: MatchScoutingEntry): Promise<MatchScoutingEntry> {
  const full: MatchScoutingEntry = {
    ...entry,
    id: entry.id || `scout-${Date.now()}`,
    timestamp: entry.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  if (pg.isPostgresConfigured()) {
    return pg.upsertScoutingEntry(full);
  }

  if (isSupabaseConfigured()) {
    const sb = getSupabase()!;
    const { error } = await sb.from('match_scouting').upsert(scoutToRow(full));
    if (error) throw error;

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
    const { data: team } = await sb.from('teams').select('epa').eq('number', full.teamNumber).maybeSingle();
    if (team) {
      await sb
        .from('teams')
        .update({ epa: Math.round(((team.epa || 0) + bump) * 10) / 10 })
        .eq('number', full.teamNumber);
    }
    return full;
  }

  return sqlite.upsertScoutingEntry(full);
}

export async function upsertPitData(pit: PitScoutingData): Promise<PitScoutingData> {
  const full: PitScoutingData = {
    ...pit,
    lastChecked: pit.lastChecked || new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  if (pg.isPostgresConfigured()) {
    return pg.upsertPitData(full);
  }
  if (isSupabaseConfigured()) {
    const sb = getSupabase()!;
    const { error } = await sb.from('pit_scouting').upsert(pitToRow(full));
    if (error) throw error;
    return full;
  }
  return sqlite.upsertPitData(full);
}

export async function replacePicklist(list: PicklistTeam[]): Promise<PicklistTeam[]> {
  if (pg.isPostgresConfigured()) {
    return pg.replacePicklist(list);
  }
  if (isSupabaseConfigured()) {
    const sb = getSupabase()!;
    await sb.from('picklist').delete().neq('team_number', -1);
    if (list.length) {
      const { error } = await sb.from('picklist').insert(list.map(pickToRow));
      if (error) throw error;
    }
    return supabaseGetAllPicklist();
  }
  return sqlite.replacePicklist(list);
}

export async function clearAllData(): Promise<{ cleared: string[]; timestamp: string; backend: string }> {
  const tables = [
    'match_scouting',
    'pit_scouting',
    'picklist',
    'matches',
    'teams',
    'collection_items',
    'roster',
    'tasks',
    'floor_log',
    'engineering_notes',
    'outreach_demos',
    'machine_reservations',
    'hour_appeals',
    'certifications',
  ];

  if (pg.isPostgresConfigured()) {
    const result = await pg.clearAllData();
    return { ...result, backend: 'postgres' };
  }

  if (isSupabaseConfigured()) {
    const sb = getSupabase()!;
    const { error: e1 } = await sb.from('match_scouting').delete().neq('id', '__impossible__');
    const { error: e2 } = await sb.from('pit_scouting').delete().neq('team_number', -999999999);
    const { error: e3 } = await sb.from('picklist').delete().neq('team_number', -999999999);
    const { error: e4 } = await sb.from('matches').delete().neq('match_number', -999999999);
    const { error: e5 } = await sb.from('teams').delete().neq('number', -999999999);

    const errors = [e1, e2, e3, e4, e5].filter(Boolean);
    if (errors.length) {
      throw new Error(
        `Supabase clear failed: ${errors.map((e) => e!.message).join('; ')}. Ensure schema.sql was applied and service role key is set.`
      );
    }

    try {
      await supabaseClearTeamCentral();
    } catch {
      /* collection_items optional until schema applied */
    }

    await sb.from('meta').upsert({ key: 'cleared_at', value: new Date().toISOString() });
    return { cleared: tables, timestamp: new Date().toISOString(), backend: 'supabase' };
  }

  const result = sqlite.clearAllData();
  return { ...result, backend: 'sqlite' };
}

export async function resetToDefaults(): Promise<{ message: string; timestamp: string; backend: string }> {
  if (pg.isPostgresConfigured()) {
    const result = await pg.resetToDefaults();
    return { ...result, backend: 'postgres' };
  }

  if (isSupabaseConfigured()) {
    await clearAllData();
    const sb = getSupabase()!;
    await sb.from('teams').upsert(INITIAL_TEAMS.map(teamToRow));
    await sb.from('matches').upsert(INITIAL_MATCHES.map(matchToRow));
    await sb.from('match_scouting').upsert(INITIAL_SCOUTING_ENTRIES.map(scoutToRow));
    await sb.from('pit_scouting').upsert(INITIAL_PIT_DATA.map(pitToRow));
    await sb.from('picklist').upsert(INITIAL_PICKLIST.map(pickToRow));
    try {
      await supabaseSeedTeamCentral();
    } catch {
      /* optional until collection_items exists */
    }
    await sb.from('meta').delete().eq('key', 'cleared_at');
    return {
      message: 'Database reset to full seed data — scouting, members, events (Supabase)',
      timestamp: new Date().toISOString(),
      backend: 'supabase',
    };
  }

  const result = sqlite.resetToDefaults();
  return { ...result, backend: 'sqlite' };
}

export async function upsertTeam(
  team: Partial<FrcTeam> & { number: number; name: string }
): Promise<FrcTeam> {
  if (pg.isPostgresConfigured()) {
    return pg.upsertTeam(team);
  }
  if (isSupabaseConfigured()) {
    const sb = getSupabase()!;
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
      drivetrain: (team.drivetrain as FrcTeam['drivetrain']) || 'Custom Swerve',
      status: (team.status as FrcTeam['status']) || 'Active',
    };
    const { error } = await sb.from('teams').upsert(teamToRow(full));
    if (error) throw error;
    await sb.from('meta').delete().eq('key', 'cleared_at');
    return full;
  }
  // SQLite path
  const db = sqlite.getDb();
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
    drivetrain: (team.drivetrain as FrcTeam['drivetrain']) || 'Custom Swerve',
    status: (team.status as FrcTeam['status']) || 'Active',
  };
  db.prepare(`
    INSERT OR REPLACE INTO teams (
      number, name, organization, location, rookie_year, epa, auto_epa, teleop_epa, endgame_epa,
      rank, wins, losses, ties, image_url, cad_url, drivetrain, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
    full.status
  );
  try {
    db.prepare(`DELETE FROM meta WHERE key = 'cleared_at'`).run();
  } catch {
    /* ignore */
  }
  return full;
}

export async function deleteTeam(teamNumber: number): Promise<void> {
  if (pg.isPostgresConfigured()) {
    await pg.deleteTeam(teamNumber);
    return;
  }
  if (isSupabaseConfigured()) {
    const sb = getSupabase()!;
    await sb.from('match_scouting').delete().eq('team_number', teamNumber);
    await sb.from('pit_scouting').delete().eq('team_number', teamNumber);
    await sb.from('picklist').delete().eq('team_number', teamNumber);
    await sb.from('teams').delete().eq('number', teamNumber);
    return;
  }
  const db = sqlite.getDb();
  db.prepare(`DELETE FROM match_scouting WHERE team_number = ?`).run(teamNumber);
  db.prepare(`DELETE FROM pit_scouting WHERE team_number = ?`).run(teamNumber);
  db.prepare(`DELETE FROM picklist WHERE team_number = ?`).run(teamNumber);
  db.prepare(`DELETE FROM teams WHERE number = ?`).run(teamNumber);
}

export async function getTableStats() {
  if (pg.isPostgresConfigured()) {
    return pg.getTableStats();
  }
  if (isSupabaseConfigured()) {
    const sb = getSupabase()!;
    const countOf = async (table: string) => {
      const { count } = await sb.from(table).select('*', { count: 'exact', head: true });
      return count || 0;
    };
    const base = sqlite.getTableStats();
    // Reuse column defs from sqlite helper, refresh counts
    const counts: Record<string, number> = {
      teams: await countOf('teams'),
      matches: await countOf('matches'),
      match_scouting: await countOf('match_scouting'),
      pit_scouting: await countOf('pit_scouting'),
      picklist: await countOf('picklist'),
      access_keys: await countOf('access_keys'),
    };
    return base.map((t) => ({ ...t, rowCount: counts[t.name] ?? t.rowCount }));
  }
  return sqlite.getTableStats();
}

export async function executeSql(sql: string) {
  if (pg.isPostgresConfigured()) {
    return pg.executeSql(sql);
  }
  // Live SQL console: when on Supabase, support a limited set of SELECTs via PostgREST-friendly patterns;
  // complex SQL still works on SQLite fallback.
  if (isSupabaseConfigured()) {
    const start = performance.now();
    const clean = sql.trim();
    const upper = clean.toUpperCase();

    try {
      if (upper === 'CLEAR ALL DATA' || upper === 'TRUNCATE ALL' || upper.startsWith('CLEAR DATABASE')) {
        const result = await clearAllData();
        return {
          columns: ['status', 'tables_cleared', 'timestamp', 'backend'],
          rows: [
            {
              status: 'CLEARED',
              tables_cleared: result.cleared.join(', '),
              timestamp: result.timestamp,
              backend: result.backend,
            },
          ],
          rowCount: 1,
          executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
          rawSql: clean,
        };
      }
      if (upper === 'RESET DEFAULTS' || upper === 'SEED DEFAULTS') {
        const result = await resetToDefaults();
        return {
          columns: ['status', 'message', 'timestamp', 'backend'],
          rows: [
            {
              status: 'RESET',
              message: result.message,
              timestamp: result.timestamp,
              backend: result.backend,
            },
          ],
          rowCount: 1,
          executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
          rawSql: clean,
        };
      }

      if (upper.startsWith('SHOW TABLES') || upper.startsWith('DESCRIBE')) {
        const tables = await getTableStats();
        const rows = tables.map((d) => ({
          table_name: d.name,
          total_columns: d.columns.length,
          row_count: d.rowCount,
          description: d.description,
        }));
        return {
          columns: ['table_name', 'total_columns', 'row_count', 'description'],
          rows,
          rowCount: rows.length,
          executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
          rawSql: clean,
        };
      }

      // Map simple SELECT * FROM table patterns to Supabase
      const fromMatch = clean.match(/from\s+(\w+)/i);
      if (upper.startsWith('SELECT') && fromMatch) {
        const table = fromMatch[1].toLowerCase();
        const allowed = ['teams', 'matches', 'match_scouting', 'pit_scouting', 'picklist', 'access_keys', 'meta'];
        if (!allowed.includes(table)) {
          return {
            columns: [],
            rows: [],
            rowCount: 0,
            executionTimeMs: 0,
            rawSql: clean,
            error: `Table '${table}' not allowed. Use: ${allowed.join(', ')}`,
          };
        }
        const sb = getSupabase()!;
        let q = sb.from(table).select('*');
        const limitMatch = clean.match(/limit\s+(\d+)/i);
        if (limitMatch) q = q.limit(parseInt(limitMatch[1], 10));
        else q = q.limit(100);

        const orderMatch = clean.match(/order\s+by\s+(\w+)\s*(asc|desc)?/i);
        if (orderMatch) {
          q = q.order(orderMatch[1], { ascending: (orderMatch[2] || 'asc').toLowerCase() !== 'desc' });
        }

        const { data, error } = await q;
        if (error) throw error;
        const rows = data || [];
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
            message:
              'Supabase mode supports SELECT / SHOW TABLES / CLEAR ALL DATA / RESET DEFAULTS. For arbitrary SQL use the Supabase SQL Editor.',
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
        error: err.message || 'Supabase query error',
      };
    }
  }

  return sqlite.executeSql(sql);
}

export async function generateSqlDump(): Promise<string> {
  if (isSupabaseConfigured()) {
    // Build dump from live Supabase data
    const dataset = await getFullDataset();
    // Temporarily reuse sqlite dump format by writing through a thin builder
    return buildDump(dataset);
  }
  return sqlite.generateSqlDump();
}

function esc(s: string | undefined | null): string {
  return (s || '').replace(/'/g, "''");
}

function buildDump(dataset: {
  teams: FrcTeam[];
  matches: FrcMatch[];
  scoutingEntries: MatchScoutingEntry[];
  pitData: PitScoutingData[];
  picklist: PicklistTeam[];
}): string {
  let dump = `-- FRC SCOUTING DUMP (Supabase/PostgreSQL)
-- Generated: ${new Date().toISOString()}

`;
  for (const t of dataset.teams) {
    dump += `INSERT INTO teams (number, name, organization, location, rookie_year, epa, auto_epa, teleop_epa, endgame_epa, rank, wins, losses, drivetrain, status) VALUES (${t.number}, '${esc(t.name)}', '${esc(t.organization)}', '${esc(t.location)}', ${t.rookieYear}, ${t.epa}, ${t.autoEpa}, ${t.teleopEpa}, ${t.endgameEpa}, ${t.rank}, ${t.record.wins}, ${t.record.losses}, '${esc(t.drivetrain)}', '${esc(t.status)}');\n`;
  }
  for (const s of dataset.scoutingEntries) {
    dump += `INSERT INTO match_scouting (id, match_number, team_number, scout_name, alliance, cycles, climb_status, notes, timestamp) VALUES ('${esc(s.id)}', ${s.matchNumber}, ${s.teamNumber}, '${esc(s.scoutName)}', '${esc(s.alliance)}', ${s.cycles}, '${esc(s.climbStatus)}', '${esc(s.notes)}', '${esc(s.timestamp)}');\n`;
  }
  for (const p of dataset.pitData) {
    dump += `INSERT INTO pit_scouting (team_number, scout_name, drivetrain, weight_lbs, battery_voltage, inspection_passed) VALUES (${p.teamNumber}, '${esc(p.scoutName)}', '${esc(p.drivetrain)}', ${p.weightLbs}, ${p.batteryVoltage}, ${p.inspectionPassed ? 1 : 0});\n`;
  }
  for (const p of dataset.picklist) {
    dump += `INSERT INTO picklist (team_number, rank, role, notes, flagged_dnp) VALUES (${p.teamNumber}, ${p.rank}, '${esc(p.role)}', '${esc(p.notes)}', ${p.flaggedDNP ? 1 : 0});\n`;
  }
  for (const m of dataset.matches) {
    dump += `INSERT INTO matches (match_number, comp_level, scheduled_time, status, red_teams, blue_teams, red_score, blue_score) VALUES (${m.matchNumber}, '${esc(m.compLevel)}', '${esc(m.scheduledTime)}', '${esc(m.status)}', '${m.redAlliance.teams.join(',')}', '${m.blueAlliance.teams.join(',')}', ${m.redAlliance.score ?? 'NULL'}, ${m.blueAlliance.score ?? 'NULL'});\n`;
  }
  dump += '\n-- END\n';
  return dump;
}

export function getEngineLabel() {
  if (pg.isPostgresConfigured()) {
    return {
      engine: 'postgres' as const,
      configured: true,
      url: pg.getDatabaseUrl().replace(/:[^:@/]+@/, ':****@'),
      message: 'Connected to Supabase PostgreSQL via DATABASE_URL (pooler)',
      startClean: pg.shouldStartClean(),
    };
  }
  if (isSupabaseConfigured()) {
    return { ...getSupabaseBackendInfo(), startClean: pg.shouldStartClean() };
  }
  return {
    engine: 'sqlite' as const,
    configured: true,
    message: 'Local SQLite fallback (set DATABASE_URL for Supabase Postgres)',
    startClean: pg.shouldStartClean(),
  };
}

export async function getAllScoutingEntries(): Promise<MatchScoutingEntry[]> {
  if (pg.isPostgresConfigured()) return pg.getAllScoutingEntries();
  if (isSupabaseConfigured()) return supabaseGetAllScouting();
  return sqlite.getAllScoutingEntries();
}

/** Re-export for callers that still import getBackendInfo name */
export function getBackendInfo() {
  return getEngineLabel();
}
