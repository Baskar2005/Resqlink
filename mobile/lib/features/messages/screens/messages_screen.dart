import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({Key? key}) : super(key: key);

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final TextEditingController _msgCtrl = TextEditingController();
  final List<Map<String, String>> _messages = [
    {
      'sender': 'Capt. Sarah Jenkins',
      'callsign': 'Apex-Command',
      'text': 'All units check in on this tactical frequency. Atmospheric humidity dropped to 14%.',
      'time': '10:14 AM'
    },
    {
      'sender': 'Elena Rostova',
      'callsign': 'K9-Tracker',
      'text': 'K9 Strike team cleared cabin row 14. 6 civilians safely evacuated to Staging Area Alpha.',
      'time': '10:22 AM'
    },
    {
      'sender': 'Dr. Marcus Vance',
      'callsign': 'Medic-Lead',
      'text': 'Casualty Collection Point 2 operational with high-flow oxygen manifolds.',
      'time': '10:35 AM'
    },
  ];

  void _send() {
    final txt = _msgCtrl.text.trim();
    if (txt.isNotEmpty) {
      setState(() {
        _messages.add({
          'sender': 'Sarah Jenkins',
          'callsign': 'Apex-Command',
          'text': txt,
          'time': 'Now'
        });
        _msgCtrl.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('COMMAND_TACTICAL', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            Text('Pine Ridge Incident Unified Comms', style: TextStyle(fontSize: 10, color: AppColors.slate400)),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final m = _messages[idx];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.navy800,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.navy600),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('${m['sender']} (${m['callsign']})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.teal400)),
                            Text(m['time']!, style: const TextStyle(fontSize: 10, color: AppColors.slate400)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(m['text']!, style: const TextStyle(fontSize: 13, color: AppColors.slate200)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            color: AppColors.navy800,
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgCtrl,
                      decoration: const InputDecoration(
                        hintText: 'Transmit tactical message...',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.send, color: AppColors.teal400),
                    onPressed: _send,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

