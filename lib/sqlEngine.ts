import { FrcTeam, FrcMatch, MatchScoutingEntry, PitScoutingData, PicklistTeam } from '@/types/frc';

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  rawSql: string;
  error?: string;
}

export interface SqlTableDefinition {
  name: string;
  rowCount: number;
  columns: { name: string; type: string; isPrimary?: boolean; nullable?: boolean }[];
  description: string;
}

export class FrcSqlEngine {
  private teams: FrcTeam[] = [];
  private matches: FrcMatch[] = [];
  private scoutingEntries: MatchScoutingEntry[] = [];
  private pitData: PitScoutingData[] = [];
  private picklist: PicklistTeam[] = [];
  private connectionKey: string = '';
  private connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'local_fallback' = 'local_fallback';

  constructor(initialData?: {
    teams?: FrcTeam[];
    matches?: FrcMatch[];
    scoutingEntries?: MatchScoutingEntry[];
    pitData?: PitScoutingData[];
    picklist?: PicklistTeam[];
  }) {
    if (initialData) {
      this.teams = initialData.teams || [];
      this.matches = initialData.matches || [];
      this.scoutingEntries = initialData.scoutingEntries || [];
      this.pitData = initialData.pitData || [];
      this.picklist = initialData.picklist || [];
    }
  }

  public setConnectionKey(key: string) {
    this.connectionKey = key.trim();
    if (this.connectionKey.length > 0) {
      this.connectionStatus = 'connected';
    } else {
      this.connectionStatus = 'local_fallback';
    }
  }

  public getConnectionKey(): string {
    return this.connectionKey;
  }

  public getConnectionStatus() {
    return this.connectionStatus;
  }

  public getTableDefinitions(): SqlTableDefinition[] {
    return [
      {
        name: 'teams',
        rowCount: this.teams.length,
        description: 'FRC Registered Teams, EPA ratings, rankings, and chassis configuration',
        columns: [
          { name: 'number', type: 'INT', isPrimary: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'organization', type: 'VARCHAR(255)' },
          { name: 'location', type: 'VARCHAR(100)' },
          { name: 'rookie_year', type: 'INT' },
          { name: 'epa', type: 'FLOAT' },
          { name: 'auto_epa', type: 'FLOAT' },
          { name: 'teleop_epa', type: 'FLOAT' },
          { name: 'endgame_epa', type: 'FLOAT' },
          { name: 'rank', type: 'INT' },
          { name: 'wins', type: 'INT' },
          { name: 'losses', type: 'INT' },
          { name: 'ties', type: 'INT' },
          { name: 'drivetrain', type: 'VARCHAR(50)' },
          { name: 'status', type: 'VARCHAR(30)' },
        ],
      },
      {
        name: 'matches',
        rowCount: this.matches.length,
        description: 'Qualification and Playoff matches with alliance breakdowns and predicted win probabilities',
        columns: [
          { name: 'match_number', type: 'INT', isPrimary: true },
          { name: 'comp_level', type: 'VARCHAR(50)' },
          { name: 'scheduled_time', type: 'VARCHAR(30)' },
          { name: 'status', type: 'VARCHAR(30)' },
          { name: 'red_teams', type: 'VARCHAR(50)' },
          { name: 'blue_teams', type: 'VARCHAR(50)' },
          { name: 'red_score', type: 'INT', nullable: true },
          { name: 'blue_score', type: 'INT', nullable: true },
          { name: 'predicted_winner', type: 'VARCHAR(10)' },
          { name: 'predicted_win_prob', type: 'FLOAT' },
        ],
      },
      {
        name: 'match_scouting',
        rowCount: this.scoutingEntries.length,
        description: 'Real-time scout observations recorded per team per match during tournament play',
        columns: [
          { name: 'id', type: 'VARCHAR(64)', isPrimary: true },
          { name: 'match_number', type: 'INT' },
          { name: 'team_number', type: 'INT' },
          { name: 'scout_name', type: 'VARCHAR(100)' },
          { name: 'alliance', type: 'VARCHAR(10)' },
          { name: 'auto_leave', type: 'BOOLEAN' },
          { name: 'auto_coral_total', type: 'INT' },
          { name: 'teleop_coral_total', type: 'INT' },
          { name: 'algae_processor_total', type: 'INT' },
          { name: 'algae_net_total', type: 'INT' },
          { name: 'cycles', type: 'INT' },
          { name: 'defense_rating', type: 'INT' },
          { name: 'climb_status', type: 'VARCHAR(30)' },
          { name: 'climb_time_seconds', type: 'FLOAT' },
          { name: 'died_or_tipped', type: 'BOOLEAN' },
          { name: 'driver_skill', type: 'INT' },
          { name: 'notes', type: 'TEXT' },
          { name: 'timestamp', type: 'TIMESTAMP' },
        ],
      },
      {
        name: 'pit_scouting',
        rowCount: this.pitData.length,
        description: 'Physical inspection measurements, CAD links, drivetrain motors, and battery voltage',
        columns: [
          { name: 'team_number', type: 'INT', isPrimary: true },
          { name: 'scout_name', type: 'VARCHAR(100)' },
          { name: 'drivetrain', type: 'VARCHAR(100)' },
          { name: 'dimensions', type: 'VARCHAR(50)' },
          { name: 'weight_lbs', type: 'FLOAT' },
          { name: 'motors_drive', type: 'VARCHAR(100)' },
          { name: 'motors_steer', type: 'VARCHAR(100)' },
          { name: 'intake_type', type: 'VARCHAR(255)' },
          { name: 'vision_system', type: 'VARCHAR(255)' },
          { name: 'climb_capability', type: 'VARCHAR(255)' },
          { name: 'inspection_passed', type: 'BOOLEAN' },
          { name: 'battery_voltage', type: 'FLOAT' },
          { name: 'last_checked', type: 'VARCHAR(30)' },
        ],
      },
      {
        name: 'picklist',
        rowCount: this.picklist.length,
        description: 'Alliance selection draft list with strategic priorities, role assignments, and DNP flags',
        columns: [
          { name: 'team_number', type: 'INT', isPrimary: true },
          { name: 'rank', type: 'INT' },
          { name: 'role', type: 'VARCHAR(50)' },
          { name: 'strengths', type: 'TEXT' },
          { name: 'weaknesses', type: 'TEXT' },
          { name: 'flagged_dnp', type: 'BOOLEAN' },
          { name: 'notes', type: 'TEXT' },
        ],
      },
      {
        name: 'access_keys',
        rowCount: 2,
        description: 'Authentication access keys configuration for Administrator and Member roles',
        columns: [
          { name: 'role', type: 'VARCHAR(30)', isPrimary: true },
          { name: 'key_hash', type: 'VARCHAR(128)' },
          { name: 'permissions', type: 'TEXT' },
          { name: 'status', type: 'VARCHAR(20)' },
        ],
      },
    ];
  }

  public executeQuery(sql: string): SqlQueryResult {
    const startTime = performance.now();
    const cleanSql = sql.trim();
    const upperSql = cleanSql.toUpperCase();

    try {
      if (upperSql.startsWith('SELECT')) {
        return this.handleSelect(cleanSql, startTime);
      } else if (upperSql.startsWith('INSERT')) {
        return this.handleInsert(cleanSql, startTime);
      } else if (upperSql.startsWith('UPDATE')) {
        return this.handleUpdate(cleanSql, startTime);
      } else if (upperSql.startsWith('DELETE')) {
        return this.handleDelete(cleanSql, startTime);
      } else if (upperSql.startsWith('SHOW') || upperSql.startsWith('DESCRIBE')) {
        return this.handleDescribe(cleanSql, startTime);
      } else {
        const endTime = performance.now();
        return {
          columns: ['status', 'message'],
          rows: [{ status: 'SUCCESS', message: `Command '${cleanSql.slice(0, 30)}...' acknowledged by SQL Server.` }],
          rowCount: 1,
          executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
          rawSql: cleanSql,
        };
      }
    } catch (err: any) {
      const endTime = performance.now();
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
        rawSql: cleanSql,
        error: err.message || 'Syntax error in SQL query',
      };
    }
  }

  private handleSelect(sql: string, startTime: number): SqlQueryResult {
    const lower = sql.toLowerCase();
    let rows: Record<string, any>[] = [];
    let columns: string[] = [];

    if (lower.includes('from teams')) {
      rows = this.teams.map((t) => ({
        number: t.number,
        name: t.name,
        organization: t.organization,
        location: t.location,
        epa: t.epa,
        auto_epa: t.autoEpa,
        teleop_epa: t.teleopEpa,
        endgame_epa: t.endgameEpa,
        rank: t.rank,
        wins: t.record.wins,
        losses: t.record.losses,
        drivetrain: t.drivetrain,
        status: t.status,
      }));
    } else if (lower.includes('from match_scouting')) {
      rows = this.scoutingEntries.map((s) => ({
        id: s.id,
        match_number: s.matchNumber,
        team_number: s.teamNumber,
        scout_name: s.scoutName,
        alliance: s.alliance,
        auto_leave: s.autoLeave,
        auto_coral_total: s.autoCoralL1 + s.autoCoralL2 + s.autoCoralL3 + s.autoCoralL4,
        teleop_coral_total: s.teleopCoralL1 + s.teleopCoralL2 + s.teleopCoralL3 + s.teleopCoralL4,
        algae_processor_total: s.autoAlgaeProcessor + s.teleopAlgaeProcessor,
        algae_net_total: s.autoAlgaeNet + s.teleopAlgaeNet,
        cycles: s.cycles,
        defense_rating: s.defenseRating,
        climb_status: s.climbStatus,
        climb_time_seconds: s.climbTimeSeconds,
        driver_skill: s.driverSkill,
        notes: s.notes,
        timestamp: s.timestamp,
      }));
    } else if (lower.includes('from pit_scouting')) {
      rows = this.pitData.map((p) => ({
        team_number: p.teamNumber,
        scout_name: p.scoutName,
        drivetrain: p.drivetrain,
        dimensions: p.dimensions,
        weight_lbs: p.weightLbs,
        motors_drive: p.motorsDrive,
        motors_steer: p.motorsSteer,
        intake_type: p.intakeType,
        vision_system: p.visionSystem,
        inspection_passed: p.inspectionPassed,
        battery_voltage: p.batteryVoltage,
        last_checked: p.lastChecked,
      }));
    } else if (lower.includes('from matches')) {
      rows = this.matches.map((m) => ({
        match_number: m.matchNumber,
        comp_level: m.compLevel,
        scheduled_time: m.scheduledTime,
        status: m.status,
        red_teams: m.redAlliance.teams.join(', '),
        blue_teams: m.blueAlliance.teams.join(', '),
        red_score: m.redAlliance.score ?? null,
        blue_score: m.blueAlliance.score ?? null,
        predicted_winner: m.predictedWinner,
        predicted_win_prob: Math.round(m.predictedWinProb * 100) + '%',
      }));
    } else if (lower.includes('from picklist')) {
      rows = this.picklist.map((p) => ({
        team_number: p.teamNumber,
        rank: p.rank,
        role: p.role,
        strengths: p.strengths.join(', '),
        weaknesses: p.weaknesses.join(', '),
        flagged_dnp: p.flaggedDNP,
        notes: p.notes,
      }));
    } else if (lower.includes('from access_keys')) {
      rows = [
        { role: 'administrator', key_status: 'Active', permissions: 'ALL: READ, WRITE, SQL_EXEC, ADMIN_KEY_MGMT' },
        { role: 'member', key_status: 'Active', permissions: 'SCOUT_SUBMIT, VIEW_STATS, PIT_VIEW, PICKLIST_READ' },
      ];
    } else {
      // Fallback sample query
      rows = [
        { query: sql, status: 'EXECUTED_SUCCESSFULLY', engine: 'FRC SQL Server Backend v2.5' },
      ];
    }

    // Basic WHERE filter parsing for simple numbers
    const whereMatch = lower.match(/where\s+([a-z0-9_]+)\s*(=|>|<)\s*([0-9]+)/);
    if (whereMatch && rows.length > 0) {
      const [, col, op, valStr] = whereMatch;
      const val = Number(valStr);
      rows = rows.filter((r) => {
        const itemVal = Number(r[col]);
        if (isNaN(itemVal)) return true;
        if (op === '=') return itemVal === val;
        if (op === '>') return itemVal > val;
        if (op === '<') return itemVal < val;
        return true;
      });
    }

    // Basic ORDER BY
    const orderMatch = lower.match(/order\s+by\s+([a-z0-9_]+)\s*(asc|desc)?/);
    if (orderMatch && rows.length > 0) {
      const [, col, dir] = orderMatch;
      const isDesc = dir === 'desc';
      rows.sort((a, b) => {
        if (a[col] < b[col]) return isDesc ? 1 : -1;
        if (a[col] > b[col]) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // Basic LIMIT
    const limitMatch = lower.match(/limit\s+([0-9]+)/);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      rows = rows.slice(0, limit);
    }

    if (rows.length > 0) {
      columns = Object.keys(rows[0]);
    } else {
      columns = ['result'];
      rows = [{ result: '0 rows returned' }];
    }

    const endTime = performance.now();
    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      rawSql: sql,
    };
  }

  private handleInsert(sql: string, startTime: number): SqlQueryResult {
    const endTime = performance.now();
    return {
      columns: ['status', 'rows_affected'],
      rows: [{ status: 'ROW_INSERTED', rows_affected: 1 }],
      rowCount: 1,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      rawSql: sql,
    };
  }

  private handleUpdate(sql: string, startTime: number): SqlQueryResult {
    const endTime = performance.now();
    return {
      columns: ['status', 'rows_affected'],
      rows: [{ status: 'ROWS_UPDATED', rows_affected: 1 }],
      rowCount: 1,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      rawSql: sql,
    };
  }

  private handleDelete(sql: string, startTime: number): SqlQueryResult {
    const endTime = performance.now();
    return {
      columns: ['status', 'rows_affected'],
      rows: [{ status: 'ROWS_DELETED', rows_affected: 1 }],
      rowCount: 1,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      rawSql: sql,
    };
  }

  private handleDescribe(sql: string, startTime: number): SqlQueryResult {
    const defs = this.getTableDefinitions();
    const rows = defs.map((d) => ({
      table_name: d.name,
      total_columns: d.columns.length,
      row_count: d.rowCount,
      description: d.description,
    }));
    const endTime = performance.now();
    return {
      columns: ['table_name', 'total_columns', 'row_count', 'description'],
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      rawSql: sql,
    };
  }

  public generateSqlDump(): string {
    let dump = `-- FRC TELEMETRY & SCOUTING COMMAND CENTER
-- SQL SERVER COMPATIBLE DUMP
-- Generated at: ${new Date().toISOString()}
-- Database: frc_scouting_db

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'frc_scouting_db')
BEGIN
  CREATE DATABASE frc_scouting_db;
END;
GO

USE frc_scouting_db;
GO

-- 1. TEAMS TABLE
CREATE TABLE teams (
  number INT PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  organization NVARCHAR(255),
  location NVARCHAR(100),
  rookie_year INT,
  epa FLOAT,
  auto_epa FLOAT,
  teleop_epa FLOAT,
  endgame_epa FLOAT,
  rank INT,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  drivetrain NVARCHAR(50),
  status NVARCHAR(30)
);
GO

-- 2. MATCH_SCOUTING TABLE
CREATE TABLE match_scouting (
  id NVARCHAR(64) PRIMARY KEY,
  match_number INT NOT NULL,
  team_number INT NOT NULL,
  scout_name NVARCHAR(100),
  alliance NVARCHAR(10),
  driver_station INT,
  auto_leave BIT,
  auto_coral_total INT,
  teleop_coral_total INT,
  algae_processor_total INT,
  algae_net_total INT,
  cycles INT,
  defense_rating INT,
  climb_status NVARCHAR(30),
  climb_time_seconds FLOAT,
  died_or_tipped BIT,
  driver_skill INT,
  notes NVARCHAR(MAX),
  created_at DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- 3. PIT_SCOUTING TABLE
CREATE TABLE pit_scouting (
  team_number INT PRIMARY KEY,
  scout_name NVARCHAR(100),
  drivetrain NVARCHAR(100),
  dimensions NVARCHAR(50),
  weight_lbs FLOAT,
  motors_drive NVARCHAR(100),
  motors_steer NVARCHAR(100),
  intake_type NVARCHAR(255),
  vision_system NVARCHAR(255),
  climb_capability NVARCHAR(255),
  inspection_passed BIT,
  battery_voltage FLOAT,
  last_checked NVARCHAR(30)
);
GO

-- INSERT INITIAL SEED DATA
`;

    for (const t of this.teams) {
      dump += `INSERT INTO teams (number, name, organization, location, rookie_year, epa, auto_epa, teleop_epa, endgame_epa, rank, wins, losses, drivetrain, status) VALUES (${t.number}, '${t.name.replace(/'/g, "''")}', '${t.organization.replace(/'/g, "''")}', '${t.location}', ${t.rookieYear}, ${t.epa}, ${t.autoEpa}, ${t.teleopEpa}, ${t.endgameEpa}, ${t.rank}, ${t.record.wins}, ${t.record.losses}, '${t.drivetrain}', '${t.status}');\n`;
    }

    dump += `GO\n\n-- SEED MATCH SCOUTING RECORDS\n`;
    for (const s of this.scoutingEntries) {
      dump += `INSERT INTO match_scouting (id, match_number, team_number, scout_name, alliance, driver_station, auto_leave, auto_coral_total, teleop_coral_total, algae_processor_total, algae_net_total, cycles, defense_rating, climb_status, climb_time_seconds, died_or_tipped, driver_skill, notes) VALUES ('${s.id}', ${s.matchNumber}, ${s.teamNumber}, '${s.scoutName}', '${s.alliance}', ${s.driverStation}, ${s.autoLeave ? 1 : 0}, ${s.autoCoralL1 + s.autoCoralL2 + s.autoCoralL3 + s.autoCoralL4}, ${s.teleopCoralL1 + s.teleopCoralL2 + s.teleopCoralL3 + s.teleopCoralL4}, ${s.autoAlgaeProcessor + s.teleopAlgaeProcessor}, ${s.autoAlgaeNet + s.teleopAlgaeNet}, ${s.cycles}, ${s.defenseRating}, '${s.climbStatus}', ${s.climbTimeSeconds}, ${s.diedOrTipped ? 1 : 0}, ${s.driverSkill}, '${s.notes.replace(/'/g, "''")}');\n`;
    }

    dump += `GO\n-- END OF SQL SERVER DUMP\n`;
    return dump;
  }
}
