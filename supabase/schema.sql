-- FRC Scouting Command Center — Supabase / PostgreSQL schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  number INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  organization TEXT,
  location TEXT,
  rookie_year INTEGER,
  epa REAL DEFAULT 0,
  auto_epa REAL DEFAULT 0,
  teleop_epa REAL DEFAULT 0,
  endgame_epa REAL DEFAULT 0,
  rank INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  image_url TEXT,
  cad_url TEXT,
  drivetrain TEXT,
  status TEXT
);

-- Matches
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
  predicted_win_prob REAL
);

-- Match scouting
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
  climb_time_seconds REAL DEFAULT 0,
  died_or_tipped INTEGER DEFAULT 0,
  cards TEXT,
  driver_skill INTEGER DEFAULT 3,
  notes TEXT,
  timestamp TEXT
);

-- Pit scouting
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
  inspection_passed INTEGER DEFAULT 0,
  battery_voltage REAL,
  last_checked TEXT
);

-- Picklist
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

-- Access keys (optional; app also stores keys client-side)
CREATE TABLE IF NOT EXISTS access_keys (
  role TEXT PRIMARY KEY,
  key_value TEXT NOT NULL,
  permissions TEXT,
  status TEXT DEFAULT 'Active',
  updated_at TEXT
);

-- Meta
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Team Central collections (members, events, tasks, notes, etc.)
CREATE TABLE IF NOT EXISTS collection_items (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data JSONB NOT NULL,
  PRIMARY KEY (collection, id)
);

-- Open access for demo (tighten RLS for production)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scouting ENABLE ROW LEVEL SECURITY;
ALTER TABLE pit_scouting ENABLE ROW LEVEL SECURITY;
ALTER TABLE picklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public_all_teams" ON teams FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_all_collections" ON collection_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_all_matches" ON matches FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_all_scouting" ON match_scouting FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_all_pit" ON pit_scouting FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_all_picklist" ON picklist FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_all_keys" ON access_keys FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_all_meta" ON meta FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO access_keys (role, key_value, permissions, status, updated_at) VALUES
  ('administrator', 'FRC-ADMIN-2025', 'ALL: READ, WRITE, SQL_EXEC, ADMIN_KEY_MGMT, CLEAR_DATA', 'Active', NOW()::text),
  ('member', 'FRC-MEMBER-TEAM', 'SCOUT_SUBMIT, VIEW_STATS, PIT_VIEW, PICKLIST_READ', 'Active', NOW()::text)
ON CONFLICT (role) DO NOTHING;

-- Member personal accounts (name + password hash; shared member token only at register)
CREATE TABLE IF NOT EXISTS member_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

DO $$ BEGIN
  CREATE POLICY "public_all_member_accounts" ON member_accounts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
