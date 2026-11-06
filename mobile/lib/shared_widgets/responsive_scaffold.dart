import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_colors.dart';

class ResponsiveScaffold extends StatelessWidget {
  final Widget child;
  final int selectedIndex;

  const ResponsiveScaffold({
    Key? key,
    required this.child,
    required this.selectedIndex,
  }) : super(key: key);

  void _onItemTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/network');
        break;
      case 2:
        context.go('/incidents');
        break;
      case 3:
        context.go('/pagers');
        break;
      case 4:
        context.go('/messages');
        break;
      case 5:
        context.go('/notifications');
        break;
      case 6:
        context.go('/profile');
        break;
    }
  }

  void _triggerEmergencySos(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.navy800,
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppColors.red500, size: 28),
            SizedBox(width: 8),
            Text('CONFIRM EMERGENCY SOS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
        content: const Text(
          'Broadcasting an emergency duress beacon will alert all incident commanders, dispatch terminals, and nearby two-way pagers with your high-precision coordinates.',
          style: TextStyle(color: AppColors.slate300, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.slate400)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.red600),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  backgroundColor: AppColors.red700,
                  content: Text('🚨 MAYDAY SOS BROADCAST ACTIVATED ON 915MHz MESH & SATELLITE'),
                ),
              );
            },
            child: const Text('TRANSMIT MAYDAY', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLargeScreen = MediaQuery.of(context).size.width >= 900;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.teal500,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.emergency, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('ResQLink', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, letterSpacing: -0.5)),
                Text('TACTICAL NETWORK', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.teal400, letterSpacing: 1.2)),
              ],
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.red600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              onPressed: () => _triggerEmergencySos(context),
              icon: const Icon(Icons.campaign, size: 18),
              label: const Text('SOS', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 1)),
            ),
          ),
        ],
      ),
      body: isLargeScreen
          ? Row(
              children: [
                NavigationRail(
                  selectedIndex: selectedIndex,
                  onDestinationSelected: (idx) => _onItemTapped(context, idx),
                  backgroundColor: AppColors.navy800,
                  selectedIconTheme: const IconThemeData(color: AppColors.teal400),
                  unselectedIconTheme: const IconThemeData(color: AppColors.slate400),
                  labelType: NavigationRailLabelType.all,
                  destinations: const [
                    NavigationRailDestination(icon: Icon(Icons.newspaper), label: Text('Home')),
                    NavigationRailDestination(icon: Icon(Icons.people_alt), label: Text('Network')),
                    NavigationRailDestination(icon: Icon(Icons.meeting_room), label: Text('Incidents')),
                    NavigationRailDestination(icon: Icon(Icons.speaker_phone), label: Text('Pagers')),
                    NavigationRailDestination(icon: Icon(Icons.chat_bubble), label: Text('Comms')),
                    NavigationRailDestination(icon: Icon(Icons.notifications), label: Text('Alerts')),
                    NavigationRailDestination(icon: Icon(Icons.badge), label: Text('Profile')),
                  ],
                ),
                const VerticalDivider(width: 1, thickness: 1, color: AppColors.navy600),
                Expanded(child: child),
              ],
            )
          : child,
      bottomNavigationBar: isLargeScreen
          ? null
          : NavigationBar(
              selectedIndex: selectedIndex,
              onDestinationSelected: (idx) => _onItemTapped(context, idx),
              destinations: const [
                NavigationDestination(icon: Icon(Icons.newspaper), label: 'Home'),
                NavigationDestination(icon: Icon(Icons.people_alt), label: 'Network'),
                NavigationDestination(icon: Icon(Icons.meeting_room), label: 'Incidents'),
                NavigationDestination(icon: Icon(Icons.speaker_phone), label: 'Pagers'),
                NavigationDestination(icon: Icon(Icons.chat_bubble), label: 'Comms'),
                NavigationDestination(icon: Icon(Icons.badge), label: 'Profile'),
              ],
            ),
    );
  }
}

