import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/incident_provider.dart';

class IncidentRoomsScreen extends ConsumerStatefulWidget {
  const IncidentRoomsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<IncidentRoomsScreen> createState() => _IncidentRoomsScreenState();
}

class _IncidentRoomsScreenState extends ConsumerState<IncidentRoomsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showJoinCodeDialog() {
    final codeCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.navy800,
        title: const Text('Join Incident Room', style: TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Enter 6-character room join code:', style: TextStyle(color: AppColors.slate300, fontSize: 12)),
            const SizedBox(height: 10),
            TextField(
              controller: codeCtrl,
              textCapitalization: TextCapitalization.characters,
              maxLength: 6,
              style: const TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold),
              decoration: const InputDecoration(hintText: 'e.g. FIRE91'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final code = codeCtrl.text.trim();
              if (code.isNotEmpty) {
                Navigator.pop(ctx);
                final success = await ref.read(incidentProvider.notifier).joinByCode(code, 'FIELD_RESPONDER');
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(success ? 'Joined incident room!' : 'Invalid join code.')),
                  );
                }
              }
            },
            child: const Text('Check-In'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final incidentState = ref.watch(incidentProvider);
    final incident = incidentState.selectedIncident;

    if (incident == null) {
      return const Center(child: CircularProgressIndicator(color: AppColors.teal400));
    }

    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.navy700, AppColors.navy900],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.navy600),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${incident.incidentNumber} • SEVERITY ${incident.severityLevel}/5',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.orange400, letterSpacing: 0.8),
                          ),
                          InkWell(
                            onTap: () {
                              Clipboard.setData(ClipboardData(text: incident.joinCode));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Join code ${incident.joinCode} copied!')),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: Colors.white30),
                              ),
                              child: Row(
                                children: [
                                  const Text('JOIN CODE: ', style: TextStyle(fontSize: 10, color: Colors.white70)),
                                  Text(incident.joinCode, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.teal400)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(incident.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(incident.description, style: const TextStyle(fontSize: 12, color: AppColors.slate300)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.place, size: 14, color: AppColors.slate400),
                          const SizedBox(width: 4),
                          Text(incident.locationName, style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
                          const Spacer(),
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4)),
                            onPressed: _showJoinCodeDialog,
                            child: const Text('Join Room', style: TextStyle(fontSize: 11)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SliverPersistentHeader(
              pinned: true,
              delegate: _TabBarDelegate(
                TabBar(
                  controller: _tabController,
                  indicatorColor: AppColors.teal400,
                  labelColor: AppColors.teal400,
                  unselectedLabelColor: AppColors.slate400,
                  tabs: const [
                    Tab(text: 'Stream'),
                    Tab(text: 'Tasks'),
                    Tab(text: 'Roster'),
                    Tab(text: 'ICS Forms'),
                  ],
                ),
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            // 1. Stream
            ListView(
              padding: const EdgeInsets.all(12),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: const [
                        Icon(Icons.campaign, color: AppColors.orange400),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Tactical directives and situational broadcasts will appear here in real-time.',
                            style: TextStyle(fontSize: 12, color: AppColors.slate300),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // 2. Tasks (Classwork)
            ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: incidentState.tasks.length,
              itemBuilder: (context, idx) {
                final task = incidentState.tasks[idx];
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(task.section, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.teal400)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: task.status == 'COMPLETED' ? AppColors.greenSoft : AppColors.orangeSoft,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                task.status,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: task.status == 'COMPLETED' ? AppColors.green500 : AppColors.orange400,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(task.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(task.description, style: const TextStyle(fontSize: 12, color: AppColors.slate300)),
                        const SizedBox(height: 8),
                        ...task.checklist.map((c) => Row(
                              children: [
                                Checkbox(
                                  value: c.completed,
                                  activeColor: AppColors.teal500,
                                  onChanged: (val) {
                                    setState(() {
                                      c.completed = val ?? false;
                                    });
                                  },
                                ),
                                Expanded(child: Text(c.text, style: const TextStyle(fontSize: 12, color: AppColors.slate300))),
                              ],
                            )),
                      ],
                    ),
                  ),
                );
              },
            ),

            // 3. Roster (People)
            ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: incident.members.length,
              itemBuilder: (context, idx) {
                final member = incident.members[idx];
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundImage: NetworkImage(member.avatarUrl.isNotEmpty ? member.avatarUrl : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'),
                    ),
                    title: Text('${member.name} (${member.callsign})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text('Badge: ${member.badgeNumber} • ${member.icsRole.replaceAll('_', ' ')}', style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: member.checkInStatus == 'ON_SCENE' ? AppColors.greenSoft : AppColors.orangeSoft,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        member.checkInStatus.replaceAll('_', ' '),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: member.checkInStatus == 'ON_SCENE' ? AppColors.green500 : AppColors.orange400,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),

            // 4. Forms
            ListView(
              padding: const EdgeInsets.all(12),
              children: [
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.description, color: AppColors.teal400),
                    title: const Text('ICS-201: Incident Briefing', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: const Text('Approved v2 • Operational Objectives & Map', style: TextStyle(fontSize: 11)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('ICS-201 loaded in digital viewer.')));
                    },
                  ),
                ),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.description, color: AppColors.teal400),
                    title: const Text('ICS-204: Assignment List', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: const Text('Division Charlie • Resources & Radio Plan', style: TextStyle(fontSize: 11)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('ICS-204 loaded in digital viewer.')));
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  _TabBarDelegate(this.tabBar);

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: AppColors.navy800,
      child: tabBar,
    );
  }

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => false;
}

