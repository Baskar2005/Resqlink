import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          // Profile Header Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundImage: NetworkImage('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200'),
                  ),
                  const SizedBox(height: 10),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Sarah Jenkins', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                      SizedBox(width: 4),
                      Icon(Icons.verified, color: AppColors.teal400, size: 16),
                    ],
                  ),
                  const Text('CALLSIGN: Apex-Command • BADGE: IC-9402', style: TextStyle(fontSize: 11, color: AppColors.teal400, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Battalion Chief • Metro Fire & Rescue Authority', style: TextStyle(fontSize: 12, color: AppColors.slate300)),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.greenSoft,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text('🟢 ON-DUTY (ACTIVE INCIDENT COMMAND)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.green500)),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 14),
          const Text('Verified Federal & State Certifications', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),

          _buildCertCard('FEMA ICS-400 Advanced Incident Command', 'DHS / FEMA • Valid thru 2027'),
          _buildCertCard('National Incident Management System (NIMS)', 'USFA • Valid thru 2026'),
          _buildCertCard('Urban Search & Rescue Incident Commander', 'State Fire Marshal • Valid thru 2028'),

          const SizedBox(height: 14),
          const Text('Paired Two-Way Hardware Pager', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),

          Card(
            child: ListTile(
              leading: const Icon(Icons.speaker_phone, color: AppColors.teal400),
              title: const Text('Alpha-1 Commander Pager', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('CapCode: CAP-104921 • Model: Mark III', style: TextStyle(fontSize: 11, color: AppColors.slate400)),
              trailing: const Text('ONLINE 94%', style: TextStyle(fontSize: 11, color: AppColors.green500, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCertCard(String title, String subtitle) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.military_tech, color: AppColors.orange400),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
        trailing: const Icon(Icons.check_circle, color: AppColors.teal400, size: 16),
      ),
    );
  }
}

