// EcoBin Central Data Store & State Management
// Mirrors Firebase Firestore collections with persistent localStorage storage

const STORAGE_KEY = 'ecobin_data_v1';

export const BIN_STATUS = {
  NORMAL: 'normal',
  NEEDS_CLEANING: 'needs_cleaning',
  CRITICAL: 'critical',
  OVERTURNED: 'overturned',
  OFFLINE: 'offline',
};

// Standard bin height in cm (e.g. standard 240L campus wheelie bin)
export const BIN_TOTAL_HEIGHT_CM = 80;

export const INITIAL_STAFF = [
  {
    id: 'staff-01',
    name: 'Rajesh Kumar',
    role: 'Cleaning Staff',
    assignedZone: 'North Campus',
    email: 'rajesh.k@campus.edu',
    phone: '+1 (555) 019-2831',
    avatar: 'RK',
    shift: 'Morning (07:00 - 15:00)',
    active: true,
  },
  {
    id: 'staff-02',
    name: 'Maria Santos',
    role: 'Cleaning Staff',
    assignedZone: 'Central Quad',
    email: 'maria.s@campus.edu',
    phone: '+1 (555) 014-9923',
    avatar: 'MS',
    shift: 'Morning (07:00 - 15:00)',
    active: true,
  },
  {
    id: 'staff-03',
    name: 'David Chen',
    role: 'Cleaning Staff',
    assignedZone: 'South Campus',
    email: 'david.c@campus.edu',
    phone: '+1 (555) 018-4421',
    avatar: 'DC',
    shift: 'Evening (14:00 - 22:00)',
    active: true,
  },
];

export const INITIAL_BINS = [
  {
    id: 'BIN-SCI-01',
    name: 'Science Block North Entrance',
    zone: 'North Campus',
    location: 'Exterior foyer near Biology Lab 102',
    fillLevel: 89,
    distanceCm: 8.8,
    tiltAngle: 2,
    isOverturned: false,
    isOffline: false,
    batteryPercent: 92,
    rssi: -64,
    espNodeId: 'ESP32-NODE-01',
    thingspeakField: 1,
    assignedStaffId: 'staff-01',
    active: true,
    lastPing: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BIN-SCI-02',
    name: 'Chemistry Annex Courtyard',
    zone: 'North Campus',
    location: 'Adjacent to Chemical Storage Bld C',
    fillLevel: 68,
    distanceCm: 25.6,
    tiltAngle: 3,
    isOverturned: false,
    isOffline: false,
    batteryPercent: 84,
    rssi: -71,
    espNodeId: 'ESP32-NODE-02',
    thingspeakField: 2,
    assignedStaffId: 'staff-01',
    active: true,
    lastPing: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BIN-LIB-01',
    name: 'Central Library Lawn East',
    zone: 'Central Quad',
    location: 'Main walking pathway to Library entrance',
    fillLevel: 94,
    distanceCm: 4.8,
    tiltAngle: 4,
    isOverturned: false,
    isOffline: false,
    batteryPercent: 78,
    rssi: -58,
    espNodeId: 'ESP32-NODE-03',
    thingspeakField: 3,
    assignedStaffId: 'staff-02',
    active: true,
    lastPing: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BIN-LIB-02',
    name: 'Student Amphitheatre Pergola',
    zone: 'Central Quad',
    location: 'Near tiered seating steps',
    fillLevel: 75,
    distanceCm: 20.0,
    tiltAngle: 82,
    isOverturned: true,
    isOffline: false,
    batteryPercent: 65,
    rssi: -68,
    espNodeId: 'ESP32-NODE-04',
    thingspeakField: 4,
    assignedStaffId: 'staff-02',
    active: true,
    lastPing: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BIN-CAF-01',
    name: 'South Cafeteria Outdoor Terrace',
    zone: 'South Campus',
    location: 'Patio area outside food court exit 2',
    fillLevel: 91,
    distanceCm: 7.2,
    tiltAngle: 1,
    isOverturned: false,
    isOffline: false,
    batteryPercent: 88,
    rssi: -62,
    espNodeId: 'ESP32-NODE-05',
    thingspeakField: 5,
    assignedStaffId: 'staff-03',
    active: true,
    lastPing: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BIN-CAF-02',
    name: 'Dining Hall Tray Drop Zone',
    zone: 'South Campus',
    location: 'Service corridor next to wash stations',
    fillLevel: 45,
    distanceCm: 44.0,
    tiltAngle: 2,
    isOverturned: false,
    isOffline: false,
    batteryPercent: 95,
    rssi: -54,
    espNodeId: 'ESP32-NODE-06',
    thingspeakField: 6,
    assignedStaffId: 'staff-03',
    active: true,
    lastPing: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BIN-ENG-01',
    name: 'Engineering Workshop Bay',
    zone: 'North Campus',
    location: 'Heavy machinery loading dock',
    fillLevel: 32,
    distanceCm: 54.4,
    tiltAngle: 0,
    isOverturned: false,
    isOffline: true,
    batteryPercent: 12,
    rssi: -89,
    espNodeId: 'ESP32-NODE-07',
    thingspeakField: 7,
    assignedStaffId: 'staff-01',
    active: true,
    lastPing: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BIN-SPT-01',
    name: 'Campus Sports Arena Track',
    zone: 'South Campus',
    location: 'Bleachers gate C, athletic pavilion',
    fillLevel: 22,
    distanceCm: 62.4,
    tiltAngle: 2,
    isOverturned: false,
    isOffline: false,
    batteryPercent: 90,
    rssi: -66,
    espNodeId: 'ESP32-NODE-08',
    thingspeakField: 8,
    assignedStaffId: 'staff-03',
    active: true,
    lastPing: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_CLEANING_LOGS = [
  {
    id: 'log-101',
    binId: 'BIN-SCI-01',
    binName: 'Science Block North Entrance',
    staffId: 'staff-01',
    staffName: 'Rajesh Kumar',
    cleanedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    beforeFill: 92,
    afterFill: 4,
    notes: 'Replaced 240L heavy-duty liner, wiped down lid sensor.',
  },
  {
    id: 'log-102',
    binId: 'BIN-CAF-01',
    binName: 'South Cafeteria Outdoor Terrace',
    staffId: 'staff-03',
    staffName: 'David Chen',
    cleanedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    beforeFill: 88,
    afterFill: 5,
    notes: 'High organic food waste cleared after lunch surge.',
  },
  {
    id: 'log-103',
    binId: 'BIN-LIB-01',
    binName: 'Central Library Lawn East',
    staffId: 'staff-02',
    staffName: 'Maria Santos',
    cleanedAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
    beforeFill: 86,
    afterFill: 2,
    notes: 'Recyclable cups and study papers emptied.',
  },
];

export const INITIAL_REPORTS = [
  {
    id: 'rep-201',
    binId: 'BIN-LIB-02',
    binName: 'Student Amphitheatre Pergola',
    reportedBy: 'staff-02',
    staffName: 'Maria Santos',
    issueType: 'Physical Damage / Overturned',
    priority: 'Critical',
    description: 'Bin appears to have been tipped over by wind or student event crowd. Needs righting and wheel realignment.',
    status: 'Open',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rep-202',
    binId: 'BIN-ENG-01',
    binName: 'Engineering Workshop Bay',
    reportedBy: 'staff-01',
    staffName: 'Rajesh Kumar',
    issueType: 'Sensor Offline / Low Battery',
    priority: 'Medium',
    description: 'ESP32 node stopped transmitting ping. Suspected depleted 18650 Li-ion cell or damaged solar lead.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rep-203',
    binId: 'BIN-SCI-01',
    binName: 'Science Block North Entrance',
    reportedBy: 'staff-01',
    staffName: 'Rajesh Kumar',
    issueType: 'Lid Latch Loose',
    priority: 'Low',
    description: 'Spring mechanism on the swing door is slipping. Cleaned sensor reflector.',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    resolutionNotes: 'Facilities maintenance re-tightened the hinge bracket.',
  },
];

export const INITIAL_SUGGESTIONS = [
  {
    id: 'sug-301',
    suggestedBy: 'staff-02',
    staffName: 'Maria Santos',
    locationName: 'Robotics Lab Exterior Plaza',
    zone: 'North Campus',
    reason: 'Heavy foot traffic between Maker Space and Café leads to disposable cardboard cups piling up on benches.',
    expectedTraffic: 'High (300+ students daily)',
    status: 'Approved',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'sug-302',
    suggestedBy: 'staff-03',
    staffName: 'David Chen',
    locationName: 'Cricket Pitch Bleachers',
    zone: 'South Campus',
    reason: 'Weekend inter-college tournaments generate large amounts of beverage bottles; current nearest bin is 120m away.',
    expectedTraffic: 'High on weekends',
    status: 'Under Review',
    createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_IOT_CONFIG = {
  channelId: '2548912', // Sample public ThingSpeak channel
  readApiKey: '', // Optional read key
  writeApiKey: '', // Kept empty / not exposed
  fieldFill: 1,
  fieldDistance: 2,
  fieldTilt: 3,
  fieldBattery: 4,
  useSimulated: true, // Default to demo simulation so app works immediately
  autoRefresh: true,
  refreshIntervalSec: 15,
  lastSyncTime: new Date().toISOString(),
};

export function getBinStatus(bin) {
  if (bin.isOffline) return BIN_STATUS.OFFLINE;
  if (bin.isOverturned || (bin.tiltAngle && bin.tiltAngle > 45)) return BIN_STATUS.OVERTURNED;
  if (bin.fillLevel >= 85) return BIN_STATUS.CRITICAL;
  if (bin.fillLevel >= 60) return BIN_STATUS.NEEDS_CLEANING;
  return BIN_STATUS.NORMAL;
}

export function getStatusBadgeInfo(status) {
  switch (status) {
    case BIN_STATUS.CRITICAL:
      return {
        label: 'Critical (>85%)',
        bg: 'bg-terracotta text-white',
        border: 'border-terracotta',
        dot: 'bg-white',
        pillBg: 'bg-terracotta-bg text-terracotta-dark border-terracotta',
      };
    case BIN_STATUS.NEEDS_CLEANING:
      return {
        label: 'Needs Cleaning',
        bg: 'bg-terracotta-light text-navy-dark',
        border: 'border-terracotta-light',
        dot: 'bg-terracotta-dark',
        pillBg: 'bg-sand-light text-terracotta-dark border-sand-border',
      };
    case BIN_STATUS.OVERTURNED:
      return {
        label: 'Overturned (Tilt!)',
        bg: 'bg-charcoal text-sand',
        border: 'border-charcoal',
        dot: 'bg-terracotta',
        pillBg: 'bg-charcoal-light/20 text-charcoal-dark border-charcoal/40',
      };
    case BIN_STATUS.OFFLINE:
      return {
        label: 'Device Offline',
        bg: 'bg-dusty text-navy-dark',
        border: 'border-dusty',
        dot: 'bg-charcoal',
        pillBg: 'bg-dusty-bg text-dusty-dark border-dusty/40',
      };
    case BIN_STATUS.NORMAL:
    default:
      return {
        label: 'Normal (<60%)',
        bg: 'bg-dusty-dark text-white',
        border: 'border-dusty',
        dot: 'bg-sand',
        pillBg: 'bg-dusty-bg text-dusty-dark border-dusty/30',
      };
  }
}

// Load initial or persisted store
export function loadEcoBinStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = {
        bins: INITIAL_BINS,
        staff: INITIAL_STAFF,
        cleaningLogs: INITIAL_CLEANING_LOGS,
        reports: INITIAL_REPORTS,
        suggestions: INITIAL_SUGGESTIONS,
        iotConfig: INITIAL_IOT_CONFIG,
      };
      saveEcoBinStore(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading store from localStorage, using fallback:', e);
    return {
      bins: INITIAL_BINS,
      staff: INITIAL_STAFF,
      cleaningLogs: INITIAL_CLEANING_LOGS,
      reports: INITIAL_REPORTS,
      suggestions: INITIAL_SUGGESTIONS,
      iotConfig: INITIAL_IOT_CONFIG,
    };
  }
}

export function saveEcoBinStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function resetEcoBinStore() {
  const initial = {
    bins: INITIAL_BINS,
    staff: INITIAL_STAFF,
    cleaningLogs: INITIAL_CLEANING_LOGS,
    reports: INITIAL_REPORTS,
    suggestions: INITIAL_SUGGESTIONS,
    iotConfig: INITIAL_IOT_CONFIG,
  };
  saveEcoBinStore(initial);
  return initial;
}
