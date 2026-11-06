export type ResponderRole = 
  | 'COMMANDER' 
  | 'OFFICER' 
  | 'PARAMEDIC' 
  | 'SPECIALIST' 
  | 'OPERATOR' 
  | 'VOLUNTEER';

export type AvailabilityStatus = 
  | 'ON_DUTY' 
  | 'OFF_DUTY' 
  | 'DEPLOYED' 
  | 'STANDBY' 
  | 'MOBILIZING';

export type OrganizationType = 
  | 'FIRE_RESCUE' 
  | 'EMS_PARAMEDIC' 
  | 'POLICE_TACTICAL' 
  | 'SEARCH_AND_RESCUE' 
  | 'DISASTER_RELIEF' 
  | 'COAST_GUARD' 
  | 'CIVIL_DEFENSE';

export interface ICertification {
  name: string;
  issuer: string;
  issuedDate: string;
  expiresDate: string;
  verified: boolean;
}

export interface IUser {
  id: string;
  email: string;
  passwordHash?: string;
  firebaseUid?: string;
  firstName: string;
  lastName: string;
  callsign: string;
  badgeNumber: string;
  organization: {
    id: string;
    name: string;
    type: OrganizationType;
    isVerified: boolean;
  };
  role: ResponderRole;
  rank: string;
  availability: AvailabilityStatus;
  certifications: ICertification[];
  skills: string[];
  avatarUrl: string;
  phone: string;
  pairedPagerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PostType = 
  | 'SITREP' 
  | 'TRAINING' 
  | 'INCIDENT_DISPATCH' 
  | 'SAFETY_BULLETIN' 
  | 'EQUIPMENT' 
  | 'GENERAL';

export type PostSeverity = 
  | 'ROUTINE' 
  | 'PRIORITY' 
  | 'URGENT' 
  | 'FLASH_EMERGENCY';

export interface IAttachment {
  url: string;
  type: 'IMAGE' | 'DOCUMENT' | 'AUDIO';
  name: string;
  size: number;
}

export interface IPost {
  id: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    callsign: string;
    avatarUrl: string;
    role: ResponderRole;
    rank: string;
    badgeNumber: string;
    organizationName: string;
    isVerified: boolean;
  };
  type: PostType;
  severity: PostSeverity;
  title: string;
  content: string;
  locationName?: string;
  coordinates?: { lat: number; lng: number };
  attachments: IAttachment[];
  reactions: {
    acknowledge: string[]; // 10-4 / Acknowledged
    salute: string[];      // Honor / Salute
    support: string[];     // Support / Backup
    critical: string[];    // Critical Alert
  };
  commentsCount: number;
  incidentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    callsign: string;
    avatarUrl: string;
    role: ResponderRole;
    organizationName: string;
  };
  content: string;
  createdAt: string;
}

export type IncidentType = 
  | 'WILDFIRE' 
  | 'FLOOD' 
  | 'EARTHQUAKE' 
  | 'URBAN_SAR' 
  | 'MCI_MASS_CASUALTY' 
  | 'HAZMAT' 
  | 'STRUCTURAL_COLLAPSE';

export type IncidentStatus = 
  | 'ACTIVE' 
  | 'CONTAINMENT' 
  | 'DEMOBILIZATION' 
  | 'CLOSED';

export type ICSRole = 
  | 'INCIDENT_COMMANDER' 
  | 'SAFETY_OFFICER' 
  | 'OPS_CHIEF' 
  | 'PLANNING_CHIEF' 
  | 'LOGISTICS_CHIEF' 
  | 'STRIKE_TEAM_LEADER' 
  | 'FIELD_RESPONDER';

export type CheckInStatus = 
  | 'CHECKED_IN' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'REST_CYCLE' 
  | 'DEMOBILIZED';

export interface IIncidentMember {
  userId: string;
  name: string;
  callsign: string;
  badgeNumber: string;
  avatarUrl: string;
  organizationName: string;
  icsRole: ICSRole;
  checkInStatus: CheckInStatus;
  joinedAt: string;
}

export interface IIncident {
  id: string;
  incidentNumber: string; // e.g. "INC-2026-904"
  title: string;
  description: string;
  type: IncidentType;
  severityLevel: 1 | 2 | 3 | 4 | 5; // 1 lowest, 5 catastrophic
  status: IncidentStatus;
  joinCode: string; // 6-digit alphanumeric join code for quick access
  operationalPeriod: string;
  location: {
    name: string;
    lat: number;
    lng: number;
    jurisdiction: string;
  };
  commanderId: string;
  commanderName: string;
  members: IIncidentMember[];
  stats: {
    totalPersonnel: number;
    activeTasks: number;
    completedTasks: number;
    urgentAlerts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskSection = 'OPERATIONS' | 'PLANNING' | 'LOGISTICS' | 'SAFETY';
export type TaskStatus = 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface ITask {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  section: TaskSection;
  status: TaskStatus;
  assignedTo: Array<{
    userId: string;
    name: string;
    role: string;
  }>;
  checklist: IChecklistItem[];
  dueDate: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ICSFormType = 
  | 'ICS_201_BRIEFING' 
  | 'ICS_202_OBJECTIVES' 
  | 'ICS_204_ASSIGNMENT' 
  | 'ICS_214_UNIT_LOG';

export interface IICSDocument {
  id: string;
  incidentId: string;
  formType: ICSFormType;
  title: string;
  preparedBy: string;
  approvedBy?: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED';
  version: number;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type PagerModel = 
  | 'RESQLINK_PAGER_V3' 
  | 'LORA_MESH_RELAY' 
  | 'VHF_TWO_WAY_TACTICAL' 
  | 'SAT_HYBRID_COMMS';

export type PagerStatus = 
  | 'ONLINE' 
  | 'STANDBY' 
  | 'OFFLINE' 
  | 'EMERGENCY_SOS' 
  | 'LOW_BATTERY';

export type PagerNetworkMode = 
  | 'CELLULAR_LTE_M' 
  | 'LORA_MESH' 
  | 'VHF_NARROWBAND' 
  | 'SATELLITE' 
  | 'BLE_RELAY' 
  | 'OFFLINE';

export type MotionStatus = 
  | 'NORMAL' 
  | 'STATIONARY_WARNING' 
  | 'MAN_DOWN_ALERT';

export interface IPagerDevice {
  id: string;
  capCode: string;
  hardwareId: string;
  name: string;
  assignedUserId: string;
  assignedUserName: string;
  model: PagerModel;
  status: PagerStatus;
  batteryPercentage: number;
  signalDbm: number;
  networkMode: PagerNetworkMode;
  gpsCoordinates: {
    lat: number;
    lng: number;
    altitude: number;
    accuracyMeters: number;
  };
  motionStatus: MotionStatus;
  lastHeartbeat: string;
  firmwareVersion: string;
  unreadAlertsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type PagerPriority = 
  | 'P1_FLASH_SOS' 
  | 'P2_IMMEDIATE' 
  | 'P3_PRIORITY' 
  | 'P4_ROUTINE';

export type PagerTone = 
  | 'CONTINUOUS_SIREN' 
  | 'PULSE_BEEP' 
  | 'SILENT_VIBRATE' 
  | 'TACTICAL_CHIRP';

export type PagerAckResponse = 
  | 'ACK_10_4' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'UNABLE_10_7' 
  | 'MAN_DOWN_SOS';

export interface IPagerAlert {
  id: string;
  senderId: string;
  senderName: string;
  targetType: 'DIRECT_DEVICE' | 'INCIDENT_BROADCAST' | 'ALL_STATION_SOS';
  targetDeviceId?: string;
  incidentId?: string;
  priority: PagerPriority;
  alertTone: PagerTone;
  message: string;
  status: 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED' | 'EXPIRED';
  acknowledgement?: {
    response: PagerAckResponse;
    timestamp: string;
    responderName: string;
    responderLocation?: { lat: number; lng: number };
  };
  createdAt: string;
}

export interface IMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderCallsign: string;
  senderRole: ResponderRole;
  senderAvatarUrl?: string;
  recipientId?: string;
  incidentId?: string;
  channelName: string;
  content: string;
  isPriority: boolean;
  attachments: IAttachment[];
  createdAt: string;
}

export interface INotification {
  id: string;
  userId: string;
  type: 'PAGER_ALERT' | 'INCIDENT_DISPATCH' | 'TASK_ASSIGNED' | 'POST_REACTION' | 'COMMENT' | 'SYSTEM_ALERT';
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

