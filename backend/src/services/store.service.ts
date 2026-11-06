import bcrypt from 'bcryptjs';
import { 
  IUser, IPost, IComment, IIncident, ITask, IICSDocument, 
  IPagerDevice, IPagerAlert, IMessage, INotification, 
  ResponderRole, AvailabilityStatus, OrganizationType, ICSRole, CheckInStatus, PagerPriority 
} from '../models/types';
import { isDbConnected } from '../config/db';
import { UserModel, PostModel, IncidentModel, TaskModel, PagerDeviceModel, PagerAlertModel } from '../models/schemas';

class StoreService {
  private users: Map<string, IUser> = new Map();
  private posts: Map<string, IPost> = new Map();
  private comments: Map<string, IComment[]> = new Map();
  private incidents: Map<string, IIncident> = new Map();
  private tasks: Map<string, ITask> = new Map();
  private documents: Map<string, IICSDocument> = new Map();
  private pagerDevices: Map<string, IPagerDevice> = new Map();
  private pagerAlerts: Map<string, IPagerAlert> = new Map();
  private messages: Map<string, IMessage[]> = new Map();
  private notifications: Map<string, INotification[]> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Responder2026!', salt);

    // 1. Responders
    const user1: IUser = {
      id: 'usr-commander-01',
      email: 'commander@resqlink.org',
      passwordHash: defaultPasswordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      callsign: 'Apex-Command',
      badgeNumber: 'IC-9402',
      organization: {
        id: 'org-metro-fire',
        name: 'Metro Fire & Rescue Authority',
        type: 'FIRE_RESCUE',
        isVerified: true
      },
      role: 'COMMANDER',
      rank: 'Battalion Chief',
      availability: 'ON_DUTY',
      certifications: [
        { name: 'FEMA ICS-400 Advanced Incident Command', issuer: 'DHS / FEMA', issuedDate: '2022-04-10', expiresDate: '2027-04-10', verified: true },
        { name: 'National Incident Management (NIMS)', issuer: 'USFA', issuedDate: '2021-09-15', expiresDate: '2026-09-15', verified: true },
        { name: 'Urban Search & Rescue Incident Commander', issuer: 'State Fire Marshal', issuedDate: '2023-01-20', expiresDate: '2028-01-20', verified: true }
      ],
      skills: ['Incident Command System (ICS)', 'Multi-Agency Coordination', 'Crisis Strategy', 'Mass Casualty Triage', 'Structural Firefighting'],
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      phone: '+1-555-019-4821',
      pairedPagerId: 'pgr-alpha-01',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const user2: IUser = {
      id: 'usr-medic-02',
      email: 'marcus.vance@resqlink.org',
      passwordHash: defaultPasswordHash,
      firstName: 'Marcus',
      lastName: 'Vance',
      callsign: 'Medic-Lead',
      badgeNumber: 'EMS-7714',
      organization: {
        id: 'org-dmat-fl',
        name: 'Disaster Medical Assistance Team (DMAT-1)',
        type: 'EMS_PARAMEDIC',
        isVerified: true
      },
      role: 'PARAMEDIC',
      rank: 'Supervising Flight Paramedic',
      availability: 'ON_DUTY',
      certifications: [
        { name: 'Critical Care Paramedic (CCP-C)', issuer: 'IBSC', issuedDate: '2023-05-11', expiresDate: '2027-05-11', verified: true },
        { name: 'Advanced Trauma Life Support (ATLS)', issuer: 'ACS', issuedDate: '2024-02-14', expiresDate: '2028-02-14', verified: true }
      ],
      skills: ['Field Triage & Trauma', 'Aeromedical Evacuation', 'PHTLS', 'Vascular Access', 'Disaster Medicine'],
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      phone: '+1-555-014-9923',
      pairedPagerId: 'pgr-medic-02',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const user3: IUser = {
      id: 'usr-sar-03',
      email: 'elena.rostova@resqlink.org',
      passwordHash: defaultPasswordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      callsign: 'K9-Tracker',
      badgeNumber: 'SAR-3390',
      organization: {
        id: 'org-mountain-sar',
        name: 'Cascade Mountain Search & Rescue',
        type: 'SEARCH_AND_RESCUE',
        isVerified: true
      },
      role: 'SPECIALIST',
      rank: 'Senior SAR Field Specialist',
      availability: 'DEPLOYED',
      certifications: [
        { name: 'K9 Wilderness Air Scent Certification', issuer: 'NASAR', issuedDate: '2023-08-19', expiresDate: '2026-08-19', verified: true },
        { name: 'Technical Rope Rescue Tech (TRRT)', issuer: 'Rescue 3 Intl', issuedDate: '2022-11-05', expiresDate: '2027-11-05', verified: true }
      ],
      skills: ['K9 Tracking', 'Alpine Mountain SAR', 'High-Angle Rope Rescue', 'GPS Wilderness Navigation', 'Thermal Drone Recon'],
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      phone: '+1-555-017-3312',
      pairedPagerId: 'pgr-k9-03',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const user4: IUser = {
      id: 'usr-logistics-04',
      email: 'david.kim@resqlink.org',
      passwordHash: defaultPasswordHash,
      firstName: 'David',
      lastName: 'Kim',
      callsign: 'Supply-Ops',
      badgeNumber: 'LOG-8821',
      organization: {
        id: 'org-redcross',
        name: 'Emergency Relief & Civil Defense',
        type: 'DISASTER_RELIEF',
        isVerified: true
      },
      role: 'OFFICER',
      rank: 'Logistics Section Chief',
      availability: 'STANDBY',
      certifications: [
        { name: 'Disaster Supply Chain & Fleet Logistics', issuer: 'Red Cross Intl', issuedDate: '2021-06-12', expiresDate: '2026-06-12', verified: true },
        { name: 'Emergency Satellite Comms Deployment', issuer: 'ITU Disaster Comms', issuedDate: '2023-09-01', expiresDate: '2028-09-01', verified: true }
      ],
      skills: ['Fleet Dispatch', 'Mobile Command Unit Ops', 'Satellite Mesh Uplink', 'Resource Allocation', 'Warehouse Triage'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      phone: '+1-555-011-8844',
      pairedPagerId: 'pgr-log-04',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const user5: IUser = {
      id: 'usr-volunteer-05',
      email: 'chloe.bennett@resqlink.org',
      passwordHash: defaultPasswordHash,
      firstName: 'Chloe',
      lastName: 'Bennett',
      callsign: 'River-Scout',
      badgeNumber: 'VOL-5520',
      organization: {
        id: 'org-volunteer-corps',
        name: 'Community Emergency Response Team (CERT)',
        type: 'CIVIL_DEFENSE',
        isVerified: false
      },
      role: 'VOLUNTEER',
      rank: 'Volunteer Team Lead',
      availability: 'ON_DUTY',
      certifications: [
        { name: 'CERT Basic Disaster Response', issuer: 'FEMA', issuedDate: '2024-01-10', expiresDate: '2027-01-10', verified: true },
        { name: 'Swiftwater Rescue Awareness', issuer: 'ACA', issuedDate: '2023-07-22', expiresDate: '2026-07-22', verified: true }
      ],
      skills: ['First Aid & CPR', 'Sandbagging & Flood Barrier', 'Community Sheltering', 'Radio Comms (VHF/FRS)'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      phone: '+1-555-013-4411',
      pairedPagerId: 'pgr-vol-05',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    [user1, user2, user3, user4, user5].forEach(u => this.users.set(u.id, u));

    // 2. Social Network Posts & SITREPs
    const post1: IPost = {
      id: 'post-sitrep-101',
      authorId: user1.id,
      author: {
        id: user1.id,
        name: `${user1.firstName} ${user1.lastName}`,
        callsign: user1.callsign,
        avatarUrl: user1.avatarUrl,
        role: user1.role,
        rank: user1.rank,
        badgeNumber: user1.badgeNumber,
        organizationName: user1.organization.name,
        isVerified: user1.organization.isVerified
      },
      type: 'SITREP',
      severity: 'FLASH_EMERGENCY',
      title: 'SITREP #04: Pine Ridge Wildfire Escalation & Sector 4 Defensive Line',
      content: 'Current perimeter containment stands at 32%. Extreme 35kt wind gusts pushing fire front east toward County Road 88. Strike Team Charlie has completed controlled burn operations. All mutual aid units responding via Channel Bravo. High-pressure air tankers active overhead; ground crews maintain 500m safety clearance.',
      locationName: 'Pine Ridge National Forest, Ridge Zone C',
      coordinates: { lat: 39.7392, lng: -104.9903 },
      attachments: [
        {
          url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          name: 'Sector_4_Defensive_Line_Thermal.jpg',
          size: 1420500
        }
      ],
      reactions: {
        acknowledge: [user2.id, user3.id, user4.id, user5.id],
        salute: [user3.id, user4.id],
        support: [user2.id, user5.id],
        critical: [user2.id, user3.id, user4.id]
      },
      commentsCount: 2,
      incidentId: 'inc-wildfire-01',
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 60000).toISOString()
    };

    const post2: IPost = {
      id: 'post-training-102',
      authorId: user2.id,
      author: {
        id: user2.id,
        name: `${user2.firstName} ${user2.lastName}`,
        callsign: user2.callsign,
        avatarUrl: user2.avatarUrl,
        role: user2.role,
        rank: user2.rank,
        badgeNumber: user2.badgeNumber,
        organizationName: user2.organization.name,
        isVerified: user2.organization.isVerified
      },
      type: 'TRAINING',
      severity: 'ROUTINE',
      title: 'Field Trauma Update: TCCC Hemostatic Dressing Best Practices 2026',
      content: 'Sharing the revised Tactical Combat Casualty Care (TCCC) protocol on junctional hemorrhage control and the deployment of chitosan-impregnated gauze. Field teams operating in low-light environments are advised to practice one-handed tourniquet application.',
      locationName: 'Regional Emergency Medical Training Center',
      coordinates: { lat: 39.7520, lng: -104.9811 },
      attachments: [
        {
          url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          name: 'TCCC_Triage_Procedure_Summary.jpg',
          size: 890200
        }
      ],
      reactions: {
        acknowledge: [user1.id, user3.id, user4.id],
        salute: [user1.id, user3.id, user5.id],
        support: [user1.id, user4.id],
        critical: []
      },
      commentsCount: 1,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
    };

    const post3: IPost = {
      id: 'post-equipment-103',
      authorId: user3.id,
      author: {
        id: user3.id,
        name: `${user3.firstName} ${user3.lastName}`,
        callsign: user3.callsign,
        avatarUrl: user3.avatarUrl,
        role: user3.role,
        rank: user3.rank,
        badgeNumber: user3.badgeNumber,
        organizationName: user3.organization.name,
        isVerified: user3.organization.isVerified
      },
      type: 'EQUIPMENT',
      severity: 'PRIORITY',
      title: 'ResQLink Two-Way Pager Mesh 915MHz LoRa Field Evaluation',
      content: 'Tested the ResQLink Mark III LoRa Pager relay across 14 miles of dense alpine canyon terrain with zero cellular coverage. Packet delivery rate sustained at 99.4% with 3 hops. Immediate ACK and GPS telemetry reached the incident commander terminal within 1.2 seconds.',
      locationName: 'Clear Creek Canyon SAR Sector',
      coordinates: { lat: 39.7401, lng: -105.2211 },
      attachments: [
        {
          url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          name: 'ResQLink_LoRa_Pager_Field_Test.jpg',
          size: 1120000
        }
      ],
      reactions: {
        acknowledge: [user1.id, user2.id, user4.id, user5.id],
        salute: [user1.id, user2.id],
        support: [user4.id, user5.id],
        critical: []
      },
      commentsCount: 1,
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 3600000).toISOString()
    };

    [post1, post2, post3].forEach(p => this.posts.set(p.id, p));

    // Comments
    this.comments.set(post1.id, [
      {
        id: 'cmt-1',
        postId: post1.id,
        authorId: user2.id,
        author: {
          id: user2.id,
          name: `${user2.firstName} ${user2.lastName}`,
          callsign: user2.callsign,
          avatarUrl: user2.avatarUrl,
          role: user2.role,
          organizationName: user2.organization.name
        },
        content: 'Copy that Chief. DMAT Triage tent 2 is standing by on Alpha frequency with 4 flight-ready burn units.',
        createdAt: new Date(Date.now() - 35 * 60000).toISOString()
      },
      {
        id: 'cmt-2',
        postId: post1.id,
        authorId: user4.id,
        author: {
          id: user4.id,
          name: `${user4.firstName} ${user4.lastName}`,
          callsign: user4.callsign,
          avatarUrl: user4.avatarUrl,
          role: user4.role,
          organizationName: user4.organization.name
        },
        content: 'Refueling tender and 200 units of N95 respirator masks arriving at Staging Area West via Highway 11.',
        createdAt: new Date(Date.now() - 20 * 60000).toISOString()
      }
    ]);

    this.comments.set(post2.id, [
      {
        id: 'cmt-3',
        postId: post2.id,
        authorId: user5.id,
        author: {
          id: user5.id,
          name: `${user5.firstName} ${user5.lastName}`,
          callsign: user5.callsign,
          avatarUrl: user5.avatarUrl,
          role: user5.role,
          organizationName: user5.organization.name
        },
        content: 'Outstanding visual guide Marcus. Will review this during CERT squad drill tomorrow evening.',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ]);

    this.comments.set(post3.id, [
      {
        id: 'cmt-4',
        postId: post3.id,
        authorId: user1.id,
        author: {
          id: user1.id,
          name: `${user1.firstName} ${user1.lastName}`,
          callsign: user1.callsign,
          avatarUrl: user1.avatarUrl,
          role: user1.role,
          organizationName: user1.organization.name
        },
        content: '10-4 Elena. We are issuing 25 additional ResQLink pagers to the frontline task force tomorrow.',
        createdAt: new Date(Date.now() - 8 * 3600000).toISOString()
      }
    ]);

    // 3. Incident Rooms (Google Classroom-inspired Incident Management)
    const inc1: IIncident = {
      id: 'inc-wildfire-01',
      incidentNumber: 'INC-2026-FIRE-084',
      title: 'Pine Ridge Wildfire & Structural Defense',
      description: 'Major wildland-urban interface blaze ignited by lightning. Active perimeter expanding rapidly towards residential subdivision Sector C. Multi-agency Unified Command established under ICS-400 standards.',
      type: 'WILDFIRE',
      severityLevel: 4,
      status: 'ACTIVE',
      joinCode: 'FIRE91',
      operationalPeriod: 'Operational Period 03: 0600 - 1800 MST',
      location: {
        name: 'Pine Ridge Foothills & Sector C Subdivision',
        lat: 39.7392,
        lng: -104.9903,
        jurisdiction: 'Tri-County Emergency Services District'
      },
      commanderId: user1.id,
      commanderName: `${user1.firstName} ${user1.lastName} (${user1.callsign})`,
      members: [
        {
          userId: user1.id,
          name: `${user1.firstName} ${user1.lastName}`,
          callsign: user1.callsign,
          badgeNumber: user1.badgeNumber,
          avatarUrl: user1.avatarUrl,
          organizationName: user1.organization.name,
          icsRole: 'INCIDENT_COMMANDER',
          checkInStatus: 'ON_SCENE',
          joinedAt: new Date(Date.now() - 12 * 3600000).toISOString()
        },
        {
          userId: user2.id,
          name: `${user2.firstName} ${user2.lastName}`,
          callsign: user2.callsign,
          badgeNumber: user2.badgeNumber,
          avatarUrl: user2.avatarUrl,
          organizationName: user2.organization.name,
          icsRole: 'SAFETY_OFFICER',
          checkInStatus: 'ON_SCENE',
          joinedAt: new Date(Date.now() - 10 * 3600000).toISOString()
        },
        {
          userId: user3.id,
          name: `${user3.firstName} ${user3.lastName}`,
          callsign: user3.callsign,
          badgeNumber: user3.badgeNumber,
          avatarUrl: user3.avatarUrl,
          organizationName: user3.organization.name,
          icsRole: 'STRIKE_TEAM_LEADER',
          checkInStatus: 'ON_SCENE',
          joinedAt: new Date(Date.now() - 8 * 3600000).toISOString()
        },
        {
          userId: user4.id,
          name: `${user4.firstName} ${user4.lastName}`,
          callsign: user4.callsign,
          badgeNumber: user4.badgeNumber,
          avatarUrl: user4.avatarUrl,
          organizationName: user4.organization.name,
          icsRole: 'LOGISTICS_CHIEF',
          checkInStatus: 'CHECKED_IN',
          joinedAt: new Date(Date.now() - 6 * 3600000).toISOString()
        },
        {
          userId: user5.id,
          name: `${user5.firstName} ${user5.lastName}`,
          callsign: user5.callsign,
          badgeNumber: user5.badgeNumber,
          avatarUrl: user5.avatarUrl,
          organizationName: user5.organization.name,
          icsRole: 'FIELD_RESPONDER',
          checkInStatus: 'EN_ROUTE',
          joinedAt: new Date(Date.now() - 2 * 3600000).toISOString()
        }
      ],
      stats: {
        totalPersonnel: 5,
        activeTasks: 4,
        completedTasks: 3,
        urgentAlerts: 1
      },
      createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const inc2: IIncident = {
      id: 'inc-mci-02',
      incidentNumber: 'INC-2026-MCI-102',
      title: 'Metro Rail High-Speed Derailment & MCI',
      description: 'Passenger train derailment at Grand Junction crossing. Estimated 80 passengers onboard. Mass casualty triage initiated under START protocol. Multiple structural extrication teams deployed.',
      type: 'MCI_MASS_CASUALTY',
      severityLevel: 5,
      status: 'ACTIVE',
      joinCode: 'MCI101',
      operationalPeriod: 'Operational Period 01: 0000 - 1200 MST',
      location: {
        name: 'Grand Junction Rail Yard, Mile Marker 42',
        lat: 39.7521,
        lng: -104.9750,
        jurisdiction: 'Metro Regional Transit Police & Fire'
      },
      commanderId: user2.id,
      commanderName: `${user2.firstName} ${user2.lastName} (${user2.callsign})`,
      members: [
        {
          userId: user2.id,
          name: `${user2.firstName} ${user2.lastName}`,
          callsign: user2.callsign,
          badgeNumber: user2.badgeNumber,
          avatarUrl: user2.avatarUrl,
          organizationName: user2.organization.name,
          icsRole: 'INCIDENT_COMMANDER',
          checkInStatus: 'ON_SCENE',
          joinedAt: new Date(Date.now() - 3 * 3600000).toISOString()
        },
        {
          userId: user1.id,
          name: `${user1.firstName} ${user1.lastName}`,
          callsign: user1.callsign,
          badgeNumber: user1.badgeNumber,
          avatarUrl: user1.avatarUrl,
          organizationName: user1.organization.name,
          icsRole: 'OPS_CHIEF',
          checkInStatus: 'ON_SCENE',
          joinedAt: new Date(Date.now() - 2 * 3600000).toISOString()
        }
      ],
      stats: {
        totalPersonnel: 2,
        activeTasks: 5,
        completedTasks: 1,
        urgentAlerts: 2
      },
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    [inc1, inc2].forEach(inc => this.incidents.set(inc.id, inc));

    // 4. Tasks (Google Classroom style assignments)
    const task1: ITask = {
      id: 'task-101',
      incidentId: inc1.id,
      title: 'Deploy Dozer Line & Firebreak along Ridge Road',
      description: 'Cut 30-foot mineral soil firebreak between coordinates 39.7392,-104.9903 and Elk Creek drainage to arrest eastern spread towards residential cabins.',
      priority: 'CRITICAL',
      section: 'OPERATIONS',
      status: 'IN_PROGRESS',
      assignedTo: [
        { userId: user3.id, name: `${user3.firstName} ${user3.lastName}`, role: 'Strike Team Leader' }
      ],
      checklist: [
        { id: 'chk-1', text: 'Scout terrain gradient with drone thermal scan', completed: true, completedBy: user3.firstName, completedAt: new Date(Date.now() - 60 * 60000).toISOString() },
        { id: 'chk-2', text: 'Establish safety escape routes and designated safety zone Alpha', completed: true, completedBy: user3.firstName, completedAt: new Date(Date.now() - 40 * 60000).toISOString() },
        { id: 'chk-3', text: 'Engage heavy dozers 1 and 2 in tandem scraping', completed: false },
        { id: 'chk-4', text: 'Lay hose lines for water defense along mineral soil boundary', completed: false }
      ],
      dueDate: new Date(Date.now() + 3 * 3600000).toISOString(),
      notes: 'Ensure lookouts have functional VHF handheld radios tuned to Tactical TAC-3.',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const task2: ITask = {
      id: 'task-102',
      incidentId: inc1.id,
      title: 'Establish Secondary Casualty Collection Point (CCP-2)',
      description: 'Set up illuminated triage station at Ridge View Elementary School parking lot. Prepare 20 litter stanchions and supplemental oxygen manifolds.',
      priority: 'HIGH',
      section: 'SAFETY',
      status: 'COMPLETED',
      assignedTo: [
        { userId: user2.id, name: `${user2.firstName} ${user2.lastName}`, role: 'Safety Officer / Triage' },
        { userId: user5.id, name: `${user5.firstName} ${user5.lastName}`, role: 'Volunteer Field Responder' }
      ],
      checklist: [
        { id: 'chk-5', text: 'Erect triage tent with RED/YELLOW/GREEN/BLACK color coding tarps', completed: true, completedBy: user2.firstName, completedAt: new Date(Date.now() - 90 * 60000).toISOString() },
        { id: 'chk-6', text: 'Connect mobile diesel generator and power distribution lines', completed: true, completedBy: user5.firstName, completedAt: new Date(Date.now() - 75 * 60000).toISOString() },
        { id: 'chk-7', text: 'Verify ambulance egress route free of emergency vehicle gridlock', completed: true, completedBy: user2.firstName, completedAt: new Date(Date.now() - 60 * 60000).toISOString() }
      ],
      dueDate: new Date(Date.now() - 30 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 60 * 60000).toISOString(),
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 60000).toISOString()
    };

    const task3: ITask = {
      id: 'task-103',
      incidentId: inc1.id,
      title: 'Distribute 30 ResQLink Two-Way Pagers to Mutual Aid Crews',
      description: 'Log CapCodes and verify satellite/mesh radio pairing for incoming volunteer engine strike teams from out of county.',
      priority: 'MEDIUM',
      section: 'LOGISTICS',
      status: 'EN_ROUTE',
      assignedTo: [
        { userId: user4.id, name: `${user4.firstName} ${user4.lastName}`, role: 'Logistics Chief' }
      ],
      checklist: [
        { id: 'chk-8', text: 'Unpack Pelican transport case #4 with 30 charged units', completed: true, completedBy: user4.firstName, completedAt: new Date(Date.now() - 30 * 60000).toISOString() },
        { id: 'chk-9', text: 'Conduct all-station test ping and confirm two-way 10-4 ACK response', completed: false },
        { id: 'chk-10', text: 'Record responder signature and badge numbers in check-in ledger', completed: false }
      ],
      dueDate: new Date(Date.now() + 2 * 3600000).toISOString(),
      createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    [task1, task2, task3].forEach(t => this.tasks.set(t.id, t));

    // 5. ICS Documents (Google Classroom Classwork Digital Forms)
    const doc1: IICSDocument = {
      id: 'doc-ics201-01',
      incidentId: inc1.id,
      formType: 'ICS_201_BRIEFING',
      title: 'ICS-201 Incident Briefing: Pine Ridge Fire',
      preparedBy: `${user1.firstName} ${user1.lastName} (Incident Commander)`,
      approvedBy: 'Battalion Chief S. Jenkins',
      status: 'APPROVED',
      version: 2,
      data: {
        incidentName: 'Pine Ridge Wildfire',
        dateInitiated: '2026-11-05 14:00',
        currentSituation: 'Active fire behavior with spotting up to 1/4 mile ahead of flame front.',
        currentObjectives: [
          'Ensure 100% life safety for residents of Sector C and deployed response personnel.',
          'Hold perimeter along County Road 88 using natural barriers and dozer scrape lines.',
          'Protect critical telecommunications tower at Ridge Peak.'
        ],
        commandStructure: {
          IC: 'Sarah Jenkins',
          Safety: 'Marcus Vance',
          Ops: 'Elena Rostova',
          Logistics: 'David Kim'
        }
      },
      createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 3600000).toISOString()
    };

    const doc2: IICSDocument = {
      id: 'doc-ics204-02',
      incidentId: inc1.id,
      formType: 'ICS_204_ASSIGNMENT',
      title: 'ICS-204 Assignment List: Strike Team Charlie',
      preparedBy: 'Planning Section Chief',
      approvedBy: 'Operations Section Chief E. Rostova',
      status: 'APPROVED',
      version: 1,
      data: {
        operationalPeriod: '0600 - 1800 MST',
        branch: 'Branch I (Structural Defense)',
        division: 'Division Charlie',
        assignedResources: ['Engine 12', 'Engine 44', 'Brush Tender 9', 'Dozer 2'],
        specialInstructions: 'Lookouts, Communications, Escape routes, and Safety zones (LCES) must be reinforced every 60 minutes.'
      },
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600000).toISOString()
    };

    [doc1, doc2].forEach(d => this.documents.set(d.id, d));

    // 6. Two-Way Pagers & Hardware Telemetry (ResQLink Pager Network)
    const pager1: IPagerDevice = {
      id: 'pgr-alpha-01',
      capCode: 'CAP-104921',
      hardwareId: 'RQ-PGR-v3-90812',
      name: 'Alpha-1 Commander Pager',
      assignedUserId: user1.id,
      assignedUserName: `${user1.firstName} ${user1.lastName}`,
      model: 'RESQLINK_PAGER_V3',
      status: 'ONLINE',
      batteryPercentage: 94,
      signalDbm: -68,
      networkMode: 'CELLULAR_LTE_M',
      gpsCoordinates: {
        lat: 39.7392,
        lng: -104.9903,
        altitude: 1609.3,
        accuracyMeters: 3.2
      },
      motionStatus: 'NORMAL',
      lastHeartbeat: new Date().toISOString(),
      firmwareVersion: 'v3.4.12-AES256',
      unreadAlertsCount: 0,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pager2: IPagerDevice = {
      id: 'pgr-medic-02',
      capCode: 'CAP-209841',
      hardwareId: 'RQ-PGR-v3-84119',
      name: 'Medic-Lead Tactical Pager',
      assignedUserId: user2.id,
      assignedUserName: `${user2.firstName} ${user2.lastName}`,
      model: 'RESQLINK_PAGER_V3',
      status: 'ONLINE',
      batteryPercentage: 81,
      signalDbm: -82,
      networkMode: 'LORA_MESH',
      gpsCoordinates: {
        lat: 39.7410,
        lng: -104.9880,
        altitude: 1612.0,
        accuracyMeters: 4.8
      },
      motionStatus: 'NORMAL',
      lastHeartbeat: new Date(Date.now() - 25000).toISOString(),
      firmwareVersion: 'v3.4.12-AES256',
      unreadAlertsCount: 1,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pager3: IPagerDevice = {
      id: 'pgr-k9-03',
      capCode: 'CAP-318290',
      hardwareId: 'RQ-PGR-v3-77210',
      name: 'SAR K9 Field Tracker Pager',
      assignedUserId: user3.id,
      assignedUserName: `${user3.firstName} ${user3.lastName}`,
      model: 'LORA_MESH_RELAY',
      status: 'ONLINE',
      batteryPercentage: 62,
      signalDbm: -91,
      networkMode: 'LORA_MESH',
      gpsCoordinates: {
        lat: 39.7485,
        lng: -105.0120,
        altitude: 1740.5,
        accuracyMeters: 5.5
      },
      motionStatus: 'NORMAL',
      lastHeartbeat: new Date(Date.now() - 40000).toISOString(),
      firmwareVersion: 'v3.4.12-AES256',
      unreadAlertsCount: 0,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pager4: IPagerDevice = {
      id: 'pgr-log-04',
      capCode: 'CAP-402911',
      hardwareId: 'RQ-PGR-v3-66104',
      name: 'Logistics Base Pager',
      assignedUserId: user4.id,
      assignedUserName: `${user4.firstName} ${user4.lastName}`,
      model: 'VHF_TWO_WAY_TACTICAL',
      status: 'ONLINE',
      batteryPercentage: 98,
      signalDbm: -55,
      networkMode: 'VHF_NARROWBAND',
      gpsCoordinates: {
        lat: 39.7280,
        lng: -104.9600,
        altitude: 1590.0,
        accuracyMeters: 2.1
      },
      motionStatus: 'NORMAL',
      lastHeartbeat: new Date(Date.now() - 15000).toISOString(),
      firmwareVersion: 'v3.4.12-AES256',
      unreadAlertsCount: 0,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pager5: IPagerDevice = {
      id: 'pgr-vol-05',
      capCode: 'CAP-552994',
      hardwareId: 'RQ-PGR-v3-55092',
      name: 'CERT Scout Pager',
      assignedUserId: user5.id,
      assignedUserName: `${user5.firstName} ${user5.lastName}`,
      model: 'RESQLINK_PAGER_V3',
      status: 'STANDBY',
      batteryPercentage: 45,
      signalDbm: -99,
      networkMode: 'BLE_RELAY',
      gpsCoordinates: {
        lat: 39.7350,
        lng: -104.9750,
        altitude: 1600.0,
        accuracyMeters: 8.0
      },
      motionStatus: 'NORMAL',
      lastHeartbeat: new Date(Date.now() - 75000).toISOString(),
      firmwareVersion: 'v3.4.12-AES256',
      unreadAlertsCount: 0,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    [pager1, pager2, pager3, pager4, pager5].forEach(p => this.pagerDevices.set(p.id, p));

    // 7. Pager Alerts (Two-Way Emergency Pages)
    const alert1: IPagerAlert = {
      id: 'alt-flash-01',
      senderId: user1.id,
      senderName: `${user1.firstName} ${user1.lastName} (Command)`,
      targetType: 'INCIDENT_BROADCAST',
      incidentId: inc1.id,
      priority: 'P1_FLASH_SOS',
      alertTone: 'CONTINUOUS_SIREN',
      message: 'FLASH EVACUATION ORDER: Sector 4 Ridge cabins immediately. Wind shift 180 deg. Fall back to Anchor Point Alpha.',
      status: 'ACKNOWLEDGED',
      acknowledgement: {
        response: 'ACK_10_4',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        responderName: `${user3.firstName} ${user3.lastName}`,
        responderLocation: { lat: 39.7485, lng: -105.0120 }
      },
      createdAt: new Date(Date.now() - 30 * 60000).toISOString()
    };

    const alert2: IPagerAlert = {
      id: 'alt-dispatch-02',
      senderId: user1.id,
      senderName: `${user1.firstName} ${user1.lastName} (Command)`,
      targetType: 'DIRECT_DEVICE',
      targetDeviceId: pager2.id,
      incidentId: inc1.id,
      priority: 'P2_IMMEDIATE',
      alertTone: 'PULSE_BEEP',
      message: 'DISPATCH: Smoke inhalation patient at Staging Bravo. Medical unit requested with high-flow O2.',
      status: 'SENT',
      createdAt: new Date(Date.now() - 10 * 60000).toISOString()
    };

    [alert1, alert2].forEach(a => this.pagerAlerts.set(a.id, a));

    // 8. Tactical Messages
    const tacticalRoomMessages: IMessage[] = [
      {
        id: 'msg-1',
        senderId: user1.id,
        senderName: `${user1.firstName} ${user1.lastName}`,
        senderCallsign: user1.callsign,
        senderRole: user1.role,
        senderAvatarUrl: user1.avatarUrl,
        incidentId: inc1.id,
        channelName: 'COMMAND_TACTICAL',
        content: 'All units check in on this channel. Atmospheric humidity dropped to 14%. Keep eyes on crowns.',
        isPriority: true,
        attachments: [],
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 'msg-2',
        senderId: user3.id,
        senderName: `${user3.firstName} ${user3.lastName}`,
        senderCallsign: user3.callsign,
        senderRole: user3.role,
        senderAvatarUrl: user3.avatarUrl,
        incidentId: inc1.id,
        channelName: 'COMMAND_TACTICAL',
        content: 'K9 Strike team has finished sweeping cabin row 14. 6 civilians cleared and transported to Staging.',
        isPriority: false,
        attachments: [],
        createdAt: new Date(Date.now() - 75 * 60000).toISOString()
      },
      {
        id: 'msg-3',
        senderId: user2.id,
        senderName: `${user2.firstName} ${user2.lastName}`,
        senderCallsign: user2.callsign,
        senderRole: user2.role,
        senderAvatarUrl: user2.avatarUrl,
        incidentId: inc1.id,
        channelName: 'COMMAND_TACTICAL',
        content: 'Casualty Collection Point 2 is fully operational. Radio checks nominal.',
        isPriority: false,
        attachments: [],
        createdAt: new Date(Date.now() - 30 * 60000).toISOString()
      }
    ];

    this.messages.set(inc1.id, tacticalRoomMessages);

    // 9. Notifications
    const notifs: INotification[] = [
      {
        id: 'notif-1',
        userId: user1.id,
        type: 'PAGER_ALERT',
        title: 'Emergency Pager Ack Received',
        body: 'Elena Rostova (K9-Tracker) acknowledged FLASH EVACUATION ORDER (10-4).',
        read: false,
        data: { alertId: alert1.id },
        createdAt: new Date(Date.now() - 24 * 60000).toISOString()
      },
      {
        id: 'notif-2',
        userId: user1.id,
        type: 'INCIDENT_DISPATCH',
        title: 'Task Milestone Completed',
        body: 'Task "Establish Secondary CCP-2" marked as COMPLETED by Dr. Marcus Vance.',
        read: true,
        data: { taskId: task2.id, incidentId: inc1.id },
        createdAt: new Date(Date.now() - 58 * 60000).toISOString()
      },
      {
        id: 'notif-3',
        userId: user1.id,
        type: 'POST_REACTION',
        title: 'New Acknowledgment on SITREP #04',
        body: '4 responders acknowledged your SITREP: Sector 4 Defensive Line.',
        read: true,
        data: { postId: post1.id },
        createdAt: new Date(Date.now() - 30 * 60000).toISOString()
      }
    ];

    this.notifications.set(user1.id, notifs);

    console.log(`✅ [StoreService] Pre-seeded 5 responders, 3 SITREPs, 2 Incident Rooms, 3 ICS Tasks, 5 Pager Devices, and live telemetry.`);
  }

  // --- User / Responder Methods ---
  getAllUsers(): IUser[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): IUser | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): IUser | undefined {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: IUser): IUser {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<IUser>): IUser | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  // --- Posts / SITREPs ---
  getAllPosts(type?: string): IPost[] {
    let list = Array.from(this.posts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (type) {
      list = list.filter(p => p.type.toUpperCase() === type.toUpperCase());
    }
    return list;
  }

  getPostById(id: string): IPost | undefined {
    return this.posts.get(id);
  }

  createPost(post: IPost): IPost {
    this.posts.set(post.id, post);
    return post;
  }

  toggleReaction(postId: string, userId: string, reactionType: 'acknowledge' | 'salute' | 'support' | 'critical'): IPost | undefined {
    const post = this.posts.get(postId);
    if (!post) return undefined;

    const list = post.reactions[reactionType];
    const index = list.indexOf(userId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(userId);
    }
    post.updatedAt = new Date().toISOString();
    this.posts.set(postId, post);
    return post;
  }

  // --- Comments ---
  getCommentsByPostId(postId: string): IComment[] {
    return this.comments.get(postId) || [];
  }

  addComment(comment: IComment): IComment {
    const list = this.comments.get(comment.postId) || [];
    list.push(comment);
    this.comments.set(comment.postId, list);

    const post = this.posts.get(comment.postId);
    if (post) {
      post.commentsCount = list.length;
      this.posts.set(post.id, post);
    }
    return comment;
  }

  // --- Incidents (Incident Rooms) ---
  getAllIncidents(status?: string): IIncident[] {
    let list = Array.from(this.incidents.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (status) {
      list = list.filter(i => i.status.toUpperCase() === status.toUpperCase());
    }
    return list;
  }

  getIncidentById(id: string): IIncident | undefined {
    return this.incidents.get(id);
  }

  getIncidentByJoinCode(code: string): IIncident | undefined {
    const normalized = code.trim().toUpperCase();
    return Array.from(this.incidents.values()).find(i => i.joinCode.toUpperCase() === normalized);
  }

  createIncident(incident: IIncident): IIncident {
    this.incidents.set(incident.id, incident);
    return incident;
  }

  updateIncident(id: string, updates: Partial<IIncident>): IIncident | undefined {
    const inc = this.incidents.get(id);
    if (!inc) return undefined;
    const updated = { ...inc, ...updates, updatedAt: new Date().toISOString() };
    this.incidents.set(id, updated);
    return updated;
  }

  joinIncident(incidentId: string, member: any): IIncident | undefined {
    const inc = this.incidents.get(incidentId);
    if (!inc) return undefined;

    const existingIndex = inc.members.findIndex(m => m.userId === member.userId);
    if (existingIndex >= 0) {
      inc.members[existingIndex] = { ...inc.members[existingIndex], ...member };
    } else {
      inc.members.push(member);
      inc.stats.totalPersonnel = inc.members.length;
    }
    inc.updatedAt = new Date().toISOString();
    this.incidents.set(incidentId, inc);
    return inc;
  }

  // --- Tasks (ICS Assignments) ---
  getTasksByIncidentId(incidentId: string): ITask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.incidentId === incidentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTaskById(id: string): ITask | undefined {
    return this.tasks.get(id);
  }

  createTask(task: ITask): ITask {
    this.tasks.set(task.id, task);
    const inc = this.incidents.get(task.incidentId);
    if (inc) {
      inc.stats.activeTasks += 1;
      this.incidents.set(inc.id, inc);
    }
    return task;
  }

  updateTask(id: string, updates: Partial<ITask>): ITask | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...updates, updatedAt: new Date().toISOString() };
    this.tasks.set(id, updated);

    // Refresh incident stats
    const inc = this.incidents.get(updated.incidentId);
    if (inc) {
      const allTasks = this.getTasksByIncidentId(inc.id);
      inc.stats.activeTasks = allTasks.filter(t => t.status !== 'COMPLETED').length;
      inc.stats.completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
      this.incidents.set(inc.id, inc);
    }

    return updated;
  }

  // --- ICS Documents ---
  getDocumentsByIncidentId(incidentId: string): IICSDocument[] {
    return Array.from(this.documents.values()).filter(d => d.incidentId === incidentId);
  }

  createDocument(doc: IICSDocument): IICSDocument {
    this.documents.set(doc.id, doc);
    return doc;
  }

  // --- Two-Way Pager Network ---
  getAllPagerDevices(): IPagerDevice[] {
    return Array.from(this.pagerDevices.values());
  }

  getPagerDeviceById(id: string): IPagerDevice | undefined {
    return this.pagerDevices.get(id);
  }

  getPagerDeviceByCapCode(capCode: string): IPagerDevice | undefined {
    return Array.from(this.pagerDevices.values()).find(p => p.capCode.toUpperCase() === capCode.toUpperCase());
  }

  registerPagerDevice(device: IPagerDevice): IPagerDevice {
    this.pagerDevices.set(device.id, device);
    return device;
  }

  updatePagerTelemetry(id: string, telemetry: Partial<IPagerDevice>): IPagerDevice | undefined {
    const device = this.pagerDevices.get(id);
    if (!device) return undefined;
    const updated: IPagerDevice = {
      ...device,
      ...telemetry,
      lastHeartbeat: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.pagerDevices.set(id, updated);
    return updated;
  }

  getAllPagerAlerts(incidentId?: string): IPagerAlert[] {
    let list = Array.from(this.pagerAlerts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (incidentId) {
      list = list.filter(a => a.incidentId === incidentId);
    }
    return list;
  }

  createPagerAlert(alert: IPagerAlert): IPagerAlert {
    this.pagerAlerts.set(alert.id, alert);

    // If targeted at device, increment unread alerts
    if (alert.targetDeviceId) {
      const device = this.pagerDevices.get(alert.targetDeviceId);
      if (device) {
        device.unreadAlertsCount = (device.unreadAlertsCount || 0) + 1;
        this.pagerDevices.set(device.id, device);
      }
    }
    return alert;
  }

  acknowledgePagerAlert(alertId: string, ack: any): IPagerAlert | undefined {
    const alert = this.pagerAlerts.get(alertId);
    if (!alert) return undefined;

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgement = {
      response: ack.response,
      timestamp: new Date().toISOString(),
      responderName: ack.responderName || 'First Responder',
      responderLocation: ack.responderLocation
    };
    this.pagerAlerts.set(alertId, alert);
    return alert;
  }

  // --- Tactical & Direct Messaging ---
  getMessagesByChannel(channelKey: string): IMessage[] {
    return this.messages.get(channelKey) || [];
  }

  addMessage(channelKey: string, message: IMessage): IMessage {
    const list = this.messages.get(channelKey) || [];
    list.push(message);
    this.messages.set(channelKey, list);
    return message;
  }

  // --- Notifications ---
  getUserNotifications(userId: string): INotification[] {
    return this.notifications.get(userId) || [];
  }

  addNotification(notification: INotification): INotification {
    const list = this.notifications.get(notification.userId) || [];
    list.unshift(notification);
    this.notifications.set(notification.userId, list);
    return notification;
  }

  markNotificationAsRead(userId: string, notificationId: string): boolean {
    const list = this.notifications.get(userId);
    if (!list) return false;
    const notif = list.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }
}

export const store = new StoreService();

