import mongoose, { Schema } from 'mongoose';

// User Schema
export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  firebaseUid: { type: String, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  callsign: { type: String, required: true, index: true },
  badgeNumber: { type: String, required: true, unique: true, index: true },
  organization: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    isVerified: { type: Boolean, default: false }
  },
  role: { 
    type: String, 
    enum: ['COMMANDER', 'OFFICER', 'PARAMEDIC', 'SPECIALIST', 'OPERATOR', 'VOLUNTEER'],
    default: 'PARAMEDIC'
  },
  rank: { type: String, default: 'Responder' },
  availability: { 
    type: String, 
    enum: ['ON_DUTY', 'OFF_DUTY', 'DEPLOYED', 'STANDBY', 'MOBILIZING'],
    default: 'ON_DUTY'
  },
  certifications: [{
    name: String,
    issuer: String,
    issuedDate: String,
    expiresDate: String,
    verified: Boolean
  }],
  skills: [{ type: String }],
  avatarUrl: { type: String },
  phone: { type: String },
  pairedPagerId: { type: String }
}, { timestamps: true });

// Post Schema
export const PostSchema = new Schema({
  authorId: { type: String, required: true, index: true },
  author: {
    id: String,
    name: String,
    callsign: String,
    avatarUrl: String,
    role: String,
    rank: String,
    badgeNumber: String,
    organizationName: String,
    isVerified: Boolean
  },
  type: { 
    type: String, 
    enum: ['SITREP', 'TRAINING', 'INCIDENT_DISPATCH', 'SAFETY_BULLETIN', 'EQUIPMENT', 'GENERAL'],
    required: true,
    index: true
  },
  severity: { 
    type: String, 
    enum: ['ROUTINE', 'PRIORITY', 'URGENT', 'FLASH_EMERGENCY'],
    default: 'ROUTINE',
    index: true
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  locationName: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  attachments: [{
    url: String,
    type: { type: String, enum: ['IMAGE', 'DOCUMENT', 'AUDIO'] },
    name: String,
    size: Number
  }],
  reactions: {
    acknowledge: [{ type: String }],
    salute: [{ type: String }],
    support: [{ type: String }],
    critical: [{ type: String }]
  },
  commentsCount: { type: Number, default: 0 },
  incidentId: { type: String, index: true }
}, { timestamps: true });

PostSchema.index({ createdAt: -1 });

// Incident Schema
export const IncidentSchema = new Schema({
  incidentNumber: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['WILDFIRE', 'FLOOD', 'EARTHQUAKE', 'URBAN_SAR', 'MCI_MASS_CASUALTY', 'HAZMAT', 'STRUCTURAL_COLLAPSE'],
    required: true,
    index: true
  },
  severityLevel: { type: Number, min: 1, max: 5, default: 3, index: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'CONTAINMENT', 'DEMOBILIZATION', 'CLOSED'],
    default: 'ACTIVE',
    index: true
  },
  joinCode: { type: String, required: true, unique: true, index: true },
  operationalPeriod: { type: String, required: true },
  location: {
    name: String,
    lat: Number,
    lng: Number,
    jurisdiction: String
  },
  commanderId: { type: String, required: true },
  commanderName: { type: String, required: true },
  members: [{
    userId: String,
    name: String,
    callsign: String,
    badgeNumber: String,
    avatarUrl: String,
    organizationName: String,
    icsRole: String,
    checkInStatus: String,
    joinedAt: String
  }],
  stats: {
    totalPersonnel: { type: Number, default: 1 },
    activeTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    urgentAlerts: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Task Schema
export const TaskSchema = new Schema({
  incidentId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM', index: true },
  section: { type: String, enum: ['OPERATIONS', 'PLANNING', 'LOGISTICS', 'SAFETY'], default: 'OPERATIONS' },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'], default: 'PENDING', index: true },
  assignedTo: [{
    userId: String,
    name: String,
    role: String
  }],
  checklist: [{
    text: String,
    completed: Boolean,
    completedBy: String,
    completedAt: String
  }],
  dueDate: String,
  notes: String,
  completedAt: String
}, { timestamps: true });

// Pager Device Schema
export const PagerDeviceSchema = new Schema({
  capCode: { type: String, required: true, unique: true, index: true },
  hardwareId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  assignedUserId: { type: String, index: true },
  assignedUserName: { type: String },
  model: { type: String, default: 'RESQLINK_PAGER_V3' },
  status: { 
    type: String, 
    enum: ['ONLINE', 'STANDBY', 'OFFLINE', 'EMERGENCY_SOS', 'LOW_BATTERY'],
    default: 'ONLINE',
    index: true
  },
  batteryPercentage: { type: Number, min: 0, max: 100, default: 100 },
  signalDbm: { type: Number, default: -75 },
  networkMode: { 
    type: String, 
    enum: ['CELLULAR_LTE_M', 'LORA_MESH', 'VHF_NARROWBAND', 'SATELLITE', 'BLE_RELAY', 'OFFLINE'],
    default: 'CELLULAR_LTE_M' 
  },
  gpsCoordinates: {
    lat: Number,
    lng: Number,
    altitude: Number,
    accuracyMeters: Number
  },
  motionStatus: { type: String, enum: ['NORMAL', 'STATIONARY_WARNING', 'MAN_DOWN_ALERT'], default: 'NORMAL' },
  lastHeartbeat: { type: Date, default: Date.now },
  firmwareVersion: { type: String, default: 'v3.4.12-secure' },
  unreadAlertsCount: { type: Number, default: 0 }
}, { timestamps: true });

// Pager Alert Schema
export const PagerAlertSchema = new Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  targetType: { type: String, enum: ['DIRECT_DEVICE', 'INCIDENT_BROADCAST', 'ALL_STATION_SOS'], required: true },
  targetDeviceId: { type: String, index: true },
  incidentId: { type: String, index: true },
  priority: { type: String, enum: ['P1_FLASH_SOS', 'P2_IMMEDIATE', 'P3_PRIORITY', 'P4_ROUTINE'], default: 'P2_IMMEDIATE' },
  alertTone: { type: String, default: 'CONTINUOUS_SIREN' },
  message: { type: String, required: true, maxlength: 160 },
  status: { type: String, enum: ['SENT', 'DELIVERED', 'ACKNOWLEDGED', 'EXPIRED'], default: 'SENT' },
  acknowledgement: {
    response: { type: String, enum: ['ACK_10_4', 'EN_ROUTE', 'ON_SCENE', 'UNABLE_10_7', 'MAN_DOWN_SOS', null] },
    timestamp: String,
    responderName: String,
    responderLocation: {
      lat: Number,
      lng: Number
    }
  }
}, { timestamps: true });

// Mongoose Models export
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const PostModel = mongoose.models.Post || mongoose.model('Post', PostSchema);
export const IncidentModel = mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
export const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const PagerDeviceModel = mongoose.models.PagerDevice || mongoose.model('PagerDevice', PagerDeviceSchema);
export const PagerAlertModel = mongoose.models.PagerAlert || mongoose.model('PagerAlert', PagerAlertSchema);

