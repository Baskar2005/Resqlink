import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  final List<Map<String, String>> _notifs = const [
    {
      'title': 'Emergency Pager Ack Received',
      'body': 'Elena Rostova (K9-Tracker) acknowledged FLASH EVACUATION ORDER (10-4).',
      'time': '24m ago',
      'type': 'PAGER_ALERT'
    },
    {
      'title': 'Task Milestone Completed',
      'body': 'Task "Establish Secondary CCP-2" marked as COMPLETED by Dr. Marcus Vance.',
      'time': '58m ago',
      'type': 'INCIDENT'
    },
    {
      'title': 'New Acknowledgment on SITREP #04',
      'body': '4 responders acknowledged your SITREP: Sector 4 Defensive Line.',
      'time': '1h ago',
      'type': 'SOCIAL'
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tactical Notifications', style: TextStyle(fontSize: 16))),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _notifs.length,
        itemBuilder: (context, idx) {
          final n = _notifs[idx];
          return Card(
            child: ListTile(
              leading: Icon(
                n['type'] == 'PAGER_ALERT' ? Icons.speaker_phone : Icons.notification_important,
                color: n['type'] == 'PAGER_ALERT' ? AppColors.orange400 : AppColors.teal400,
              ),
              title: Text(n['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: Text(n['body']!, style: const TextStyle(fontSize: 11, color: AppColors.slate300)),
              trailing: Text(n['time']!, style: const TextStyle(fontSize: 10, color: AppColors.slate400)),
            ),
          );
        },
      ),
    );
  }
}

