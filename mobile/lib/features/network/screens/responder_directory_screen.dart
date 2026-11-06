import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class ResponderDirectoryScreen extends StatelessWidget {
  const ResponderDirectoryScreen({Key? key}) : super(key: key);

  final List<Map<String, dynamic>> _responders = const [
    {
      'name': 'Sarah Jenkins',
      'callsign': 'Apex-Command',
      'badge': 'IC-9402',
      'rank': 'Battalion Chief',
      'org': 'Metro Fire & Rescue Authority',
      'verified': true,
      'status': 'ON_DUTY',
      'skills': ['Incident Command (ICS)', 'Crisis Strategy', 'Triage'],
      'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
    },
    {
      'name': 'Marcus Vance',
      'callsign': 'Medic-Lead',
      'badge': 'EMS-7714',
      'rank': 'Supervising Flight Paramedic',
      'org': 'Disaster Medical Assistance (DMAT-1)',
      'verified': true,
      'status': 'ON_DUTY',
      'skills': ['Trauma Life Support', 'Vascular Access', 'Field Triage'],
      'avatar': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'
    },
    {
      'name': 'Elena Rostova',
      'callsign': 'K9-Tracker',
      'badge': 'SAR-3390',
      'rank': 'Senior SAR Field Specialist',
      'org': 'Cascade Mountain SAR',
      'verified': true,
      'status': 'DEPLOYED',
      'skills': ['K9 Air Scent', 'High-Angle Rope Rescue', 'GPS Navigation'],
      'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
    },
    {
      'name': 'David Kim',
      'callsign': 'Supply-Ops',
      'badge': 'LOG-8821',
      'rank': 'Logistics Section Chief',
      'org': 'Emergency Relief & Civil Defense',
      'verified': true,
      'status': 'STANDBY',
      'skills': ['Fleet Logistics', 'Satellite Uplink', 'Resource Triage'],
      'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      'name': 'Chloe Bennett',
      'callsign': 'River-Scout',
      'badge': 'VOL-5520',
      'rank': 'Volunteer Team Lead',
      'org': 'Community Emergency Response (CERT)',
      'verified': false,
      'status': 'ON_DUTY',
      'skills': ['First Aid & CPR', 'Sandbagging', 'Radio Comms'],
      'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _responders.length,
        itemBuilder: (context, idx) {
          final r = _responders[idx];
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundImage: NetworkImage(r['avatar']),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(r['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                if (r['verified']) ...[
                                  const SizedBox(width: 4),
                                  const Icon(Icons.verified, color: AppColors.teal400, size: 14),
                                ],
                              ],
                            ),
                            Text('CALLSIGN: ${r['callsign']} • BADGE: ${r['badge']}', style: const TextStyle(fontSize: 11, color: AppColors.teal400, fontWeight: FontWeight.bold)),
                            Text('${r['rank']} • ${r['org']}', style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: (r['skills'] as List<String>)
                        .map((s) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.navy700,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(s, style: const TextStyle(fontSize: 10, color: AppColors.slate300)),
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 8),
                  const Divider(color: AppColors.navy600, height: 1),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('STATUS: ${r['status']}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.green500)),
                      TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Tactical link established with ${r['name']}.')));
                        },
                        child: const Text('Connect', style: TextStyle(fontSize: 11, color: AppColors.teal400)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

