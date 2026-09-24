export interface Certification {
  id: string;
  name: string;
  model: string;
  mentor: string;
  expDate: string;
  status: 'CERT' | 'PENDING' | 'EXPIRED' | 'NOT_STARTED';
  slotInfo?: string;
  category: 'machining' | 'electrical' | 'safety';
}

export interface BuildScheduleItem {
  id: string;
  dayLabel: string;
  dateStr: string;
  timeRange: string;
  hours: number;
  badge: 'ACTIVE' | 'OPEN SHOP' | 'EXAM DAY' | 'ALL-HANDS SPRINT';
  focus: string;
  mentor: string;
  capacity: string;
  notes?: string;
}

export interface SubsystemTask {
  id: string;
  taskId: string;
  priority: 'P0 - HIGH' | 'P1 - SPRINT' | 'P2 - TEST' | 'P3 - SPRINT';
  category: 'AUTOS' | 'VISION' | 'ELECTRICAL' | 'MECHANICAL';
  subteamId?: string;
  branchOrSubsystem: string;
  statusTag: string;
  statusType: 'success' | 'info' | 'purple' | 'warning';
  title: string;
  description: string;
  metadata: string; // e.g. "Reviewer: @Austin_Mentor" or "Partner: Jordan L."
  pullRequestUrl?: string;
  comments?: Array<{ id: string; author: string; text: string; time: string }>;
}

export interface MemberRosterItem {
  id: string;
  name: string;
  studentId: string;
  role: string;
  subteam: 'Software' | 'Mechanical' | 'Electrical' | 'Strategy' | 'Business';
  hoursLogged: number;
  stimsStatus: 'VERIFIED' | 'PENDING' | 'MISSING';
  medRelease: 'ON FILE' | 'PENDING' | 'MISSING';
  safetyPassed: number;
  safetyTotal: number;
  isCheckedIn: boolean;
  pin: string;
  avatarUrl?: string;
}

export interface FloorCheckIn {
  id: string;
  studentName: string;
  studentId: string;
  subteam: string;
  checkInTime: string;
  /** ISO timestamp preferred for sorting */
  checkInAt?: string;
  activeMachine?: string;
  hoursToday: number;
  /** Admin-issued entry code used for this check-in */
  entryCode?: string;
  memberAccountId?: string;
}

/** Admin-generated one-time (or multi-use session) pit/floor entry code */
export interface FloorEntryCode {
  id: string;
  code: string;
  label: string;
  createdAt: string;
  createdBy: string;
  expiresAt: string | null;
  maxUses: number;
  useCount: number;
  active: boolean;
  lastUsedAt: string | null;
  lastUsedBy: string | null;
}

export interface EngineeringNote {
  id: string;
  title: string;
  subteamId: string;
  author: string;
  date: string;
  category: 'Mechanical CAD' | 'Software & Control' | 'Electrical & CAN' | 'Strategy & Field' | 'Testing Protocol';
  content: string;
  tags: string[];
  cadLink?: string;
  verified: boolean;
}

export interface OutreachDemo {
  id: string;
  title: string;
  targetAudience: string;
  date: string;
  location: string;
  status: 'UPCOMING' | 'COMPLETED' | 'IN_PREP';
  robotUsed: string;
  leadStudent: string;
  leadMentor: string;
  description: string;
  checklist: Array<{ id: string; item: string; completed: boolean }>;
}

export interface MachineReservation {
  id: string;
  machine: string;
  studentName: string;
  studentId: string;
  timeSlot: string;
  material: string;
  mentor: string;
  notes: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
}

export interface HourAppealRecord {
  id: string;
  studentName: string;
  studentId: string;
  hoursRequested: number;
  category: string;
  date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerNotes?: string;
}
