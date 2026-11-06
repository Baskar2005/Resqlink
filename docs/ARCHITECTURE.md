# ResQLink System Architecture & Engineering Specification

## 1. Executive Overview

**ResQLink** is a mission-critical platform engineered for first responders, emergency medical technicians, search-and-rescue teams, and incident command staff. It unifies three major subsystems:
1. **ResQLink Social Network**: Professional responder identity, verified badges, field SITREPs, and tactical updates.
2. **ResQLink Incident Management**: Incident Command System (ICS / NIMS) rooms, Google Classroom-inspired organizational structure (Stream, Tasks/Classwork, Roster/People, ICS Forms), join codes (`FIRE91`), and task checklist coordination.
3. **ResQLink Pager Network**: Two-Way emergency pager pairing, real-time hardware telemetry (battery, RSSI dBm, GPS coordinates, LTE-M / LoRa mesh / VHF mode), outbound alphanumeric dispatch, and physical tactile button responses (`10-4 Copy`, `En Route`, `On Scene`, `10-7 Cannot`, `SOS Man-Down`).

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
│ • Responder Ranks│             │ • 6-Char Join Code│             │ • Telemetry / RSSI│
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

## 2. Security & Cyber Architecture

- **Server-Side Role Verification**: Client-provided role values are strictly disregarded. Roles (`COMMANDER`, `OFFICER`, `PARAMEDIC`, `SPECIALIST`, `OPERATOR`, `VOLUNTEER`) are authenticated against the database/store record.
- **Incident Role Guards**: Certain actions (e.g. establishing new ICS rooms) require `COMMANDER` or `OFFICER` roles.
- **MIME & Malware Scanning Hook**: Media uploads validate MIME types against magic bytes and pass through security screening points before file saving.
- **Encrypted Tactical Comms**: WebSocket messages and two-way pager transmissions incorporate AES-256 tactical payload encryption simulation.

## 3. Two-Way Pager Mesh Protocol & Telemetry

The two-way pager subsystem supports multiple transmission protocols:
- **Cellular LTE-M**: Primary broadband uplink.
- **LoRa 915MHz Mesh**: 14-mile non-line-of-sight packet forwarding with hop counts for wilderness/alpine SAR.
- **VHF Narrowband**: High-power tactical frequency paging.
- **Satellite Hybrid**: Emergency downlink when terrestrial nodes fail.

### Two-Way Button Matrix
- `ACK_10_4`: Acknowledged / Message understood.
- `EN_ROUTE`: Unit mobile responding to scene.
- `ON_SCENE`: Unit arrived at staging/casualty collection point.
- `UNABLE_10_7`: Out of service / Unable to respond.
- `MAN_DOWN_SOS`: High-priority distress triggered manually or via stationary motion timeout (> 180s).

