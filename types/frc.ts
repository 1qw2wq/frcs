export type UserRole = 'admin' | 'member' | 'none';

export interface KeyConfig {
  adminKey: string;
  memberKey: string;
  lastUpdated: string;
}

export interface SqlServerConfig {
  connectionKey: string; // The user-provided SQL Server key / connection string
  serverType: 'mssql' | 'postgresql' | 'mysql' | 'sqlite' | 'rest';
  host: string;
  database: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'local_fallback';
  lastPing?: string;
  errorMessage?: string;
}

export interface FrcTeam {
  number: number;
  name: string;
  organization: string;
  location: string;
  rookieYear: number;
  epa: number; // Expected Points Added (overall)
  autoEpa: number;
  teleopEpa: number;
  endgameEpa: number;
  rank: number;
  record: { wins: number; losses: number; ties: number };
  imageUrl: string;
  cadUrl?: string;
  drivetrain: 'Swerve SDS Mk4i' | 'Swerve WCP' | 'Tank 6WD' | 'Mecanum' | 'Custom Swerve';
  status: 'Active' | 'Pit Inspection' | 'On Field' | 'Queueing';
}

export interface FrcMatch {
  matchNumber: number;
  compLevel: 'Qualification' | 'Playoff' | 'Final';
  scheduledTime: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  redAlliance: {
    teams: number[];
    score?: number;
    autoScore?: number;
    teleopScore?: number;
    endgameScore?: number;
    coopertition?: boolean;
    rankingPoints?: number;
  };
  blueAlliance: {
    teams: number[];
    score?: number;
    autoScore?: number;
    teleopScore?: number;
    endgameScore?: number;
    coopertition?: boolean;
    rankingPoints?: number;
  };
  predictedWinner: 'Red' | 'Blue';
  predictedWinProb: number; // e.g. 0.68 for 68%
}

export interface MatchScoutingEntry {
  id: string;
  matchNumber: number;
  teamNumber: number;
  scoutName: string;
  alliance: 'Red' | 'Blue';
  driverStation: 1 | 2 | 3;
  // Auto
  autoLeave: boolean;
  autoCoralL1: number;
  autoCoralL2: number;
  autoCoralL3: number;
  autoCoralL4: number;
  autoAlgaeProcessor: number;
  autoAlgaeNet: number;
  autoMissed: number;
  // Teleop
  teleopCoralL1: number;
  teleopCoralL2: number;
  teleopCoralL3: number;
  teleopCoralL4: number;
  teleopAlgaeProcessor: number;
  teleopAlgaeNet: number;
  cycles: number;
  defenseRating: number; // 1 to 5
  // Endgame
  climbStatus: 'None' | 'Park' | 'Shallow Cage' | 'Deep Cage';
  climbTimeSeconds: number;
  // Post match
  diedOrTipped: boolean;
  cards: 'None' | 'Yellow' | 'Red';
  driverSkill: number; // 1 to 5
  notes: string;
  timestamp: string;
}

export interface PitScoutingData {
  teamNumber: number;
  scoutName: string;
  drivetrain: string;
  dimensions: string; // e.g. "28 x 28 x 31 in"
  weightLbs: number;
  motorsDrive: string; // e.g. "4x Kraken X60"
  motorsSteer: string; // e.g. "4x Falcon 500"
  intakeType: string;
  scoringCapabilities: string[];
  visionSystem: string;
  preferredAutonomous: string;
  climbCapability: string;
  photoUrl: string;
  pitNotes: string;
  inspectionPassed: boolean;
  batteryVoltage: number;
  lastChecked: string;
}

export interface PicklistTeam {
  teamNumber: number;
  rank: number;
  role: 'First Pick' | 'Second Pick' | 'Third Pick' | 'Do Not Pick (DNP)';
  notes: string;
  strengths: string[];
  weaknesses: string[];
  favoriteAlliancePartners: number[];
  flaggedDNP: boolean;
  dnpReason?: string;
}

export interface RobotTelemetryState {
  connected: boolean;
  batteryVoltage: number;
  rioCpuPercent: number;
  canUtilization: number;
  loopTimeMs: number;
  wifiLatencyMs: number;
  pneumaticsPsi: number;
  mode: 'Teleop' | 'Autonomous' | 'Disabled' | 'Test';
  matchTimeRemaining: number;
  subsystems: {
    drivetrain: boolean;
    elevator: boolean;
    intake: boolean;
    visionCameras: boolean;
    wristPivot: boolean;
    climber: boolean;
  };
}
