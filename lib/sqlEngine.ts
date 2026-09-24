/**
 * Client-safe SQL types + thin helpers.
 * Actual execution lives server-side in lib/db.ts via /api/sql.
 */

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  rawSql: string;
  error?: string;
  dataset?: unknown;
}

export interface SqlTableDefinition {
  name: string;
  rowCount: number;
  columns: { name: string; type: string; isPrimary?: boolean; nullable?: boolean }[];
  description: string;
}

/** Default schema blueprint shown before the first schema fetch. */
export const DEFAULT_TABLE_DEFINITIONS: SqlTableDefinition[] = [
  {
    name: 'teams',
    rowCount: 0,
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
    rowCount: 0,
    description: 'Qualification and Playoff matches with alliance breakdowns',
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
    rowCount: 0,
    description: 'Real-time scout observations per team per match',
    columns: [
      { name: 'id', type: 'TEXT', isPrimary: true },
      { name: 'match_number', type: 'INTEGER' },
      { name: 'team_number', type: 'INTEGER' },
      { name: 'scout_name', type: 'TEXT' },
      { name: 'alliance', type: 'TEXT' },
      { name: 'cycles', type: 'INTEGER' },
      { name: 'climb_status', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      { name: 'timestamp', type: 'TEXT' },
    ],
  },
  {
    name: 'pit_scouting',
    rowCount: 0,
    description: 'Physical inspection measurements and battery voltage',
    columns: [
      { name: 'team_number', type: 'INTEGER', isPrimary: true },
      { name: 'scout_name', type: 'TEXT' },
      { name: 'drivetrain', type: 'TEXT' },
      { name: 'dimensions', type: 'TEXT' },
      { name: 'weight_lbs', type: 'REAL' },
      { name: 'motors_drive', type: 'TEXT' },
      { name: 'inspection_passed', type: 'INTEGER' },
      { name: 'battery_voltage', type: 'REAL' },
    ],
  },
  {
    name: 'picklist',
    rowCount: 0,
    description: 'Alliance selection draft list with DNP flags',
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
    rowCount: 2,
    description: 'Authentication access keys for Administrator and Member roles',
    columns: [
      { name: 'role', type: 'TEXT', isPrimary: true },
      { name: 'key_value', type: 'TEXT' },
      { name: 'permissions', type: 'TEXT' },
      { name: 'status', type: 'TEXT' },
    ],
  },
];
