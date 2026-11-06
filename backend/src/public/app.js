/**
 * ResQLink Full-Stack Tactical Web Portal
 * Unified Emergency Responder Social Network, Incident Coordination & Two-Way Pager Ecosystem
 */

// Global State
const state = {
  currentUser: null,
  token: null,
  activeSection: 'home',
  activeIncidentId: 'inc-wildfire-01',
  activeIncidentTab: 'stream',
  socket: null,
  posts: [],
  incidents: [],
  pagers: [],
  alerts: [],
  notifications: [],
  selectedPagerForSimulator: null,
};

const API_BASE = '/api';

// Initialize Application
async function initApp() {
  setupSocket();
  setupEventListeners();
  await authenticateDefaultUser();
  await loadInitialData();
  renderCurrentSection();
}

// Real-Time WebSocket Gateway
function setupSocket() {
  if (typeof io !== 'undefined') {
    state.socket = io();

    state.socket.on('connect', () => {
      console.log('✅ [WebSocket] Connected to ResQLink tactical gateway:', state.socket.id);
    });

    state.socket.on('feed:new_post', (post) => {
      state.posts.unshift(post);
      showToast(`📢 New SITREP: ${post.title}`, 'info');
      if (state.activeSection === 'home') renderHome();
    });

    state.socket.on('emergency:flash_alert', (data) => {
      showToast(`🚨 ${data.title}: ${data.content}`, 'sos');
      playTone('alarm');
    });

    state.socket.on('pager:incoming_alert', (alert) => {
      state.alerts.unshift(alert);
      showToast(`📟 PAGER ALERT: ${alert.message}`, 'warning');
      playTone('pager');
      
      // Update hardware simulator screen if active
      updatePagerSimulatorScreen(alert);
      if (state.activeSection === 'pagers') renderPagers();
    });

    state.socket.on('pager:alert_acknowledged', (alert) => {
      const idx = state.alerts.findIndex(a => a.id === alert.id);
      if (idx >= 0) state.alerts[idx] = alert;
      showToast(`✅ Pager ACK: ${alert.acknowledgement?.responderName} replied ${alert.acknowledgement?.response}`, 'success');
      if (state.activeSection === 'pagers') renderPagers();
    });

    state.socket.on('pager:telemetry_stream', ({ deviceId, telemetry }) => {
      const dev = state.pagers.find(p => p.id === deviceId);
      if (dev) {
        Object.assign(dev, telemetry);
        if (state.activeSection === 'pagers') {
          updateTelemetryIndicators(deviceId, dev);
        }
      }
    });

    state.socket.on('task:updated', (task) => {
      if (state.activeSection === 'incidents') {
        renderIncidents();
      }
    });
  }
}

// Authenticate initial session (Chief Sarah Jenkins - Incident Commander)
async function authenticateDefaultUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'commander@resqlink.org', password: 'Responder2026!' })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        state.token = data.token;
        state.currentUser = data.user;
        updateUserUI();
        return;
      }
    }
    throw new Error('Fallback to local tactical state');
  } catch (err) {
    // Client-side Tactical Core Fallback (for GitHub Pages static deployment)
    console.log('ℹ️ [ResQLink] Operating in High-Fidelity Client-Side Tactical Simulator Mode.');
    state.currentUser = {
      id: 'usr-commander-01',
      email: 'commander@resqlink.org',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      callsign: 'Apex-Command',
      badgeNumber: 'IC-9402',
      role: 'COMMANDER',
      rank: 'Battalion Chief',
      organization: { name: 'Metro Fire & Rescue Authority', isVerified: true },
      availability: 'ON_DUTY',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      certifications: [
        { name: 'FEMA ICS-400 Advanced Incident Command', issuer: 'DHS / FEMA', expiresDate: '2027-04-10' },
        { name: 'National Incident Management (NIMS)', issuer: 'USFA', expiresDate: '2026-09-15' },
        { name: 'Urban Search & Rescue Incident Commander', issuer: 'State Fire Marshal', expiresDate: '2028-01-20' }
      ],
      skills: ['Incident Command (ICS)', 'Crisis Strategy', 'Mass Casualty Triage', 'Structural Defense']
    };
    state.token = 'demo_tactical_token';
    updateUserUI();
  }
}

function updateUserUI() {
  if (!state.currentUser) return;
  document.getElementById('sidebarUserName').textContent = `${state.currentUser.firstName} ${state.currentUser.lastName}`;
  document.getElementById('sidebarUserRank').textContent = `${state.currentUser.rank} • ${state.currentUser.badgeNumber}`;
  document.getElementById('sidebarUserAvatar').src = state.currentUser.avatarUrl;
  document.getElementById('currentUserRolePill').innerHTML = `
    <span class="dot"></span>
    <span class="label">${state.currentUser.callsign} (${state.currentUser.role})</span>
  `;
}

// Initial Data Fetch
async function loadInitialData() {
  try {
    const [postsRes, incRes, pagersRes, alertsRes, notifsRes] = await Promise.all([
      fetch(`${API_BASE}/posts`),
      fetch(`${API_BASE}/incidents`, { headers: { Authorization: `Bearer ${state.token}` } }),
      fetch(`${API_BASE}/pager/devices`),
      fetch(`${API_BASE}/pager/alerts`),
      fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${state.token}` } })
    ]);

    if (postsRes.ok && incRes.ok && pagersRes.ok) {
      state.posts = (await postsRes.json()).posts || [];
      state.incidents = (await incRes.json()).incidents || [];
      state.pagers = (await pagersRes.json()).devices || [];
      state.alerts = (await alertsRes.json()).alerts || [];
      state.notifications = (await notifsRes.json()).notifications || [];

      if (state.pagers.length > 0) {
        state.selectedPagerForSimulator = state.pagers[0];
      }
      return;
    }
    throw new Error('API unavailable, load local preseeded records');
  } catch (err) {
    // High-Fidelity Pre-seeded Data for Standalone GitHub Pages Deployment
    loadPreseededOfflineData();
  }
}

function loadPreseededOfflineData() {
  state.posts = [
    {
      id: 'post-sitrep-101',
      author: {
        id: 'usr-commander-01',
        name: 'Sarah Jenkins',
        callsign: 'Apex-Command',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        role: 'COMMANDER',
        rank: 'Battalion Chief',
        organizationName: 'Metro Fire & Rescue Authority',
        isVerified: true
      },
      type: 'SITREP',
      severity: 'FLASH_EMERGENCY',
      title: 'SITREP #04: Pine Ridge Wildfire Escalation & Sector 4 Defensive Line',
      content: 'Current perimeter containment stands at 32%. Extreme 35kt wind gusts pushing fire front east toward County Road 88. Strike Team Charlie has completed controlled burn operations. All mutual aid units responding via Channel Bravo. High-pressure air tankers active overhead; ground crews maintain 500m safety clearance.',
      locationName: 'Pine Ridge National Forest, Ridge Zone C',
      attachments: [{ url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&auto=format&fit=crop&q=80', type: 'IMAGE' }],
      reactions: { acknowledge: ['usr-1', 'usr-2', 'usr-3'], salute: ['usr-1'], support: ['usr-2'], critical: ['usr-1', 'usr-3'] },
      commentsCount: 2,
      incidentId: 'inc-wildfire-01',
      createdAt: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
      id: 'post-training-102',
      author: {
        id: 'usr-medic-02',
        name: 'Dr. Marcus Vance',
        callsign: 'Medic-Lead',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
        role: 'PARAMEDIC',
        rank: 'Flight Paramedic Lead',
        organizationName: 'Disaster Medical Assistance Team (DMAT-1)',
        isVerified: true
      },
      type: 'TRAINING',
      severity: 'ROUTINE',
      title: 'Field Trauma Update: TCCC Hemostatic Dressing Best Practices 2026',
      content: 'Sharing revised Tactical Combat Casualty Care (TCCC) protocol on junctional hemorrhage control and deployment of chitosan-impregnated gauze. Field teams practicing one-handed tourniquet application.',
      locationName: 'Regional Emergency Medical Training Center',
      attachments: [{ url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&auto=format&fit=crop&q=80', type: 'IMAGE' }],
      reactions: { acknowledge: ['usr-1'], salute: ['usr-1', 'usr-4'], support: ['usr-3'], critical: [] },
      commentsCount: 1,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
    },
    {
      id: 'post-equipment-103',
      author: {
        id: 'usr-sar-03',
        name: 'Elena Rostova',
        callsign: 'K9-Tracker',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        role: 'SPECIALIST',
        rank: 'Senior SAR Field Specialist',
        organizationName: 'Cascade Mountain SAR',
        isVerified: true
      },
      type: 'EQUIPMENT',
      severity: 'PRIORITY',
      title: 'ResQLink Two-Way Pager Mesh 915MHz LoRa Field Evaluation',
      content: 'Tested ResQLink Mark III LoRa Pager relay across 14 miles of dense alpine canyon terrain with zero cellular coverage. Packet delivery rate sustained at 99.4% with 3 hops. Immediate ACK and GPS telemetry reached command terminal in 1.2s.',
      locationName: 'Clear Creek Canyon SAR Sector',
      attachments: [{ url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', type: 'IMAGE' }],
      reactions: { acknowledge: ['usr-1', 'usr-2'], salute: ['usr-1'], support: ['usr-4'], critical: [] },
      commentsCount: 1,
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
    }
  ];

  state.incidents = [
    {
      id: 'inc-wildfire-01',
      incidentNumber: 'INC-2026-FIRE-084',
      title: 'Pine Ridge Wildfire & Structural Defense',
      description: 'Major wildland-urban interface blaze ignited by lightning. Active perimeter expanding towards residential subdivision Sector C. Multi-agency Unified Command established.',
      severityLevel: 4,
      status: 'ACTIVE',
      joinCode: 'FIRE91',
      operationalPeriod: 'Operational Period 03: 0600 - 1800 MST',
      location: { name: 'Pine Ridge Foothills & Sector C Subdivision' },
      commanderName: 'Sarah Jenkins (Apex-Command)',
      members: [
        { name: 'Sarah Jenkins', callsign: 'Apex-Command', badgeNumber: 'IC-9402', organizationName: 'Metro Fire', icsRole: 'INCIDENT_COMMANDER', checkInStatus: 'ON_SCENE', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
        { name: 'Dr. Marcus Vance', callsign: 'Medic-Lead', badgeNumber: 'EMS-7714', organizationName: 'DMAT-1', icsRole: 'SAFETY_OFFICER', checkInStatus: 'ON_SCENE', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100' },
        { name: 'Elena Rostova', callsign: 'K9-Tracker', badgeNumber: 'SAR-3390', organizationName: 'Cascade SAR', icsRole: 'STRIKE_TEAM_LEADER', checkInStatus: 'ON_SCENE', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
        { name: 'David Kim', callsign: 'Supply-Ops', badgeNumber: 'LOG-8821', organizationName: 'Red Cross Logistics', icsRole: 'LOGISTICS_CHIEF', checkInStatus: 'CHECKED_IN', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
      ],
      stats: { totalPersonnel: 4, activeTasks: 3, completedTasks: 2, urgentAlerts: 1 }
    },
    {
      id: 'inc-mci-02',
      incidentNumber: 'INC-2026-MCI-102',
      title: 'Metro Rail High-Speed Derailment & MCI',
      description: 'Passenger train derailment at Grand Junction crossing. 80 passengers onboard. START mass casualty triage initiated.',
      severityLevel: 5,
      status: 'ACTIVE',
      joinCode: 'MCI101',
      operationalPeriod: 'Operational Period 01: 0000 - 1200 MST',
      location: { name: 'Grand Junction Rail Yard, Mile 42' },
      commanderName: 'Dr. Marcus Vance (Medic-Lead)',
      members: [
        { name: 'Dr. Marcus Vance', callsign: 'Medic-Lead', badgeNumber: 'EMS-7714', organizationName: 'DMAT-1', icsRole: 'INCIDENT_COMMANDER', checkInStatus: 'ON_SCENE', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100' },
        { name: 'Sarah Jenkins', callsign: 'Apex-Command', badgeNumber: 'IC-9402', organizationName: 'Metro Fire', icsRole: 'OPS_CHIEF', checkInStatus: 'ON_SCENE', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' }
      ],
      stats: { totalPersonnel: 2, activeTasks: 4, completedTasks: 1, urgentAlerts: 2 }
    }
  ];

  state.pagers = [
    {
      id: 'pgr-alpha-01',
      capCode: 'CAP-104921',
      name: 'Alpha-1 Commander Pager',
      assignedUserName: 'Sarah Jenkins',
      model: 'RESQLINK_PAGER_V3',
      status: 'ONLINE',
      batteryPercentage: 94,
      signalDbm: -68,
      networkMode: 'CELLULAR_LTE_M',
      gpsCoordinates: { lat: 39.7392, lng: -104.9903 }
    },
    {
      id: 'pgr-medic-02',
      capCode: 'CAP-209841',
      name: 'Medic-Lead Tactical Pager',
      assignedUserName: 'Marcus Vance',
      model: 'RESQLINK_PAGER_V3',
      status: 'ONLINE',
      batteryPercentage: 81,
      signalDbm: -82,
      networkMode: 'LORA_MESH',
      gpsCoordinates: { lat: 39.7410, lng: -104.9880 }
    },
    {
      id: 'pgr-k9-03',
      capCode: 'CAP-318290',
      name: 'SAR K9 Field Tracker Pager',
      assignedUserName: 'Elena Rostova',
      model: 'LORA_MESH_RELAY',
      status: 'ONLINE',
      batteryPercentage: 62,
      signalDbm: -91,
      networkMode: 'LORA_MESH',
      gpsCoordinates: { lat: 39.7485, lng: -105.0120 }
    },
    {
      id: 'pgr-log-04',
      capCode: 'CAP-402911',
      name: 'Logistics Base Pager',
      assignedUserName: 'David Kim',
      model: 'VHF_TWO_WAY_TACTICAL',
      status: 'ONLINE',
      batteryPercentage: 98,
      signalDbm: -55,
      networkMode: 'VHF_NARROWBAND',
      gpsCoordinates: { lat: 39.7280, lng: -104.9600 }
    }
  ];

  state.alerts = [
    {
      id: 'alt-flash-01',
      senderName: 'Sarah Jenkins (Command)',
      targetType: 'INCIDENT_BROADCAST',
      priority: 'P1_FLASH_SOS',
      message: 'FLASH EVACUATION ORDER: Sector 4 Ridge cabins immediately. Wind shift 180 deg. Fall back to Anchor Point Alpha.',
      status: 'ACKNOWLEDGED',
      acknowledgement: { response: 'ACK_10_4', responderName: 'Elena Rostova' },
      createdAt: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      id: 'alt-dispatch-02',
      senderName: 'Sarah Jenkins (Command)',
      targetType: 'DIRECT_DEVICE',
      priority: 'P2_IMMEDIATE',
      message: 'DISPATCH: Smoke inhalation patient at Staging Bravo. Medical unit requested with high-flow O2.',
      status: 'SENT',
      createdAt: new Date(Date.now() - 10 * 60000).toISOString()
    }
  ];

  state.notifications = [
    { id: 'notif-1', title: 'Emergency Pager Ack Received', body: 'Elena Rostova (K9-Tracker) acknowledged FLASH EVACUATION ORDER (10-4).', createdAt: new Date(Date.now() - 24 * 60000).toISOString() },
    { id: 'notif-2', title: 'Task Milestone Completed', body: 'Task "Establish Secondary CCP-2" marked as COMPLETED by Dr. Marcus Vance.', createdAt: new Date(Date.now() - 58 * 60000).toISOString() },
    { id: 'notif-3', title: 'New Acknowledgment on SITREP #04', body: '4 responders acknowledged your SITREP: Sector 4 Defensive Line.', createdAt: new Date(Date.now() - 30 * 60000).toISOString() }
  ];

  state.selectedPagerForSimulator = state.pagers[0];

  // Client-side simulated telemetry drift for standalone GitHub Pages viewing
  setInterval(() => {
    state.pagers.forEach(p => {
      const delta = (Math.random() - 0.5) * 2;
      p.signalDbm = Math.max(-110, Math.min(-45, Math.round(p.signalDbm + delta)));
      if (state.activeSection === 'pagers') {
        updateTelemetryIndicators(p.id, p);
      }
    });
  }, 4000);
}

// Event Listeners for Navigation & Modals
function setupEventListeners() {
  // Desktop Sidebar
  document.querySelectorAll('.sidebar .nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const section = item.dataset.section;
      navigateTo(section);
    });
  });

  // Mobile Bottom Navigation
  document.querySelectorAll('.mobile-bottom-bar .mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mobile-bottom-bar .mobile-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const section = btn.dataset.section;
      navigateTo(section);
    });
  });

  // Theme Toggle
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const body = document.body;
    if (body.classList.contains('theme-dark')) {
      body.classList.replace('theme-dark', 'theme-light');
      document.getElementById('themeIcon').textContent = '🌙';
    } else {
      body.classList.replace('theme-light', 'theme-dark');
      document.getElementById('themeIcon').textContent = '☀️';
    }
  });

  // Global SOS Button
  document.getElementById('globalSosBtn').addEventListener('click', () => {
    openGlobalSosModal();
  });

  // Close Modal on backdrop click
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });
}

function navigateTo(section) {
  state.activeSection = section;
  renderCurrentSection();
}

function renderCurrentSection() {
  const container = document.getElementById('sectionContainer');
  container.innerHTML = '';

  switch (state.activeSection) {
    case 'home':
      renderHome();
      break;
    case 'network':
      renderNetwork();
      break;
    case 'incidents':
      renderIncidents();
      break;
    case 'messages':
      renderMessages();
      break;
    case 'pagers':
      renderPagers();
      break;
    case 'notifications':
      renderNotifications();
      break;
    case 'profile':
      renderProfile();
      break;
    default:
      renderHome();
  }
}

/* ==========================================================================
   1. HOME FEED (ResQLink Professional Social Network)
   ========================================================================== */
function renderHome() {
  const container = document.getElementById('sectionContainer');
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title-wrap">
        <h1>Responder Tactical Stream</h1>
        <p>Situation reports, operational bulletins, and tactical equipment briefs.</p>
      </div>
      <div>
        <button class="btn btn-primary" onclick="openCreatePostModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New SITREP / Post
        </button>
      </div>
    </div>

    <!-- Feed Filter Chips -->
    <div style="display:flex; gap:8px; margin-bottom:20px; overflow-x:auto;">
      <button class="btn btn-outline" style="border-radius:20px; font-size:0.8rem;" onclick="filterFeed('ALL')">All Field Feeds</button>
      <button class="btn btn-outline" style="border-radius:20px; font-size:0.8rem;" onclick="filterFeed('SITREP')">🚨 SITREPs</button>
      <button class="btn btn-outline" style="border-radius:20px; font-size:0.8rem;" onclick="filterFeed('TRAINING')">🎯 Training & Drills</button>
      <button class="btn btn-outline" style="border-radius:20px; font-size:0.8rem;" onclick="filterFeed('EQUIPMENT')">📟 Pager & Comms</button>
    </div>

    <!-- Posts Container -->
    <div id="postsList">
      ${state.posts.map(post => renderPostCard(post)).join('')}
    </div>
  `;
}

function renderPostCard(post) {
  const isFlash = post.severity === 'FLASH_EMERGENCY';
  const ackCount = post.reactions?.acknowledge?.length || 0;
  const saluteCount = post.reactions?.salute?.length || 0;
  const supportCount = post.reactions?.support?.length || 0;
  const criticalCount = post.reactions?.critical?.length || 0;

  return `
    <div class="card" id="post-${post.id}">
      <div class="post-header">
        <div class="author-meta">
          <img src="${post.author.avatarUrl}" class="avatar" alt="${post.author.name}">
          <div class="author-info">
            <h4>
              ${post.author.name}
              ${post.author.isVerified ? '<span class="verified-icon" title="Verified Responder">🛡️</span>' : ''}
            </h4>
            <div class="meta-sub">
              ${post.author.rank} • ${post.author.organizationName} • Callsign: <strong style="color:var(--color-teal-400)">${post.author.callsign}</strong>
            </div>
          </div>
        </div>
        <span class="severity-pill ${isFlash ? 'severity-flash' : post.severity === 'PRIORITY' ? 'severity-priority' : 'severity-routine'}">
          ${post.type} • ${post.severity.replace('_', ' ')}
        </span>
      </div>

      <h3 class="post-title">${post.title}</h3>
      <p class="post-body">${post.content}</p>

      ${post.locationName ? `
        <div style="display:flex; align-items:center; gap:6px; font-size:0.78rem; color:var(--text-muted); margin-bottom:12px;">
          📍 <span>${post.locationName}</span>
        </div>
      ` : ''}

      ${post.attachments && post.attachments.length > 0 && post.attachments[0].type === 'IMAGE' ? `
        <img src="${post.attachments[0].url}" class="post-image-attachment" alt="Tactical Attachment">
      ` : ''}

      <div class="post-actions">
        <div class="reaction-group">
          <button class="btn-reaction" onclick="reactToPost('${post.id}', 'acknowledge')">
            <span>👍 10-4 Copy</span> <span>(${ackCount})</span>
          </button>
          <button class="btn-reaction" onclick="reactToPost('${post.id}', 'salute')">
            <span>🎖️ Salute</span> <span>(${saluteCount})</span>
          </button>
          <button class="btn-reaction" onclick="reactToPost('${post.id}', 'support')">
            <span>🤝 Standby</span> <span>(${supportCount})</span>
          </button>
          <button class="btn-reaction" onclick="reactToPost('${post.id}', 'critical')">
            <span>⚠️ Critical</span> <span>(${criticalCount})</span>
          </button>
        </div>
        <div>
          <button class="btn-reaction" onclick="toggleComments('${post.id}')">
            💬 Comments (${post.commentsCount || 0})
          </button>
        </div>
      </div>

      <!-- Threaded Comments -->
      <div id="comments-box-${post.id}" style="margin-top:14px; border-top:1px solid var(--border-subtle); padding-top:12px; display:none;">
        <div id="comments-list-${post.id}"></div>
        <div style="display:flex; gap:8px; margin-top:10px;">
          <input type="text" id="comment-input-${post.id}" class="form-control" placeholder="Add tactical commentary or sitrep feedback...">
          <button class="btn btn-primary" onclick="submitComment('${post.id}')">Transmit</button>
        </div>
      </div>
    </div>
  `;
}

async function reactToPost(postId, reactionType) {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/react`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
      },
      body: JSON.stringify({ reactionType })
    });
    const data = await res.json();
    if (data.success) {
      const p = state.posts.find(item => item.id === postId);
      if (p) {
        p.reactions = data.reactions;
        renderHome();
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function toggleComments(postId) {
  const box = document.getElementById(`comments-box-${postId}`);
  if (box.style.display === 'none') {
    box.style.display = 'block';
    // fetch comments
    const res = await fetch(`${API_BASE}/posts/${postId}`);
    const data = await res.json();
    const commentsList = document.getElementById(`comments-list-${postId}`);
    if (data.comments) {
      commentsList.innerHTML = data.comments.map(c => `
        <div style="font-size:0.84rem; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
          <strong style="color:var(--color-teal-400)">${c.author.name} (${c.author.callsign}):</strong> ${c.content}
        </div>
      `).join('');
    }
  } else {
    box.style.display = 'none';
  }
}

async function submitComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const content = input.value.trim();
  if (!content) return;

  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
      },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (data.success) {
      input.value = '';
      toggleComments(postId); // refresh
      showToast('Tactical commentary logged.', 'info');
    }
  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================================
   2. INCIDENT ROOMS (Google Classroom Inspired Incident Command Workflow)
   ========================================================================== */
function renderIncidents() {
  const container = document.getElementById('sectionContainer');
  const incident = state.incidents.find(i => i.id === state.activeIncidentId) || state.incidents[0];

  container.innerHTML = `
    <!-- Top Action Bar -->
    <div class="section-header">
      <div class="section-title-wrap">
        <h1>Incident Command Rooms</h1>
        <p>National Incident Management System (NIMS) & ICS coordination stream.</p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" onclick="openJoinCodeModal()">
          🔑 Join with Code
        </button>
        <button class="btn btn-primary" onclick="openCreateIncidentModal()">
          🏛️ Establish Incident Room
        </button>
      </div>
    </div>

    <!-- Active Incident Banner (Classroom Header Style) -->
    <div class="incident-banner">
      <div class="incident-banner-header">
        <div>
          <span style="font-size:0.72rem; font-weight:700; color:var(--color-orange-400); letter-spacing:1px; font-family:var(--font-mono)">
            ${incident.incidentNumber} • SEVERITY LEVEL ${incident.severityLevel}/5
          </span>
          <h2 style="font-size:1.6rem; font-weight:700; margin:4px 0;">${incident.title}</h2>
          <p style="font-size:0.9rem; opacity:0.9;">${incident.description}</p>
        </div>
        <div class="join-code-badge" onclick="copyJoinCode('${incident.joinCode}')" title="Click to copy join code">
          <span>JOIN CODE:</span>
          <strong style="color:var(--color-teal-400)">${incident.joinCode}</strong>
          <span style="font-size:0.75rem;">📋</span>
        </div>
      </div>

      <div style="display:flex; gap:20px; margin-top:14px; font-size:0.8rem; border-top:1px solid rgba(255,255,255,0.15); padding-top:10px;">
        <div>📍 <strong>Location:</strong> ${incident.location.name}</div>
        <div>⏱️ <strong>Operational Period:</strong> ${incident.operationalPeriod}</div>
        <div>🛡️ <strong>Incident Commander:</strong> ${incident.commanderName}</div>
        <div>👥 <strong>Units On Scene:</strong> ${incident.stats.totalPersonnel}</div>
      </div>
    </div>

    <!-- ICS Google Classroom Tabs -->
    <div class="ics-tab-bar">
      <div class="ics-tab ${state.activeIncidentTab === 'stream' ? 'active' : ''}" onclick="switchIncidentTab('stream')">
        📰 Stream & SITREPs
      </div>
      <div class="ics-tab ${state.activeIncidentTab === 'tasks' ? 'active' : ''}" onclick="switchIncidentTab('tasks')">
        📋 Tasks & Operations (Classwork)
      </div>
      <div class="ics-tab ${state.activeIncidentTab === 'roster' ? 'active' : ''}" onclick="switchIncidentTab('roster')">
        👥 Personnel & Units (People)
      </div>
      <div class="ics-tab ${state.activeIncidentTab === 'forms' ? 'active' : ''}" onclick="switchIncidentTab('forms')">
        📄 ICS Digital Forms
      </div>
    </div>

    <!-- Tab Dynamic Content -->
    <div id="incidentTabContent">
      ${renderIncidentTabContent(incident)}
    </div>
  `;
}

function switchIncidentTab(tab) {
  state.activeIncidentTab = tab;
  renderIncidents();
}

function renderIncidentTabContent(incident) {
  switch (state.activeIncidentTab) {
    case 'stream':
      return `
        <div style="display:grid; grid-template-columns: 280px 1fr; gap:20px;">
          <!-- Left: Incident Quick Overview Card -->
          <div>
            <div class="card">
              <h4 style="font-size:0.9rem; margin-bottom:12px;">Operational Objectives</h4>
              <ul style="font-size:0.82rem; color:var(--text-secondary); padding-left:18px; line-height:1.6;">
                <li>Perimeter containment & structural protection.</li>
                <li>Zero loss of life in Sector C.</li>
                <li>Maintain 915MHz Pager Mesh relay integrity.</li>
              </ul>
            </div>
            <div class="card">
              <h4 style="font-size:0.9rem; margin-bottom:8px;">Switch Incident Room</h4>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${state.incidents.map(i => `
                  <button class="btn btn-outline" style="justify-content:flex-start; text-align:left; font-size:0.8rem; ${i.id === incident.id ? 'border-color:var(--color-teal-500);' : ''}" onclick="setActiveIncident('${i.id}')">
                    ${i.title}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right: Room Stream -->
          <div>
            <div class="card" style="padding:14px; margin-bottom:16px;">
              <div style="display:flex; gap:10px; align-items:center;">
                <input type="text" id="streamBroadcastInput" class="form-control" placeholder="Broadcast directive to all units in this incident room...">
                <button class="btn btn-primary" onclick="broadcastToStream('${incident.id}')">Broadcast</button>
              </div>
            </div>

            <!-- Feed Posts attached to this incident -->
            ${state.posts.filter(p => p.incidentId === incident.id).map(p => renderPostCard(p)).join('')}
          </div>
        </div>
      `;

    case 'tasks':
      return `
        <div class="section-header" style="margin-bottom:16px;">
          <div>
            <h3>Operational Action Tasks (Classwork)</h3>
            <p style="font-size:0.82rem; color:var(--text-muted)">Assign, track, and complete incident objectives by ICS section.</p>
          </div>
          <button class="btn btn-primary" onclick="openCreateTaskModal('${incident.id}')">
            + Assign Tactical Task
          </button>
        </div>

        <div id="incidentTasksList">
          ${renderIncidentTasks(incident.id)}
        </div>
      `;

    case 'roster':
      return `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3>Incident Command Roster (${incident.members.length} Units)</h3>
            <button class="btn btn-outline" onclick="changeMyCheckInStatus('${incident.id}')">
              Update My Check-In Status
            </button>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            ${incident.members.map(m => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--bg-surface-elevated); border-radius:var(--radius-md); border:1px solid var(--border-subtle)">
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${m.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" class="avatar" alt="${m.name}">
                  <div>
                    <strong>${m.name}</strong> <span style="font-size:0.78rem; color:var(--color-teal-400)">(${m.callsign})</span>
                    <div style="font-size:0.75rem; color:var(--text-muted)">${m.organizationName} • Badge: ${m.badgeNumber}</div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:14px;">
                  <span class="status-pill status-mesh">${m.icsRole.replace('_', ' ')}</span>
                  <span class="status-pill ${m.checkInStatus === 'ON_SCENE' ? 'status-online' : 'status-role'}">${m.checkInStatus.replace('_', ' ')}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'forms':
      return `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h4>ICS-201: Incident Briefing</h4>
              <span class="task-status-pill status-completed">APPROVED (v2)</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">
              Comprehensive initial briefing summary, resource allocation ledger, and map sector boundaries.
            </p>
            <button class="btn btn-outline" style="width:100%;" onclick="showToast('ICS-201 Form loaded into tactical viewer.', 'info')">
              Open ICS-201 Digital Form
            </button>
          </div>

          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h4>ICS-204: Assignment List</h4>
              <span class="task-status-pill status-completed">APPROVED (v1)</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">
              Division Charlie operational personnel assignments, safety hazards, and tactical radio channel assignments.
            </p>
            <button class="btn btn-outline" style="width:100%;" onclick="showToast('ICS-204 Form loaded into tactical viewer.', 'info')">
              Open ICS-204 Digital Form
            </button>
          </div>
        </div>
      `;
  }
}

function setActiveIncident(id) {
  state.activeIncidentId = id;
  renderIncidents();
}

function copyJoinCode(code) {
  navigator.clipboard.writeText(code);
  showToast(`Copied Join Code "${code}" to clipboard!`, 'success');
}

function renderIncidentTasks(incidentId) {
  // Demo tasks or fetched tasks
  return `
    <div class="task-item">
      <div class="task-item-header">
        <div>
          <span style="font-size:0.75rem; font-weight:700; color:var(--color-teal-400); font-family:var(--font-mono)">OPERATIONS SECTION</span>
          <h4 style="font-size:1.05rem; font-weight:600; margin-top:2px;">Deploy Dozer Line & Firebreak along Ridge Road</h4>
        </div>
        <span class="task-status-pill status-in_progress">IN PROGRESS</span>
      </div>
      <p style="font-size:0.86rem; color:var(--text-secondary)">
        Cut 30-foot mineral soil firebreak between coordinates 39.7392,-104.9903 and Elk Creek drainage.
      </p>

      <ul class="task-checklist">
        <li class="task-check-row">
          <input type="checkbox" checked disabled>
          <span>Scout terrain gradient with drone thermal scan</span>
        </li>
        <li class="task-check-row">
          <input type="checkbox" checked disabled>
          <span>Establish safety escape routes and safety zone Alpha</span>
        </li>
        <li class="task-check-row">
          <input type="checkbox" onchange="toggleTaskStep(this)">
          <span>Engage heavy dozers 1 and 2 in tandem scraping</span>
        </li>
        <li class="task-check-row">
          <input type="checkbox" onchange="toggleTaskStep(this)">
          <span>Lay hose lines for water defense along mineral soil boundary</span>
        </li>
      </ul>
    </div>

    <div class="task-item">
      <div class="task-item-header">
        <div>
          <span style="font-size:0.75rem; font-weight:700; color:var(--color-teal-400); font-family:var(--font-mono)">SAFETY SECTION</span>
          <h4 style="font-size:1.05rem; font-weight:600; margin-top:2px;">Establish Secondary Casualty Collection Point (CCP-2)</h4>
        </div>
        <span class="task-status-pill status-completed">COMPLETED</span>
      </div>
      <p style="font-size:0.86rem; color:var(--text-secondary)">
        Set up illuminated triage station at Ridge View Elementary School parking lot. 20 litter stanchions active.
      </p>
    </div>
  `;
}

function toggleTaskStep(checkbox) {
  showToast(checkbox.checked ? 'Checklist step marked COMPLETED' : 'Checklist step reopened', 'info');
}

/* ==========================================================================
   3. TWO-WAY PAGER DEVICES & HARDWARE SIMULATOR
   ========================================================================== */
function renderPagers() {
  const container = document.getElementById('sectionContainer');
  const selectedPager = state.selectedPagerForSimulator || state.pagers[0];

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title-wrap">
        <h1>Two-Way Emergency Pager Network</h1>
        <p>Direct hardware telemetry, 915MHz LoRa mesh relay, and interactive pager device console.</p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" onclick="openRegisterPagerModal()">
          + Register Hardware Pager
        </button>
        <button class="btn btn-primary" onclick="openDispatchPagerModal()">
          📟 Transmit Pager Alert
        </button>
      </div>
    </div>

    <div class="pager-grid">
      <!-- Left: Devices List & Live Telemetry Dashboard -->
      <div>
        <h3 style="font-size:1.1rem; margin-bottom:14px;">Registered Tactical Pagers (${state.pagers.length})</h3>

        <div id="pagersDeviceList">
          ${state.pagers.map(p => `
            <div class="pager-device-card ${selectedPager && selectedPager.id === p.id ? 'active' : ''}" style="${selectedPager && selectedPager.id === p.id ? 'border-color:var(--color-teal-500);' : ''}" onclick="selectPagerForSimulator('${p.id}')">
              <div style="display:flex; align-items:center; gap:14px;">
                <div style="font-size:1.8rem;">📟</div>
                <div>
                  <h4 style="font-size:0.95rem; font-weight:600;">${p.name}</h4>
                  <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">
                    CAPCODE: ${p.capCode} • ${p.assignedUserName}
                  </div>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:16px; font-size:0.8rem; font-family:var(--font-mono)">
                <div id="telemetry-battery-${p.id}">
                  🔋 ${p.batteryPercentage}%
                </div>
                <div id="telemetry-signal-${p.id}">
                  📶 ${p.signalDbm} dBm
                </div>
                <div>
                  <span class="status-pill ${p.status === 'ONLINE' ? 'status-online' : 'status-role'}">${p.networkMode}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Recent Outbound & Inbound Pager Alerts -->
        <h3 style="font-size:1.1rem; margin-top:24px; margin-bottom:14px;">Two-Way Pager Dispatch Log</h3>
        <div class="card" style="padding:14px;">
          ${state.alerts.map(a => `
            <div style="padding:10px 0; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
              <div>
                <span class="severity-pill ${a.priority === 'P1_FLASH_SOS' ? 'severity-flash' : 'severity-priority'}">${a.priority}</span>
                <strong style="margin-left:8px;">${a.message}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:3px;">
                  Sent: ${new Date(a.createdAt).toLocaleTimeString()} by ${a.senderName}
                </div>
              </div>
              <div>
                ${a.status === 'ACKNOWLEDGED' ? `
                  <span class="task-status-pill status-completed">
                    ACK: ${a.acknowledgement?.response} (${a.acknowledgement?.responderName})
                  </span>
                ` : `
                  <span class="task-status-pill status-in_progress">AWAITING 10-4 ACK</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right: Interactive Physical Handheld Pager Simulator -->
      <div>
        <div style="position:sticky; top:80px;">
          <h3 style="font-size:1.1rem; margin-bottom:14px;">Hardware Pager Simulator</h3>
          
          <div class="pager-hardware-box" id="hardwarePagerDevice">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:0.75rem; color:#94a3b8; font-family:var(--font-mono);">
              <span>RESQLINK MARK III</span>
              <span>AES-256 ENCRYPTED</span>
            </div>

            <!-- Green Backlit LCD Screen -->
            <div class="pager-screen-bezel">
              <div class="pager-screen-header">
                <span id="pagerScreenCap">${selectedPager.capCode}</span>
                <span id="pagerScreenMode">${selectedPager.networkMode}</span>
                <span id="pagerScreenBat">${selectedPager.batteryPercentage}%</span>
              </div>
              <div class="pager-screen-content" id="pagerScreenMessage">
                ${state.alerts.length > 0 ? state.alerts[0].message : 'READY FOR EMERGENCY DISPATCH. 915MHz MESH NOMINAL.'}
              </div>
            </div>

            <div style="font-size:0.75rem; text-align:center; color:#64748b; font-family:var(--font-mono); margin-bottom:8px;">
              TWO-WAY RESPONDER TACTILE BUTTONS
            </div>

            <!-- Physical Tactile Hardware Buttons -->
            <div class="pager-physical-buttons">
              <button class="pager-tactile-btn" onclick="pagerAcknowledge('ACK_10_4')">
                [1] 10-4 COPY
              </button>
              <button class="pager-tactile-btn" onclick="pagerAcknowledge('EN_ROUTE')">
                [2] EN ROUTE
              </button>
              <button class="pager-tactile-btn" onclick="pagerAcknowledge('ON_SCENE')">
                [3] ON SCENE
              </button>
              <button class="pager-tactile-btn" onclick="pagerAcknowledge('UNABLE_10_7')">
                [4] 10-7 CANNOT
              </button>
              <button class="pager-tactile-btn btn-sos" onclick="pagerAcknowledge('MAN_DOWN_SOS')">
                🚨 SOS MAN-DOWN DISTRESS
              </button>
            </div>

            <!-- Hardware Telemetry Simulation Controls -->
            <div style="margin-top:20px; border-top:1px solid #233446; padding-top:14px;">
              <div style="font-size:0.72rem; color:#94a3b8; font-family:var(--font-mono); margin-bottom:8px;">
                SIMULATE TELEMETRY SENSORS:
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <label style="font-size:0.75rem; display:flex; justify-content:space-between;">
                  <span>Battery Drain (%):</span>
                  <input type="range" min="5" max="100" value="${selectedPager.batteryPercentage}" style="width:140px;" onchange="simulateBatteryChange(this.value)">
                </label>
                <label style="font-size:0.75rem; display:flex; justify-content:space-between;">
                  <span>Signal (RSSI dBm):</span>
                  <input type="range" min="-120" max="-45" value="${selectedPager.signalDbm}" style="width:140px;" onchange="simulateSignalChange(this.value)">
                </label>
                <button class="btn btn-outline" style="width:100%; font-size:0.75rem; padding:6px; color:#fff;" onclick="simulateDeadmanTrigger()">
                  Trigger Dead-Man Motion Timeout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function selectPagerForSimulator(id) {
  const p = state.pagers.find(item => item.id === id);
  if (p) {
    state.selectedPagerForSimulator = p;
    renderPagers();
  }
}

function updatePagerSimulatorScreen(alert) {
  const msgEl = document.getElementById('pagerScreenMessage');
  if (msgEl) {
    msgEl.textContent = `ALERT: ${alert.message}`;
    // Flash backlight effect
    const bezel = document.querySelector('.pager-screen-bezel');
    if (bezel) {
      bezel.style.backgroundColor = alert.priority === 'P1_FLASH_SOS' ? '#450a0a' : '#064e3b';
      setTimeout(() => {
        bezel.style.backgroundColor = '#1f3028';
      }, 1500);
    }
  }
}

async function pagerAcknowledge(code) {
  const currentPager = state.selectedPagerForSimulator || state.pagers[0];
  const latestAlert = state.alerts[0];

  playTone('click');

  try {
    const res = await fetch(`${API_BASE}/pager/alerts/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alertId: latestAlert ? latestAlert.id : 'alt-flash-01',
        responseCode: code,
        responderName: `${currentPager.assignedUserName} (${currentPager.capCode})`,
        lat: currentPager.gpsCoordinates.lat,
        lng: currentPager.gpsCoordinates.lng
      })
    });
    const data = await res.json();
    if (data.success) {
      const msgEl = document.getElementById('pagerScreenMessage');
      if (msgEl) {
        msgEl.textContent = `ACK SENT: [${code}] CONFIRMED BY COMMAND SERVER.`;
      }
      showToast(`Pager Transmitted: ${code}`, 'success');
      loadInitialData();
    }
  } catch (err) {
    console.error(err);
  }
}

async function simulateBatteryChange(val) {
  const currentPager = state.selectedPagerForSimulator || state.pagers[0];
  await fetch(`${API_BASE}/pager/devices/${currentPager.id}/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batteryPercentage: val })
  });
  currentPager.batteryPercentage = val;
  const batEl = document.getElementById('pagerScreenBat');
  if (batEl) batEl.textContent = `${val}%`;
}

async function simulateSignalChange(val) {
  const currentPager = state.selectedPagerForSimulator || state.pagers[0];
  await fetch(`${API_BASE}/pager/devices/${currentPager.id}/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signalDbm: val })
  });
  currentPager.signalDbm = val;
}

async function simulateDeadmanTrigger() {
  const currentPager = state.selectedPagerForSimulator || state.pagers[0];
  await fetch(`${API_BASE}/pager/devices/${currentPager.id}/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motionStatus: 'MAN_DOWN_ALERT' })
  });
  showToast('🚨 SIMULATED: Responder stationary > 180s. Man-down alarm sent to all terminals.', 'sos');
}

function updateTelemetryIndicators(deviceId, dev) {
  const bat = document.getElementById(`telemetry-battery-${deviceId}`);
  if (bat) bat.innerHTML = `🔋 ${dev.batteryPercentage}%`;
  const sig = document.getElementById(`telemetry-signal-${deviceId}`);
  if (sig) sig.innerHTML = `📶 ${dev.signalDbm} dBm`;
}

/* ==========================================================================
   4. TACTICAL MESSAGING (Encrypted Responder Comms)
   ========================================================================== */
function renderMessages() {
  const container = document.getElementById('sectionContainer');
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title-wrap">
        <h1>Tactical Comms Channels</h1>
        <p>End-to-end coordinated encrypted channels for multi-agency strike teams.</p>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 260px 1fr; gap:20px;">
      <!-- Channels List -->
      <div class="card" style="padding:14px;">
        <h4 style="font-size:0.85rem; margin-bottom:10px; color:var(--text-muted)">TACTICAL FREQUENCIES</h4>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div class="nav-item active" style="font-size:0.82rem;">📡 COMMAND_TACTICAL</div>
          <div class="nav-item" style="font-size:0.82rem;">🚑 MEDICAL_TRIAGE</div>
          <div class="nav-item" style="font-size:0.82rem;">🚒 OPS_LOGISTICS</div>
          <div class="nav-item" style="font-size:0.82rem;">🚁 AIR_SUPPORT_RECON</div>
        </div>
      </div>

      <!-- Messages Window -->
      <div class="card" style="display:flex; flex-direction:column; height:500px; padding:0; overflow:hidden;">
        <div style="padding:14px 20px; border-bottom:1px solid var(--border-subtle); background:var(--bg-surface-elevated); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>CHANNEL: COMMAND_TACTICAL</strong>
            <div style="font-size:0.75rem; color:var(--text-muted)">Pine Ridge Incident Unified Comms • 5 Units Enrolled</div>
          </div>
          <span class="status-pill status-online">ENCRYPTED</span>
        </div>

        <!-- Chat Stream -->
        <div id="chatMessagesStream" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:0.85rem; background:var(--bg-surface-elevated); padding:10px 14px; border-radius:var(--radius-md); max-width:80%;">
            <strong style="color:var(--color-teal-400)">Capt. Sarah Jenkins (Apex-Command):</strong>
            <div>All units check in on this channel. Atmospheric humidity dropped to 14%. Keep eyes on crowns.</div>
          </div>
          <div style="font-size:0.85rem; background:var(--bg-surface-elevated); padding:10px 14px; border-radius:var(--radius-md); max-width:80%;">
            <strong style="color:var(--color-teal-400)">Elena Rostova (K9-Tracker):</strong>
            <div>K9 Strike team has finished sweeping cabin row 14. 6 civilians cleared and transported to Staging.</div>
          </div>
        </div>

        <!-- Message Input Bar -->
        <div style="padding:14px; border-top:1px solid var(--border-subtle); display:flex; gap:10px; background:var(--bg-surface-elevated);">
          <input type="text" id="tacticalChatInput" class="form-control" placeholder="Type tactical message or dispatch report...">
          <button class="btn btn-primary" onclick="sendTacticalMessage()">Transmit</button>
        </div>
      </div>
    </div>
  `;
}

function sendTacticalMessage() {
  const input = document.getElementById('tacticalChatInput');
  const txt = input.value.trim();
  if (!txt) return;

  const stream = document.getElementById('chatMessagesStream');
  const msgEl = document.createElement('div');
  msgEl.style = "font-size:0.85rem; background:var(--color-teal-soft); border:1px solid var(--color-teal-500); padding:10px 14px; border-radius:var(--radius-md); max-width:80%; margin-left:auto;";
  msgEl.innerHTML = `<strong style="color:var(--color-teal-400)">${state.currentUser.firstName} (${state.currentUser.callsign}):</strong><div>${txt}</div>`;
  stream.appendChild(msgEl);
  stream.scrollTop = stream.scrollHeight;
  input.value = '';

  if (state.socket) {
    state.socket.emit('chat:send', {
      channelKey: 'COMMAND_TACTICAL',
      message: {
        senderName: state.currentUser.firstName,
        senderCallsign: state.currentUser.callsign,
        content: txt
      }
    });
  }
}

/* ==========================================================================
   5. RESPONDER NETWORK DIRECTORY
   ========================================================================== */
async function renderNetwork() {
  const container = document.getElementById('sectionContainer');
  const res = await fetch(`${API_BASE}/auth/responders`);
  const data = await res.json();
  const responders = data.responders || [];

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title-wrap">
        <h1>Responder Network & Verified Agencies</h1>
        <p>Unified directory of emergency personnel, certified volunteers, and specialized strike units.</p>
      </div>
      <div>
        <input type="text" class="form-control" placeholder="Search by name, callsign, or badge..." style="width:280px;" oninput="filterResponders(this.value)">
      </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:18px;">
      ${responders.map(u => `
        <div class="card" style="margin-bottom:0;">
          <div style="display:flex; gap:14px; align-items:flex-start;">
            <img src="${u.avatarUrl}" class="avatar" style="width:52px; height:52px;" alt="${u.firstName}">
            <div style="flex:1;">
              <h4 style="font-size:1.05rem; font-weight:600;">
                ${u.firstName} ${u.lastName}
                ${u.organization.isVerified ? '<span class="verified-icon" title="Verified Professional">🛡️</span>' : ''}
              </h4>
              <div style="font-size:0.78rem; color:var(--color-teal-400); font-family:var(--font-mono); font-weight:600;">
                CALLSIGN: ${u.callsign} • BADGE: ${u.badgeNumber}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                ${u.rank} • ${u.organization.name}
              </div>
            </div>
          </div>

          <div style="margin-top:12px; display:flex; gap:6px; flex-wrap:wrap;">
            ${(u.skills || []).slice(0, 3).map(s => `
              <span style="font-size:0.7rem; background:var(--badge-bg); padding:3px 8px; border-radius:var(--radius-sm);">${s}</span>
            `).join('')}
          </div>

          <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
            <span class="status-pill ${u.availability === 'ON_DUTY' ? 'status-online' : 'status-role'}">${u.availability.replace('_', ' ')}</span>
            <button class="btn btn-outline" style="font-size:0.75rem; padding:4px 10px;" onclick="showToast('Tactical connection request sent to ${u.firstName}.', 'success')">
              Connect
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ==========================================================================
   6. NOTIFICATIONS CENTER
   ========================================================================== */
function renderNotifications() {
  const container = document.getElementById('sectionContainer');
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title-wrap">
        <h1>Tactical Notifications</h1>
        <p>Operational alerts, pager acknowledgements, and command directives.</p>
      </div>
    </div>

    <div class="card" style="padding:0; overflow:hidden;">
      ${state.notifications.map(n => `
        <div style="padding:16px 20px; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; font-size:0.92rem; color:${n.type === 'PAGER_ALERT' ? 'var(--color-orange-400)' : 'var(--text-primary)'}">${n.title}</div>
            <div style="font-size:0.84rem; color:var(--text-secondary); margin-top:2px;">${n.body}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${new Date(n.createdAt).toLocaleTimeString()}</div>
          </div>
          <div>
            <button class="btn btn-outline" style="font-size:0.75rem; padding:4px 10px;" onclick="markNotificationRead('${n.id}')">
              Dismiss
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function markNotificationRead(id) {
  state.notifications = state.notifications.filter(n => n.id !== id);
  renderNotifications();
}

/* ==========================================================================
   7. PROFILE & CREDENTIALS
   ========================================================================== */
function renderProfile() {
  const container = document.getElementById('sectionContainer');
  const u = state.currentUser;

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title-wrap">
        <h1>Responder Profile & Verified Credentials</h1>
        <p>Personnel qualification records, FEMA ICS certifications, and active readiness status.</p>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 320px 1fr; gap:24px;">
      <!-- Profile Card -->
      <div class="card" style="text-align:center;">
        <img src="${u.avatarUrl}" class="avatar" style="width:100px; height:100px; margin:0 auto 14px auto;" alt="${u.firstName}">
        <h3 style="font-size:1.25rem;">${u.firstName} ${u.lastName} 🛡️</h3>
        <div style="color:var(--color-teal-400); font-family:var(--font-mono); font-size:0.85rem; font-weight:700;">
          CALLSIGN: ${u.callsign}
        </div>
        <div style="color:var(--text-muted); font-size:0.8rem; margin-top:4px;">
          ${u.rank} • Badge: ${u.badgeNumber}
        </div>
        <div style="color:var(--text-secondary); font-size:0.85rem; margin-top:8px;">
          ${u.organization.name}
        </div>

        <div style="margin-top:18px; padding-top:16px; border-top:1px solid var(--border-subtle);">
          <label style="font-size:0.78rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:8px;">
            CHANGE ACTIVE READINESS STATUS:
          </label>
          <select class="form-control" onchange="updateMyAvailability(this.value)">
            <option value="ON_DUTY" ${u.availability === 'ON_DUTY' ? 'selected' : ''}>🟢 ON-DUTY (Active Response)</option>
            <option value="STANDBY" ${u.availability === 'STANDBY' ? 'selected' : ''}>🟡 STANDBY (Mobilization Ready)</option>
            <option value="DEPLOYED" ${u.availability === 'DEPLOYED' ? 'selected' : ''}>🟠 DEPLOYED (In Field Ops)</option>
            <option value="OFF_DUTY" ${u.availability === 'OFF_DUTY' ? 'selected' : ''}>⚪ OFF-DUTY</option>
          </select>
        </div>
      </div>

      <!-- Credentials & Skills -->
      <div>
        <div class="card">
          <h3 style="font-size:1.1rem; margin-bottom:14px;">National Verified Certifications</h3>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${(u.certifications || []).map(c => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg-surface-elevated); border-radius:var(--radius-md); border:1px solid var(--border-subtle)">
                <div>
                  <strong>${c.name}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted)">Issuer: ${c.issuer} • Valid through: ${c.expiresDate}</div>
                </div>
                <span class="status-pill status-online">VERIFIED</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <h3 style="font-size:1.1rem; margin-bottom:14px;">Operational Capabilities</h3>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${(u.skills || []).map(s => `
              <span class="status-pill status-mesh" style="font-size:0.8rem; padding:6px 12px;">${s}</span>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

async function updateMyAvailability(val) {
  await fetch(`${API_BASE}/auth/availability`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.token}`
    },
    body: JSON.stringify({ availability: val })
  });
  state.currentUser.availability = val;
  showToast(`Readiness status switched to: ${val}`, 'info');
}

/* ==========================================================================
   MODALS IMPLEMENTATION (Join Code, Post, Dispatch, Incident)
   ========================================================================== */
function openModal(title, bodyHtml) {
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <div class="modal-header">
      <h3 style="font-size:1.15rem; font-weight:700;">${title}</h3>
      <button class="btn btn-outline" style="padding:4px 8px;" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${bodyHtml}
    </div>
  `;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function openJoinCodeModal() {
  openModal('Join Incident Room via 6-Character Code', `
    <div class="form-group">
      <label>INCIDENT JOIN CODE (e.g., FIRE91 or MCI101):</label>
      <input type="text" id="modalJoinCodeInput" class="form-control" placeholder="ENTER 6-DIGIT CODE" maxlength="6" style="text-transform:uppercase; font-family:var(--font-mono); font-size:1.2rem; letter-spacing:2px; text-align:center;">
    </div>
    <div class="form-group">
      <label>ASSIGNED ICS ROLE UPON CHECK-IN:</label>
      <select id="modalIcsRoleInput" class="form-control">
        <option value="FIELD_RESPONDER">Field Responder</option>
        <option value="STRIKE_TEAM_LEADER">Strike Team Leader</option>
        <option value="OPS_CHIEF">Operations Section Chief</option>
        <option value="SAFETY_OFFICER">Safety Officer</option>
      </select>
    </div>
    <button class="btn btn-primary" style="width:100%; margin-top:10px;" onclick="submitJoinCode()">
      Check-In & Join Incident Room
    </button>
  `);
}

async function submitJoinCode() {
  const code = document.getElementById('modalJoinCodeInput').value.trim().toUpperCase();
  const role = document.getElementById('modalIcsRoleInput').value;

  if (!code) return;

  try {
    const res = await fetch(`${API_BASE}/incidents/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
      },
      body: JSON.stringify({ joinCode: code, icsRole: role })
    });
    const data = await res.json();
    if (data.success) {
      closeModal();
      showToast(data.message, 'success');
      state.activeIncidentId = data.incident.id;
      await loadInitialData();
      renderIncidents();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

function openCreatePostModal() {
  openModal('Publish SITREP / Field Update', `
    <div class="form-group">
      <label>POST TYPE:</label>
      <select id="modalPostType" class="form-control">
        <option value="SITREP">🚨 Situation Report (SITREP)</option>
        <option value="TRAINING">🎯 Training & Tactical Drill</option>
        <option value="EQUIPMENT">📟 Pager & Mesh Comms Brief</option>
        <option value="SAFETY_BULLETIN">⚠️ Safety Bulletin</option>
      </select>
    </div>
    <div class="form-group">
      <label>SEVERITY LEVEL:</label>
      <select id="modalPostSeverity" class="form-control">
        <option value="ROUTINE">Routine</option>
        <option value="PRIORITY">Priority</option>
        <option value="FLASH_EMERGENCY">FLASH Emergency Order</option>
      </select>
    </div>
    <div class="form-group">
      <label>SITREP TITLE:</label>
      <input type="text" id="modalPostTitle" class="form-control" placeholder="e.g. Sector 4 Defensive Line Update...">
    </div>
    <div class="form-group">
      <label>SITREP CONTENT / DIRECTIVE:</label>
      <textarea id="modalPostContent" class="form-control" placeholder="Provide accurate field situation data, winds, triage counts, and safety perimeter..."></textarea>
    </div>
    <div class="form-group">
      <label>SECTOR / LOCATION NAME:</label>
      <input type="text" id="modalPostLocation" class="form-control" placeholder="e.g. Pine Ridge Foothills Sector C">
    </div>
    <button class="btn btn-primary" style="width:100%; margin-top:10px;" onclick="submitCreatePost()">
      Transmit SITREP to Network
    </button>
  `);
}

async function submitCreatePost() {
  const type = document.getElementById('modalPostType').value;
  const severity = document.getElementById('modalPostSeverity').value;
  const title = document.getElementById('modalPostTitle').value.trim();
  const content = document.getElementById('modalPostContent').value.trim();
  const locationName = document.getElementById('modalPostLocation').value.trim();

  if (!title || !content) {
    alert('Title and content are required.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
      },
      body: JSON.stringify({
        type, severity, title, content, locationName,
        incidentId: state.activeIncidentId
      })
    });
    const data = await res.json();
    if (data.success) {
      closeModal();
      showToast('SITREP published across network.', 'success');
      state.posts.unshift(data.post);
      renderHome();
    }
  } catch (err) {
    console.error(err);
  }
}

function openDispatchPagerModal() {
  openModal('Transmit Two-Way Emergency Pager Alert', `
    <div class="form-group">
      <label>TARGET BROADCAST TYPE:</label>
      <select id="modalPagerTargetType" class="form-control">
        <option value="INCIDENT_BROADCAST">Incident Room Broadcast (All Assigned Units)</option>
        <option value="ALL_STATION_SOS">🚨 ALL-STATION FLASH SOS</option>
        <option value="DIRECT_DEVICE">Direct Pager CapCode</option>
      </select>
    </div>
    <div class="form-group">
      <label>ALERT PRIORITY:</label>
      <select id="modalPagerPriority" class="form-control">
        <option value="P1_FLASH_SOS">P1 FLASH SOS (Highest Urgency)</option>
        <option value="P2_IMMEDIATE">P2 Immediate Dispatch</option>
        <option value="P3_PRIORITY">P3 Priority Notice</option>
        <option value="P4_ROUTINE">P4 Routine Check</option>
      </select>
    </div>
    <div class="form-group">
      <label>TACTICAL ALPHANUMERIC MESSAGE (MAX 160 CHARS):</label>
      <textarea id="modalPagerMessage" class="form-control" maxlength="160" placeholder="e.g. FLASH EVACUATION: Sector 4 Ridge cabins. Fall back to Anchor Point Alpha immediately."></textarea>
    </div>
    <button class="btn btn-emergency-sos" style="width:100%; margin-top:10px;" onclick="submitPagerAlert()">
      ⚡ Transmit Pager Page
    </button>
  `);
}

async function submitPagerAlert() {
  const targetType = document.getElementById('modalPagerTargetType').value;
  const priority = document.getElementById('modalPagerPriority').value;
  const message = document.getElementById('modalPagerMessage').value.trim();

  if (!message) return;

  try {
    const res = await fetch(`${API_BASE}/pager/alerts/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
      },
      body: JSON.stringify({
        targetType,
        priority,
        message,
        incidentId: state.activeIncidentId
      })
    });
    const data = await res.json();
    if (data.success) {
      closeModal();
      showToast('Two-way pager alert transmitted via 915MHz Mesh & LTE-M.', 'success');
      playTone('pager');
      state.alerts.unshift(data.alert);
      if (state.activeSection === 'pagers') renderPagers();
    }
  } catch (err) {
    console.error(err);
  }
}

function openGlobalSosModal() {
  openModal('🚨 ALL-STATION EMERGENCY SOS BEACON', `
    <div style="background:var(--color-red-soft); border:1px solid var(--color-red-500); padding:14px; border-radius:var(--radius-md); margin-bottom:14px;">
      <h4 style="color:var(--color-red-500);">CONFIRM IMMEDIATE RESCUE / DURESS ALARM</h4>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
        Triggering this beacon broadcasts an audible siren and GPS telemetry to all nearby units, dispatch terminals, and emergency pagers.
      </p>
    </div>
    <div class="form-group">
      <label>SOS EMERGENCY MESSAGE:</label>
      <input type="text" id="globalSosMsg" class="form-control" value="URGENT MAYDAY: Responder duress alarm. Coords [39.7392,-104.9903]. Immediate backup required.">
    </div>
    <button class="btn btn-emergency-sos" style="width:100%; padding:14px; font-size:1rem;" onclick="triggerGlobalSosConfirmed()">
      🚨 BROADCAST IMMEDIATE MAYDAY
    </button>
  `);
}

async function triggerGlobalSosConfirmed() {
  const msg = document.getElementById('globalSosMsg').value;
  closeModal();
  await fetch(`${API_BASE}/pager/alerts/dispatch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.token}`
    },
    body: JSON.stringify({
      targetType: 'ALL_STATION_SOS',
      priority: 'P1_FLASH_SOS',
      message: msg
    })
  });
  showToast('🚨 MAYDAY SOS BROADCAST ACTIVE ACROSS ALL BANDS', 'sos');
}

/* ==========================================================================
   TOASTS & AUDIO FEEDBACK
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'sos' ? 'toast-sos' : ''}`;
  toast.innerHTML = `
    <span>${type === 'sos' ? '🚨' : type === 'success' ? '✅' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4500);
}

// Audio Chime Synthesizer using Web Audio API (Zero external audio file dependencies!)
function playTone(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'pager') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'alarm') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    }
  } catch (e) {
    // Audio context not allowed prior to interaction
  }
}

// Start App
window.addEventListener('DOMContentLoaded', initApp);

