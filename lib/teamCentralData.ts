import { Certification, BuildScheduleItem, SubsystemTask, MemberRosterItem, FloorCheckIn } from '@/types/teamCentral';

export const INITIAL_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-1',
    name: 'CNC Knee Mill',
    model: 'Tormach 1100MX',
    mentor: 'Bob K.',
    expDate: 'Dec 2025',
    status: 'CERT',
    category: 'machining',
  },
  {
    id: 'cert-2',
    name: 'Precision Metal Lathe',
    model: 'Clausing 13" Geared',
    mentor: 'Bob K.',
    expDate: 'Nov 2025',
    status: 'CERT',
    category: 'machining',
  },
  {
    id: 'cert-3',
    name: 'Battery Station & BMS',
    model: 'Anderson SB50 / SLA',
    mentor: 'Elena V.',
    expDate: 'Jan 2026',
    status: 'CERT',
    category: 'electrical',
  },
  {
    id: 'cert-4',
    name: 'Electronics & Soldering',
    model: 'Weller SMD / CAN crimp',
    mentor: 'Dave R.',
    expDate: 'Oct 2025',
    status: 'CERT',
    category: 'electrical',
  },
  {
    id: 'cert-5',
    name: 'Shop Power Tools',
    model: 'Band Saw, Drill Press',
    mentor: 'Bob K.',
    expDate: 'Jan 2026',
    status: 'CERT',
    category: 'machining',
  },
  {
    id: 'cert-6',
    name: 'Pit Safety & CPR',
    model: 'Red Cross / FIRST Pit',
    mentor: 'Karen S.',
    expDate: 'Sep 2025',
    status: 'CERT',
    category: 'safety',
  },
  {
    id: 'cert-7',
    name: 'LiFePO4 & HazMat',
    model: 'Class D Extinguishers',
    mentor: 'Karen S.',
    expDate: 'Jan 2026',
    status: 'CERT',
    category: 'safety',
  },
  {
    id: 'cert-8',
    name: 'OMAX Waterjet CNC',
    model: 'Abrasive Jet Machining',
    mentor: 'Bob K.',
    expDate: 'Exp: N/A',
    status: 'PENDING',
    slotInfo: 'Slot: Thursday 5:15 PM · Proctor: Bob K.',
    category: 'machining',
  },
];

export const INITIAL_BUILD_SCHEDULE: BuildScheduleItem[] = [
  {
    id: 'sch-1',
    dayLabel: 'TODAY • TUESDAY FEB 11',
    dateStr: 'Feb 11',
    timeRange: '4:00 PM – 9:00 PM (5.0 hrs)',
    hours: 5.0,
    badge: 'ACTIVE',
    focus: 'Intake Integration & Vision Auto Tune',
    mentor: 'Bob K. / Elena V.',
    capacity: '18/25 Students',
  },
  {
    id: 'sch-2',
    dayLabel: 'WEDNESDAY FEB 12',
    dateStr: 'Feb 12',
    timeRange: '4:30 PM – 8:30 PM (4.0 hrs)',
    hours: 4.0,
    badge: 'OPEN SHOP',
    focus: 'CAD Freeze for Rev 2 Feeder Plates',
    mentor: 'Dave R.',
    capacity: '12/25 Students',
  },
  {
    id: 'sch-3',
    dayLabel: 'THURSDAY FEB 13',
    dateStr: 'Feb 13',
    timeRange: '4:00 PM – 9:00 PM (5.0 hrs)',
    hours: 5.0,
    badge: 'EXAM DAY',
    focus: 'Waterjet Exam + Drive Chassis Burn-in',
    mentor: 'Bob K.',
    capacity: '24/25 (Near Full)',
  },
  {
    id: 'sch-4',
    dayLabel: 'SATURDAY FEB 15',
    dateStr: 'Feb 15',
    timeRange: '9:00 AM – 6:00 PM (9.0 hrs)',
    hours: 9.0,
    badge: 'ALL-HANDS SPRINT',
    focus: 'Full Field Driver Practice & Pit Crew Mock Scrimmage',
    mentor: 'All On Duty',
    capacity: 'Catering: Provided',
    notes: 'Wear team shirts for media shoot',
  },
];

export const INITIAL_TASKS: SubsystemTask[] = [
  {
    id: 'task-1',
    taskId: '#SW-214',
    priority: 'P0 - HIGH',
    category: 'AUTOS',
    branchOrSubsystem: 'BRANCH: feature/pose-estimation-kalman',
    statusTag: 'PR #88 • READY FOR FIELD',
    statusType: 'success',
    title: 'Autonomous 4-Piece Pose Estimation & Odometry Kalman Filter',
    description: 'Merge dual Limelight 3G AprilTag transforms into WPILib pose estimator with covariance scaling.',
    metadata: 'Reviewer: @Austin_Mentor',
  },
  {
    id: 'task-2',
    taskId: '#EL-089',
    priority: 'P1 - SPRINT',
    category: 'ELECTRICAL',
    branchOrSubsystem: 'SUBSYSTEM: INTAKE & FEEDER',
    statusTag: 'IN PROGRESS (75%)',
    statusType: 'info',
    title: 'CANivore Bus Termination & Kraken X60 Firmware Flash',
    description: 'Validate 120-ohm bus end resistor. Flash Phoenix v6 firmware on feeder rollers.',
    metadata: 'Partner: Jordan L.',
  },
  {
    id: 'task-3',
    taskId: '#SW-219',
    priority: 'P2 - TEST',
    category: 'VISION',
    branchOrSubsystem: 'CAMERA PIPELINE 2',
    statusTag: 'BENCH TESTING',
    statusType: 'purple',
    title: 'Driver Feed Latency Benchmark & Coral TPU Neural Net',
    description: 'Ensure latency under 22ms over radio stream at 480p30fps. Verify detector bounding box confidence.',
    metadata: 'Pit Test Cart #1',
  },
  {
    id: 'task-4',
    taskId: '#SW-222',
    priority: 'P3 - SPRINT',
    category: 'MECHANICAL',
    branchOrSubsystem: 'SYSID PROFILING',
    statusTag: 'BLOCKED BY MECH',
    statusType: 'warning',
    title: 'Elevator SysId Gain Profiling (kS, kV, kA, kP)',
    description: 'Run quasistatic and dynamic logging routines to optimize cascade feedforward loops.',
    metadata: 'ETA: Friday',
  },
];

export const INITIAL_ROSTER: MemberRosterItem[] = [
  {
    id: 'm-1',
    name: 'Maya Patel',
    studentId: '#5419-STU-0042',
    role: 'Co-Captain & Software Lead',
    subteam: 'Software',
    hoursLogged: 64.5,
    stimsStatus: 'VERIFIED',
    medRelease: 'ON FILE',
    safetyPassed: 7,
    safetyTotal: 8,
    isCheckedIn: true,
    pin: '7419',
    avatarUrl: '/assets/maya_patel.jpg',
  },
  {
    id: 'm-2',
    name: 'Jordan Lin',
    studentId: '#5419-STU-0018',
    role: 'Electrical Co-Lead',
    subteam: 'Electrical',
    hoursLogged: 58.0,
    stimsStatus: 'VERIFIED',
    medRelease: 'ON FILE',
    safetyPassed: 8,
    safetyTotal: 8,
    isCheckedIn: true,
    pin: '3321',
  },
  {
    id: 'm-3',
    name: 'Liam Zhang',
    studentId: '#5419-STU-0007',
    role: 'Mechanical Lead',
    subteam: 'Mechanical',
    hoursLogged: 71.5,
    stimsStatus: 'VERIFIED',
    medRelease: 'ON FILE',
    safetyPassed: 8,
    safetyTotal: 8,
    isCheckedIn: true,
    pin: '5401',
  },
  {
    id: 'm-4',
    name: 'Sophia Miller',
    studentId: '#5419-STU-0033',
    role: 'Strategy & Scouting Lead',
    subteam: 'Strategy',
    hoursLogged: 52.0,
    stimsStatus: 'VERIFIED',
    medRelease: 'ON FILE',
    safetyPassed: 6,
    safetyTotal: 8,
    isCheckedIn: true,
    pin: '9082',
  },
  {
    id: 'm-5',
    name: 'Ethan Ross',
    studentId: '#5419-STU-0055',
    role: 'Drive Coach & Machining',
    subteam: 'Mechanical',
    hoursLogged: 60.5,
    stimsStatus: 'VERIFIED',
    medRelease: 'ON FILE',
    safetyPassed: 8,
    safetyTotal: 8,
    isCheckedIn: true,
    pin: '1244',
  },
  {
    id: 'm-6',
    name: 'Chloe Kim',
    studentId: '#5419-STU-0029',
    role: 'Business & Media Lead',
    subteam: 'Business',
    hoursLogged: 48.0,
    stimsStatus: 'VERIFIED',
    medRelease: 'ON FILE',
    safetyPassed: 5,
    safetyTotal: 8,
    isCheckedIn: false,
    pin: '7721',
  },
];

export const INITIAL_FLOOR_LOG: FloorCheckIn[] = [
  {
    id: 'fl-1',
    studentName: 'Maya Patel',
    studentId: '#5419-STU-0042',
    subteam: 'Software & Vision',
    checkInTime: '4:02 PM',
    activeMachine: 'Workstation 01 (WPILib Dev)',
    hoursToday: 3.2,
  },
  {
    id: 'fl-2',
    studentName: 'Jordan Lin',
    studentId: '#5419-STU-0018',
    subteam: 'Electrical & Pneumatics',
    checkInTime: '4:05 PM',
    activeMachine: 'Electronics Bench (Weller Soldering)',
    hoursToday: 3.1,
  },
  {
    id: 'fl-3',
    studentName: 'Liam Zhang',
    studentId: '#5419-STU-0007',
    subteam: 'Mechanical & CAD',
    checkInTime: '3:58 PM',
    activeMachine: 'Tormach 1100MX Knee Mill',
    hoursToday: 3.3,
  },
  {
    id: 'fl-4',
    studentName: 'Ethan Ross',
    studentId: '#5419-STU-0055',
    subteam: 'Mechanical',
    checkInTime: '4:10 PM',
    activeMachine: 'Chassis Assembly Bay',
    hoursToday: 3.0,
  },
  {
    id: 'fl-5',
    studentName: 'Sophia Miller',
    studentId: '#5419-STU-0033',
    subteam: 'Strategy & Drive',
    checkInTime: '4:15 PM',
    activeMachine: 'Scouting Analytics Terminal',
    hoursToday: 2.9,
  },
  {
    id: 'fl-6',
    studentName: 'Marcus Vance',
    studentId: '#5419-STU-0081',
    subteam: 'Mechanical',
    checkInTime: '4:12 PM',
    activeMachine: 'Clausing Lathe',
    hoursToday: 3.0,
  },
  {
    id: 'fl-7',
    studentName: 'Devon Lee',
    studentId: '#5419-STU-0062',
    subteam: 'Software',
    checkInTime: '4:20 PM',
    activeMachine: 'Vision Tuning Rig',
    hoursToday: 2.8,
  },
  {
    id: 'fl-8',
    studentName: 'Aria Taylor',
    studentId: '#5419-STU-0094',
    subteam: 'Electrical',
    checkInTime: '4:22 PM',
    activeMachine: 'Battery Charging Cart',
    hoursToday: 2.8,
  },
  {
    id: 'fl-9',
    studentName: 'Caleb Walker',
    studentId: '#5419-STU-0073',
    subteam: 'Mechanical',
    checkInTime: '4:25 PM',
    activeMachine: 'Drill Press Station',
    hoursToday: 2.7,
  },
  {
    id: 'fl-10',
    studentName: 'Siddharth Rao',
    studentId: '#5419-STU-0038',
    subteam: 'Software',
    checkInTime: '4:30 PM',
    activeMachine: 'RoboRIO 2.0 Bench',
    hoursToday: 2.6,
  },
];

export const INITIAL_ENGINEERING_NOTES: import('@/types/teamCentral').EngineeringNote[] = [
  {
    id: 'note-1',
    title: 'Limelight 3G Megatag2 Kalman Covariance Tuning & High-Speed Orbit Benchmark',
    subteamId: 'subteam-soft',
    author: 'Maya Patel (Lead)',
    date: 'Feb 10, 2025',
    category: 'Software & Control',
    verified: true,
    cadLink: 'https://github.com/frc5419/Vortex-2025-Robot',
    tags: ['WPILib', 'Vision', 'Kalman', 'Swerve'],
    content: `### Executive Summary
Benchmarked dual Limelight 3G cameras running Megatag2 pose estimation with AprilTag fiducial tracking. 

#### Key Metrics & Results:
- **Stationary RMS Error:** 0.38 inches (X/Y), 0.45 deg (Yaw)
- **High-speed orbit (14.2 ft/s translational + 720 deg/s rotational):** 1.8 inches RMS drift
- **Measurement Rejection:** Implemented dynamic covariance scaling based on distance (>4.5m tagged as 3x uncertainty) and gyro angular velocity (>300 deg/s rejected from yaw update).
- **Latency Pipeline:** Image capture to NetworkTables timestamped latency measured at 18.2ms avg.

#### Next Steps:
Merge PR #88 into \`main\` branch for field test at Monterey Bay scrimmage.`,
  },
  {
    id: 'note-2',
    title: 'Feeder Plate Rev 2 Pocketing & Tormach Feeds/Speeds Optimization',
    subteamId: 'subteam-mech',
    author: 'Liam Zhang (Mech Lead)',
    date: 'Feb 09, 2025',
    category: 'Mechanical CAD',
    verified: true,
    cadLink: 'https://cad.onshape.com/documents/vortex5419-reefscape-feeder-rev2',
    tags: ['CNC Mill', 'Onshape', 'Feeds&Speeds', '6061-T6'],
    content: `### Objective
Reduce feeder intake assembly weight by 280 grams while maintaining stiffness under impact loads from field reef poles.

#### CAM Setup & Machining Parameters:
- **Material:** 0.250" 6061-T6 Aluminum Plate
- **Tooling:** 1/4" 3-flute carbide endmill (WNT uncoated for aluminum)
- **Spindle Speed:** 5,100 RPM
- **Feed Rate:** 45 IPM (adaptive clearing), 25 IPM (contour finishing)
- **Stepdown / Stepover:** 0.125" axial, 40% radial
- **Coolant:** Mist / flood mix (Trim SC520)

#### Inspection Notes:
Bearing pockets were measured with Mitutoyo bore micrometer: 1.1252" (+0.0004" / -0.0000"). Flanged FR8ZZ bearings press-fit smoothly with light arbor press engagement.`,
  },
  {
    id: 'note-3',
    title: 'CANivore CAN FD Bus Noise Margin & Kraken X60 Termination Diagnostic',
    subteamId: 'subteam-elec',
    author: 'Jordan Lin (Electrical Lead)',
    date: 'Feb 08, 2025',
    category: 'Electrical & CAN',
    verified: true,
    tags: ['CAN FD', 'Kraken X60', 'O-Scope', 'Wiring'],
    content: `### Electrical Diagnostic Report
Hooked up Siglent SDS1104X-E digital storage oscilloscope to test differential CAN High/Low signal integrity on the 10-motor Kraken X60 drive loop.

#### Observations:
- **Resistance:** Measured 60.2 ohms across the bus with power off (verified 120-ohm resistor at CANivore and 120-ohm termination resistor at CANcoder #4).
- **Signal Integrity:** Differential peak-to-peak voltage is 2.15V. Zero frame reflection or ringing observed at 5 Mbps CAN FD baud rate.
- **Bus Utilization:** Peaks at 42% under full teleop load (10 Krakens + 4 CANcoders + Pigeon 2.0 IMU).`,
  },
  {
    id: 'note-4',
    title: 'Match Scouting Coral Scoring Efficiency Model & Picklist Simulation',
    subteamId: 'subteam-strat',
    author: 'Sophia Miller (Strategy Lead)',
    date: 'Feb 07, 2025',
    category: 'Strategy & Field',
    verified: true,
    tags: ['EPA', 'Scouting', 'Match Strategy', 'Reefscape'],
    content: `### Analysis of Week 1-3 Regional Events
Synthesized match video and Statbotics EPA trends across 4 early week regionals to determine autonomous scoring value vs teleop cycling.

#### Strategic Insights:
1. **Auto RP Value:** Autonomous Coral L4 consistency (>80%) dictates top seed alliance captains in 92% of playoff brackets.
2. **Barge Endgame:** Teams requiring >15 seconds to achieve Deep Cage climb surrender an average of 1.4 teleop Coral cycles.
3. **Scouting Picklist Rules:** Rank 1 pick priority goes to high-throughput Coral L4 cyclers; Rank 2 pick priority goes to fast Algae ground-clearing robots.`,
  },
  {
    id: 'note-5',
    title: 'FIRST Impact Award Executive Summary & Silicon Valley Outreach Deck',
    subteamId: 'subteam-biz',
    author: 'Chloe Kim (Business Lead)',
    date: 'Feb 06, 2025',
    category: 'Testing Protocol',
    verified: true,
    tags: ['Outreach', 'Impact Award', 'Sponsorship', 'FIRST'],
    content: `### Submission Status
Finalized the 10,000-character FIRST Impact Award essay and the 13 executive summary questions for the 2025 competition season.

#### Milestones Documented:
- 1,240 elementary and middle school students reached via Title 1 STEM workshops
- $42,000 corporate sponsorship funds raised (Intuitive Surgical, Qualcomm, Gene Haas Foundation)
- 4 FLL teams directly mentored by VORTEX students
- 100% of graduating seniors matriculating into STEM university programs`,
  },
];

export const INITIAL_OUTREACH_DEMOS: import('@/types/teamCentral').OutreachDemo[] = [
  {
    id: 'demo-1',
    title: 'Monta Vista Middle School STEM Night Interactive Robot Demo',
    targetAudience: 'Middle School Students (Grades 6-8) & Parents',
    date: 'Feb 20, 2025 • 5:30 PM – 8:00 PM',
    location: 'Monta Vista Gym, Cupertino CA',
    status: 'UPCOMING',
    robotUsed: '2024 Crescendo Competition Robot ("AURA")',
    leadStudent: 'Chloe Kim & Maya Patel',
    leadMentor: 'Karen S.',
    description: 'Interactive driving booth with student joystick control, note shooter target range, and introductory FRC recruitment flyers.',
    checklist: [
      { id: 'c-1', item: 'Pack 4 fresh SLA batteries & Anderson charger', completed: true },
      { id: 'c-2', item: 'Safety crowd stanchions and orange caution tape', completed: true },
      { id: 'c-3', item: 'Dual Xbox controllers for guest driving mode (software velocity throttled to 25%)', completed: true },
      { id: 'c-4', item: 'Print 150 team flyer brochures and stickers', completed: false },
      { id: 'c-5', item: 'Van transport loading confirmed with mentor Bob', completed: true },
    ],
  },
  {
    id: 'demo-2',
    title: 'Qualcomm Foundation Innovation Grant Live Robot Demonstration',
    targetAudience: 'Corporate Engineering Executives & STEM Grant Committee',
    date: 'Feb 28, 2025 • 2:00 PM – 4:00 PM',
    location: 'Qualcomm Regional HQ, Santa Clara CA',
    status: 'IN_PREP',
    robotUsed: '2025 Reefscape Competition Robot ("VORTEX IX")',
    leadStudent: 'Liam Zhang & Maya Patel',
    leadMentor: 'Dave R.',
    description: 'Technical presentation of swerve drivetrain kinematics, Limelight Megatag2 vision targeting, and live coral scoring demonstration on practice reef.',
    checklist: [
      { id: 'c-6', item: 'Prepare 10-slide sponsorship presentation deck', completed: true },
      { id: 'c-7', item: 'Field test Coral L4 auto scoring routine 5 times', completed: false },
      { id: 'c-8', item: 'Clean anodized chassis & install new bumper covers with sponsor logos', completed: false },
      { id: 'c-9', item: 'Review Q&A technical talking points with leads', completed: false },
    ],
  },
  {
    id: 'demo-3',
    title: 'Cupertino City Library Maker Faire Community Expo',
    targetAudience: 'General Public, K-12 Families & Educators',
    date: 'Jan 18, 2025 • 10:00 AM – 3:00 PM',
    location: 'Cupertino Community Center Plaza',
    status: 'COMPLETED',
    robotUsed: '2024 Crescendo Competition Robot ("AURA")',
    leadStudent: 'Jordan Lin & Chloe Kim',
    leadMentor: 'Elena V.',
    description: 'Full-day public demonstration featuring robot driving, interactive CAD modeling station, and 3D printing giveaways.',
    checklist: [
      { id: 'c-10', item: 'Outdoor safety perimeter setup', completed: true },
      { id: 'c-11', item: 'Interactive CAD station with Onshape tutorials', completed: true },
      { id: 'c-12', item: '400+ 3D printed robot keychains handed out', completed: true },
      { id: 'c-13', item: 'Photo and video release forms collected', completed: true },
    ],
  },
];

export const INITIAL_MACHINE_RESERVATIONS: import('@/types/teamCentral').MachineReservation[] = [
  {
    id: 'res-1',
    machine: 'Tormach 1100MX Knee Mill',
    studentName: 'Liam Zhang',
    studentId: '#5419-STU-0007',
    timeSlot: '5:00 PM – 6:30 PM (Today)',
    material: '6061-T6 Aluminum (1/4" Plate)',
    mentor: 'Bob K.',
    notes: 'Feeder plate revision 2 contouring & bearing bore pocketing',
    status: 'ACTIVE',
  },
  {
    id: 'res-2',
    machine: 'Clausing 13" Metal Lathe',
    studentName: 'Marcus Vance',
    studentId: '#5419-STU-0081',
    timeSlot: '6:30 PM – 7:30 PM (Today)',
    material: '7075 Aluminum Round Stock (1.25" dia)',
    mentor: 'Bob K.',
    notes: 'Turning dead axle standoff spacers for elevator cascade pulleys',
    status: 'SCHEDULED',
  },
  {
    id: 'res-3',
    machine: 'OMAX Abrasive Waterjet CNC',
    studentName: 'Ethan Ross',
    studentId: '#5419-STU-0055',
    timeSlot: '7:30 PM – 9:00 PM (Today)',
    material: '4mm Carbon Fiber Sheet & 0.125" Aluminum',
    mentor: 'Dave R.',
    notes: 'Cutting bumper brackets and intake gusset plates',
    status: 'SCHEDULED',
  },
];

export const INITIAL_HOUR_APPEALS: import('@/types/teamCentral').HourAppealRecord[] = [
  {
    id: 'app-1',
    studentName: 'Jordan Lin',
    studentId: '#5419-STU-0018',
    hoursRequested: 3.5,
    category: 'Off-site Electrical CAD / Schematic Review',
    date: 'Feb 09, 2025',
    reason: 'Spent 3.5 hours on Saturday evening finalizing KiCAD schematic for CANivore breakout and Phoenix 6 firmware mapping.',
    status: 'APPROVED',
    reviewerNotes: 'Verified with mentor Elena V. Schematics committed to GitHub.',
  },
  {
    id: 'app-2',
    studentName: 'Chloe Kim',
    studentId: '#5419-STU-0029',
    hoursRequested: 4.0,
    category: 'Media Production & Award Documentation',
    date: 'Feb 08, 2025',
    reason: 'Finalized video cut and audio mixing for 3-minute FIRST Impact Award presentation video.',
    status: 'APPROVED',
    reviewerNotes: 'Approved by lead mentor Karen S. Video looks fantastic.',
  },
  {
    id: 'app-3',
    studentName: 'Marcus Vance',
    studentId: '#5419-STU-0081',
    hoursRequested: 2.5,
    category: 'Shop Floor Overtime Machining',
    date: 'Feb 10, 2025',
    reason: 'Stayed late after 9:00 PM shutdown to finish squaring lathe stock for Tuesday assembly.',
    status: 'PENDING',
  },
];

