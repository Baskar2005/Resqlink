# 🚨 ResQLink

### Full-Stack Emergency Responder Social Network, Incident Coordination Platform & Two-Way Pager Ecosystem

> **Live Deployment for Judges:** [https://baskar2005.github.io/Resqlink/](https://baskar2005.github.io/Resqlink/)  
> **Tactical API Documentation (Swagger):** `http://localhost:4000/api/docs`  
> **GitHub Repository:** [https://github.com/Baskar2005/Resqlink](https://github.com/Baskar2005/Resqlink)

---

## 🎖️ Executive Summary for Hackathon Judges

In critical disaster scenarios (wildfires, structural collapses, floods, mass casualty incidents), emergency response fails when **communication becomes fragmented**. Responders juggle fragmented WhatsApp groups, disparate CAD dispatch terminals, disconnected radio frequencies, and uncoordinated volunteer teams. When cellular towers fail or are overwhelmed, field personnel are left isolated.

**ResQLink** solves this with a **unified three-tier tactical ecosystem**:
1. **ResQLink Social Network**: Professional responder identity, verified credentials (FEMA ICS, TCCC), field SITREPs, and tactical updates.
2. **ResQLink Incident Management**: Incident Command System (ICS / NIMS) rooms, designed with the organizational workflow of **Google Classroom** (Stream, Tasks/Classwork, Roster/People, and digital ICS forms like ICS-201 and ICS-204) with instantaneous 6-character Join Codes (`FIRE91`, `MCI101`).
3. **ResQLink Pager Network**: An independent, offline-capable **Two-Way Emergency Pager Network** supporting 915MHz LoRa mesh relay, real-time hardware telemetry (battery, RSSI, GPS, dead-man motion sensor), and physical tactile button responses (`10-4 Copy`, `En Route`, `On Scene`, `10-7 Cannot`, `SOS Man-Down`).

---

## ⚡ 60-Second Guided Tour for Judges

Visit the live deployment at **[https://baskar2005.github.io/Resqlink/](https://baskar2005.github.io/Resqlink/)**:

1. **Test the Social Network & SITREPs**:
   - In the **Home Feed**, examine active field situation reports with severity badges (`FLASH_EMERGENCY`, `PRIORITY`).
   - Click **`👍 10-4 Copy`**, **`🎖️ Salute`**, or **`🤝 Standby`** to experience tactical response counters.
   - Click **`New SITREP / Post`** to broadcast a field update across all connected units.
2. **Test Incident Command Rooms (Google Classroom ICS Workflow)**:
   - Navigate to **Incident Rooms** and inspect room `INC-2026-FIRE-084` (**Pine Ridge Wildfire & Structural Defense**).
   - Click the **Stream** tab for command directives.
   - Click **Tasks & Operations** (Classwork) to check off operational milestones.
   - Click **Personnel & Units** (Roster) to view live check-in statuses (`ON_SCENE`, `EN_ROUTE`).
   - Click **ICS Digital Forms** to inspect digital **ICS-201** and **ICS-204** documentation.
   - Click **`🔑 Join with Code`** and enter `FIRE91` or `MCI101` for instantaneous unit check-in.
3. **Test the Two-Way Pager Hardware Simulator**:
   - Navigate to **Pager Devices** to see live battery and signal telemetry drift.
   - On the right side, interact with the **Handheld Tactical Pager Simulator**:
     - View the green phosphor LCD display and active frequency (`915MHz LoRa Mesh`).
     - Press the tactile physical buttons: **`[1] 10-4 COPY`**, **`[2] EN ROUTE`**, **`[3] ON SCENE`**, or **`[4] 10-7 CANNOT`**.
     - Test **`🚨 SOS MAN-DOWN DISTRESS`** or use the telemetry sliders below the pager to simulate battery drain or stationary dead-man timeout.
4. **Trigger Global Emergency SOS**:
   - Click the persistent **EMERGENCY SOS** button in the top navigation bar to broadcast an emergency Mayday beacon with simulated audio tones and responder coordinates.

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │            ResQLink Full-Stack Platform       │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  Social Network  │             │Incident Management│             │  Pager Network   │
│ • SITREPs (Flash)│             │ • Google Classroom│             │ • Two-Way Pager  │
│ • Verified Orgs  │             │   ICS Stream/Tasks│             │ • 915MHz LoRa    │
│ • Responder Ranks│             │ • 6-Char Join Code│             │ • Telemetry/RSSI │
│ • Reactions 10-4 │             │ • Digital ICS-201 │             │ • Deadman SOS    │
└──────────────────┘             └──────────────────┘             └──────────────────┘
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      Node.js / TypeScript Core Server        │
                    │   • Express REST API                         │
                    │   • Socket.IO Real-Time Gateway              │
                    │   • Pager Health & Telemetry Daemon          │
                    │   • Role-Based Security & JWT                │
                    │   • Swagger / OpenAPI Docs (/api/docs)       │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    ▼                                              ▼
         ┌──────────────────────┐                       ┌──────────────────────┐
         │ MongoDB Atlas Store  │                       │   Flutter Mobile App │
         │ (Mongoose Schemas &  │                       │ • Riverpod State     │
         │  Reactive Fallback)  │                       │ • GoRouter           │
         └──────────────────────┘                       │ • Material 3         │
                                                        └──────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Mobile Application** | Flutter 3.x, Dart 3.x, Material 3, Riverpod (State Management), GoRouter (Navigation), Dio (Network client), Flutter Secure Storage |
| **Backend & Real-Time** | Node.js (v18+), TypeScript, Express, Socket.IO (WebSockets), Multer, JWT, Bcrypt.js, Swagger/OpenAPI |
| **Database & Persistence** | MongoDB with Mongoose schema validation, compound indexes, pagination, and built-in reactive storage engine for zero-dependency field deployment |
| **Telemetry Daemon** | Background event loop monitoring device heartbeats, battery thresholds, dead-man motion sensors, and RF mesh packet delivery |
| **Web Companion / UI** | Responsive SPA with Navy/Teal/Orange palette, Web Audio API synthesizers, and Handheld Pager Simulator |
| **DevOps & Cloud** | Docker, Docker Compose, GitHub Actions CI/CD with automated GitHub Pages deployment |

---

## 🔐 Security & Engineering Integrity

1. **Role-Based Access Control (RBAC)**:
   - Server-side verification for all tactical endpoints. Client-supplied role claims are never trusted.
   - Strict hierarchy: `COMMANDER` → `OFFICER` → `PARAMEDIC` → `SPECIALIST` → `OPERATOR` → `VOLUNTEER`.
   - Incident room establishment is restricted to `COMMANDER` or `OFFICER` roles.
2. **Tactical Payload Validation & Malware Protection**:
   - Multer file uploads validate MIME types against magic bytes with file-size limits (25MB).
   - Integrated malware scanning integration point (`scanForMalware`).
3. **Offline & Air-Gapped Resiliency**:
   - The pager network operates independently of cellular connectivity via 915MHz LoRa mesh forwarding.
   - Dual-mode data persistence ensures continuous operation whether connected to MongoDB Atlas or operating locally during network blackout.

---

## 👥 Pre-Seeded Responder Roster & Credentials

| Responder | Callsign | Role | Organization | Email | Password |
|---|---|---|---|---|---|
| Capt. Sarah Jenkins | **Apex-Command** | COMMANDER | Metro Fire & Rescue Authority | `commander@resqlink.org` | `Responder2026!` |
| Dr. Marcus Vance | **Medic-Lead** | PARAMEDIC | Disaster Medical Assistance (DMAT-1) | `marcus.vance@resqlink.org` | `Responder2026!` |
| Elena Rostova | **K9-Tracker** | SPECIALIST | Cascade Mountain Search & Rescue | `elena.rostova@resqlink.org` | `Responder2026!` |
| David Kim | **Supply-Ops** | OFFICER | Emergency Relief & Civil Defense | `david.kim@resqlink.org` | `Responder2026!` |
| Chloe Bennett | **River-Scout** | VOLUNTEER | Community Emergency Response (CERT) | `chloe.bennett@resqlink.org` | `Responder2026!` |

### Incident Room Join Codes
* **Pine Ridge Wildfire & Structural Defense**: `FIRE91`
* **Metro Rail High-Speed Derailment & MCI**: `MCI101`

---

## 💻 Local Execution Guide

### 1. Run the Backend & Web Application
```bash
# Clone the repository
git clone https://github.com/Baskar2005/Resqlink.git
cd Resqlink/backend

# Install dependencies
npm install

# Start development server
npm run dev
```
* **Web Portal:** `http://localhost:4000/`
* **Swagger API Docs:** `http://localhost:4000/api/docs`

### 2. Run with Docker Compose
```bash
docker-compose up --build
```

### 3. Run the Flutter Mobile Application
```bash
cd Resqlink/mobile
flutter pub get
flutter run
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE) - Copyright (c) 2026 Baskar.G.
